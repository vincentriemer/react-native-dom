/** @flow */

import invariant from "invariant";

import RCTUIManagerObserverCoordinator from "RCTUIManagerObserverCoordinator";
import RCTModule, { bridgeModuleNameForClass } from "RCTModule";
import type RCTBridge from "RCTBridge";
import { type Frame } from "InternalLib";
import UIView from "UIView";
import RCTView from "RCTView";
import RCTRootView from "RCTRootView";
import RCTDeviceInfo from "RCTDeviceInfo";
import RCTLayoutAnimationManager from "RCTLayoutAnimationManager";
import RCTComponentData from "RCTComponentData";
import CanUse from "CanUse";
import instrument from "Instrument";
import type { RCTComponent } from "RCTComponent";
import type { LayoutChange } from "RCTShadowView";
import type { LayoutAnimationConfig } from "RCTLayoutAnimationManager";
import RCTShadowView from "RCTShadowView";
import RCTRootShadowView from "RCTRootShadowView";
import RCTShadowText from "RCTShadowText";
import RCTNativeViewHierarchyOptimizer from "RCTNativeViewHierarchyOptimizer";

// type ShadowView = any;
type Size = { width: number, height: number };

let rootTagCounter = 0;

type UIBlock = (RCTUIManager, Map<number, UIView>) => void;

class RCTUIManager extends RCTModule {
  static moduleName = "RCTUIManager";

  rootViewTags: Set<number>;
  shadowViewRegistry: Map<number, RCTShadowView>;
  viewRegistry: Map<number, UIView>;
  componentDataByName: Map<string, RCTComponentData>;
  jsResponder: ?UIView;
  layoutAnimationManager: RCTLayoutAnimationManager;
  observerCoordinator: RCTUIManagerObserverCoordinator;
  nativeViewHierarchyOptimizer: RCTNativeViewHierarchyOptimizer;

  pendingUIBlocks: Array<UIBlock> = [];

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.shadowViewRegistry = new Map();
    this.viewRegistry = new Map();

    // Internal resources
    this.rootViewTags = new Set();

    // Get view managers from bridge
    this.componentDataByName = new Map();
    this.bridge.moduleClasses.forEach((moduleClass: any) => {
      if (moduleClass.__isViewManager) {
        const componentData = new RCTComponentData(moduleClass, this.bridge);
        this.componentDataByName.set(componentData.name, componentData);
      }
    });

    this.layoutAnimationManager = new RCTLayoutAnimationManager(this);
    this.observerCoordinator = new RCTUIManagerObserverCoordinator();
    this.nativeViewHierarchyOptimizer = new RCTNativeViewHierarchyOptimizer(
      this
    );

    invariant(this.bridge, "Bridge must be set");
    const deviceInfoModule: RCTDeviceInfo = (this.bridge.modulesByName[
      "DeviceInfo"
    ]: any);

    deviceInfoModule.addListener(
      "didUpdateDimensions",
      this.didUpdateDimensions
    );
  }

  didUpdateDimensions = ({ window: { width, height, scale } }: any) => {
    // this.bridge.GlobalYogaConfig.setPointScaleFactor(scale);

    for (let rootViewTag of this.rootViewTags) {
      const rootView = this.viewRegistry.get(rootViewTag);

      invariant(rootView, "Root view must exist");
      invariant(rootView instanceof RCTRootView, "View must be an RCTRootView");
      this.addUIBlock(() => {
        this.setAvailableSize({ width, height }, scale, rootView);
      });
    }

    this.requestTick();
  };

  get allocateRootTag(): number {
    const tag = rootTagCounter;
    rootTagCounter++;
    return tag * 10 + 1;
  }

  /**
   * Register a root view with the RCTUIManager.
   */
  registerRootView(rootView: RCTRootView) {
    const reactTag = rootView.reactTag;
    const availableSize = rootView.availableSize;

    // register view
    this.viewRegistry.set(reactTag, rootView);

    // register shadow view
    const shadowView = new RCTRootShadowView(this.bridge);
    shadowView.availableSize = availableSize;
    shadowView.reactTag = reactTag;
    shadowView.viewName = rootView.constructor.name;
    shadowView.isLayoutOnly = false;

    const pixelRatio = this.bridge.deviceInfo.getDevicePixelRatio();
    shadowView.updatePointScaleFactor(pixelRatio);

    this.shadowViewRegistry.set(reactTag, shadowView);
    this.rootViewTags.add(reactTag);
  }

  setAvailableSize(size: Size, scale: number, rootView: RCTRootView): void {
    rootView.width = size.width;
    rootView.height = size.height;

    const reactTag = rootView.reactTag;
    const rootShadowView = this.shadowViewRegistry.get(reactTag);
    if (rootShadowView && rootShadowView instanceof RCTRootShadowView)
      rootShadowView.updateAvailableSize(size) &&
        rootShadowView.updatePointScaleFactor(scale);
  }

  setLocalDataForView(localData: any, view: UIView) {
    const tag = view.reactTag;
    const shadowView = this.shadowViewRegistry.get(tag);
    if (shadowView == null) {
      console.warn(
        `Could not locate shadow view with tag ${tag}, this is probably caused by a temporary inconsistency between native views and shadow views.`
      );
      return;
    }
    shadowView.localData = localData;
    this.requestTick();
  }

  rootTagForReactTag(reactTag: number): number {
    let view: ?RCTShadowView = this.shadowViewRegistry.get(reactTag);
    invariant(view, `No shadow view found with tag ${reactTag}`);
    return view.rootTag;
  }

  viewNameForReactTag(reactTag: number): string {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    invariant(shadowView, `No such shadowView with id ${reactTag}`);
    return shadowView.viewName;
  }

  purgeView(reactTag: number) {
    if (this.layoutAnimationManager.isPending()) {
      const view = this.viewRegistry.get(reactTag);
      if (view && view.reactSuperview) {
        view.reactSuperview.removeReactSubview(view);
      }
      this.layoutAnimationManager.queueRemovedNode(reactTag);
    } else {
      this.addUIBlock((uiManager, viewRegistry) => {
        const view = viewRegistry.get(reactTag);
        viewRegistry.delete(reactTag);
        if (view) {
          view.purge();
        }
      });
    }
  }

  async frame() {
    this.observerCoordinator.uiManagerWillPerformLayout(this);

    this.rootViewTags.forEach((rootTag) => {
      const rootShadowView = this.shadowViewRegistry.get(rootTag);

      if (rootShadowView != null && rootShadowView.isDirty) {
        invariant(
          rootShadowView instanceof RCTRootShadowView,
          "attempting to recalculate from shadowView that isn't root"
        );

        const layoutChanges = instrument("⚛️ Layout", () =>
          rootShadowView.recalculateLayout()
        );

        this.applyLayoutChanges(layoutChanges);
      }
    });

    this.observerCoordinator.uiManagerDidPerformLayout(this);

    if (this.layoutAnimationManager.isPending()) {
      instrument("⚛️ LayoutAnimation Construction", () => {
        this.layoutAnimationManager.applyLayoutChanges();
      });
    }

    this.observerCoordinator.uiManagerWillFlushBlocks(this);

    instrument("⚛️ Style", () => {
      if (this.pendingUIBlocks.length > 0) {
        const uiBlocks = [...this.pendingUIBlocks];
        this.pendingUIBlocks = [];

        uiBlocks.forEach((block) => {
          block.call(null, this, this.viewRegistry);
        });

        this.requestTick();
      }
    });
  }

  shouldContinue(): boolean {
    return this.pendingUIBlocks.length !== 0;
  }

  requestTick() {
    this.rootViewTags.forEach((rootViewTag) => {
      const rootView = this.viewRegistry.get(rootViewTag);
      invariant(
        rootView && rootView instanceof RCTRootView,
        `RootView (with ID ${rootViewTag}) does not exist`
      );
      rootView.requestTick();
    });
  }

  applyLayoutChanges(layoutChanges: LayoutChange[]) {
    layoutChanges.forEach((layoutChange) => {
      const { reactTag, layout } = layoutChange;
      const shadowView = this.shadowViewRegistry.get(reactTag);
      invariant(shadowView, `View with reactTag ${reactTag} does not exist`);
      this.nativeViewHierarchyOptimizer.handleUpdateLayout(shadowView);
    });
    this.nativeViewHierarchyOptimizer.onBatchComplete();
  }

  updateLayout(reactTag: number, layout: Frame) {
    if (this.layoutAnimationManager.isPending()) {
      const shadowView = this.shadowViewRegistry.get(reactTag);
      invariant(
        shadowView,
        `Shadow View with reactTag ${reactTag} does not exist`
      );
      invariant(
        shadowView.measurement,
        `Shadow View with tag ${reactTag} has no measurement calculated`
      );
      this.layoutAnimationManager.addLayoutChange({
        reactTag,
        layout,
        previousMeasurement: shadowView.prevMeasurement,
        nextMeasurement: shadowView.measurement
      });
    } else {
      const view = this.viewRegistry.get(reactTag);
      invariant(view, `View with reactTag ${reactTag} does not exist`);
      view.frame = layout;
    }
  }

  measure(reactTag: number) {
    return this.$measure(reactTag);
  }

  $measure(reactTag: number, callbackId: ?number): Promise<*> {
    return new Promise((resolve, reject) => {
      this.addUIBlock(() => {
        let shadowView = this.shadowViewRegistry.get(reactTag);
        let view = this.viewRegistry.get(reactTag);

        if (!shadowView || !shadowView.measurement) {
          return resolve();
        }

        const { globalX, globalY } = shadowView.measureGlobal();

        invariant(
          shadowView.previousLayout,
          "Shadow view has no previous layout"
        );
        let { left, top, width, height } = shadowView.previousLayout;

        if (callbackId != null) {
          this.bridge.callbackFromId(callbackId)(
            left,
            top,
            width,
            height,
            globalX,
            globalY
          );
        }

        resolve({
          left,
          top,
          width,
          height,
          globalX,
          globalY
        });
      });
    });
  }

  async $measureInWindow(reactTag: number, callbackId: number) {
    // const result = await this.measure(reactTag);
    // invariant(result, `No measurement available for view ${reactTag}`);

    // TODO: Replace with calculation from shadowView tree
    const view = this.viewRegistry.get(reactTag);
    invariant(view, `No such view with tag: ${reactTag}`);

    const { left, top, width, height } = view.getBoundingClientRect();

    // const { globalX, globalY, width, height } = result;
    this.bridge.callbackFromId(callbackId)(left, top, width, height);
  }

  $setJSResponder(reactTag: number) {
    this.jsResponder = this.viewRegistry.get(reactTag);
    if (!this.jsResponder) {
      console.error(
        `Invalid view set to be the JS responder - tag ${reactTag}`
      );
    }
  }

  $clearJSResponder() {
    this.jsResponder = null;
  }

  $configureNextLayoutAnimation(
    config: LayoutAnimationConfig,
    onAnimationDidEnd: number
  ) {
    if (
      !CanUse.matchMedia ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.layoutAnimationManager.configureNext(
        config,
        this.bridge.callbackFromId(onAnimationDidEnd)
      );
    }
  }

  addUIBlock(block: ?UIBlock) {
    if (block == null || this.viewRegistry == null) {
      return;
    }
    // TODO: Determine why defering the UI blocks causes flatlist to crash
    block.call(null, this, this.viewRegistry);
    // this.pendingUIBlocks.push(block);
  }

  prependUIBlock(block: ?UIBlock) {
    if (!block) {
      return;
    }
    block.call(null, this, this.viewRegistry);
    // this.pendingUIBlocks.unshift(block);
  }

  $setChildren(containerTag: number, reactTags: Array<number>) {
    RCTUIManager.RCTSetChildren(
      containerTag,
      reactTags,
      this.shadowViewRegistry
    );

    const nodeToManage = this.shadowViewRegistry.get(containerTag);
    invariant(nodeToManage, `No such ShadowView with tag ${containerTag}`);

    if (!nodeToManage.isVirtual()) {
      this.nativeViewHierarchyOptimizer.handleSetChildren(
        nodeToManage,
        reactTags
      );
    } else {
      RCTUIManager.RCTSetChildren(containerTag, reactTags, this.viewRegistry);
    }

    // TODO: Remove
    // this.addUIBlock(
    //   (uiManager: RCTUIManager, viewRegistry: Map<number, UIView>) => {
    //     RCTUIManager.RCTSetChildren(containerTag, reactTags, viewRegistry);
    //   }
    // );
  }

  setChildren(containerTag: number, reactTags: Array<number>) {
    RCTUIManager.RCTSetChildren(containerTag, reactTags, this.viewRegistry);
  }

  static RCTSetChildren(
    containerTag: number,
    reactTags: Array<number>,
    registry: Map<number, $Subtype<RCTComponent>>
  ) {
    const container = registry.get(containerTag);
    let index = 0;
    reactTags.forEach((reactTag) => {
      const view = registry.get(reactTag);
      invariant(container, `No container view found with id: ${containerTag}`);
      invariant(view, `No view found with id: ${reactTag}`);
      container.insertReactSubviewAtIndex(view, index++);
    });
  }

  $createView(
    reactTag: number,
    viewName: string,
    rootTag: number,
    props: Object
  ) {
    const componentData = this.componentDataByName.get(viewName);
    invariant(
      componentData,
      `No component found for view with name ${viewName}`
    );

    // register shadow view
    const shadowView = componentData.createShadowView(reactTag);
    if (shadowView != null) {
      shadowView.rootTag = rootTag;
      shadowView.viewName = viewName;
      componentData.setPropsForShadowView(props, shadowView);
      this.shadowViewRegistry.set(reactTag, shadowView);
    }

    if (this.layoutAnimationManager.isPending())
      this.layoutAnimationManager.queueAddedNode(reactTag);

    if (!shadowView.isVirtual()) {
      this.nativeViewHierarchyOptimizer.handleCreateView(shadowView, props);
    } else {
      this.createView(reactTag, viewName, props);
    }

    // Shadow view is the source of truth for background color this is a little
    // bit counter-intuitive if people try to set background color when setting up
    // the view, but it's the only way that makes sense given our threading model
    // TODO: remove
    // const backgroundColor = shadowView.backgroundColor;

    // TODO: move to createView
    // Dispatch view creation directly to the main thread instead of adding to
    // UIBlocks array. This way, it doesn't get deferred until after layout.
    // const view = componentData.createView(reactTag);
    // if (view != null) {
    //   componentData.setPropsForView(props, view);

    // if (typeof view.setBackgroundColor === "function") {
    //   view.setBackgroundColor(backgroundColor);
    // }

    // this.viewRegistry.set(reactTag, view);
    // }
  }

  createView(reactTag: number, viewName: string, props: ?Object) {
    const componentData = this.componentDataByName.get(viewName);
    invariant(
      componentData,
      `No component found for view with name ${viewName}`
    );

    const view = componentData.createView(reactTag);
    if (view != null) {
      props && componentData.setPropsForView(props, view);
      this.viewRegistry.set(reactTag, view);
    }
  }

  $updateView(reactTag: number, viewName: string, updatedProps: Object) {
    const componentData = this.componentDataByName.get(viewName);
    invariant(
      componentData,
      `No component found for view with name ${viewName}`
    );

    const shadowView = this.shadowViewRegistry.get(reactTag);
    if (shadowView) {
      componentData.setPropsForShadowView(updatedProps, shadowView);
      this.nativeViewHierarchyOptimizer.handleUpdateView(
        shadowView,
        viewName,
        updatedProps
      );
    }
  }

  updateView(reactTag: number, viewName: string, updatedProps: Object) {
    const componentData = this.componentDataByName.get(viewName);
    invariant(
      componentData,
      `No component found for view with name ${viewName}`
    );

    const view = this.viewRegistry.get(reactTag);
    if (view) {
      componentData.setPropsForView(updatedProps, view);
    }
  }

  synchronouslyUpdateView(reactTag: number, viewName: string, props: Object) {
    const componentData = this.componentDataByName.get(viewName);
    invariant(
      componentData,
      `No component found for view with name ${viewName}`
    );

    const view = this.viewRegistry.get(reactTag);
    if (view) {
      // console.log("animating view", view, props);
      componentData.setPropsForView(props, view);
    }
  }

  $replaceExistingNonRootView(reactTag: number, newReactTag: number) {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    invariant(shadowView, `shadowView (for ID ${reactTag}) not found`);

    const superShadowView = shadowView.reactSuperview;
    invariant(
      superShadowView,
      `shadowView super (of ID ${reactTag}) not found`
    );

    const indexOfView = superShadowView.reactSubviews.indexOf(shadowView);
    invariant(
      indexOfView !== -1,
      "View's superview does't claim it as subview"
    );

    const removeAtIndices = [indexOfView];
    const addTags = [newReactTag];

    this.$manageChildren(
      superShadowView.reactTag,
      null,
      null,
      addTags,
      removeAtIndices,
      removeAtIndices
    );
  }

  async $findSubviewIn(
    reactTag: number,
    atPoint: [number, number],
    callbackId: number
  ) {
    const [x, y] = atPoint;
    const shadowView = this.shadowViewRegistry.get(reactTag);

    invariant(shadowView, `No such view with tag ${reactTag}`);

    const targetReactTag = shadowView.reactTagAtPoint({ x, y });

    const measurement = await this.measure(targetReactTag);

    invariant(
      measurement,
      `View with tag ${targetReactTag} has no measurement`
    );
    const { globalX, globalY, width, height } = measurement;

    this.bridge.callbackFromId(callbackId)(
      targetReactTag,
      globalX,
      globalY,
      width,
      height
    );
  }

  $manageChildren(
    tag: number,
    moveFrom: ?Array<number>,
    moveTo: ?Array<number>,
    addChildTags: Array<number>,
    addAtIndices: Array<number>,
    removeFrom: Array<number>
  ) {
    const shadowViewToManage = this.shadowViewRegistry.get(tag);

    if (!shadowViewToManage) return;

    // determine counts with checks for null
    const numToMove = !moveFrom ? 0 : moveFrom.length;

    // We treat moves as an add and a delete
    const viewsToAdd = [];
    const indicesToRemove = [];
    const tagsToRemove = [];
    const tagsToDelete = [];

    // moves are based on a series of adds after removes
    if (moveFrom && moveTo) {
      for (let i = 0; i < moveFrom.length; i++) {
        const moveFromIndex = moveFrom[i];
        const tagToMove =
          shadowViewToManage.reactSubviews[moveFromIndex].reactTag;
        viewsToAdd[i] = {
          tag: tagToMove,
          index: moveTo[i]
        };
        indicesToRemove[i] = moveFromIndex;
        tagsToRemove[i] = tagToMove;
      }
    }

    // add the rest of the adds
    if (addChildTags) {
      for (let i = 0; i < addChildTags.length; i++) {
        const viewTagToAdd = addChildTags[i];
        const indexToAddAt = addAtIndices[i];
        viewsToAdd[numToMove + i] = {
          tag: viewTagToAdd,
          index: indexToAddAt
        };
      }
    }

    // now add the required removes
    if (removeFrom) {
      for (let i = 0; i < removeFrom.length; i++) {
        const indexToRemove = removeFrom[i];
        if (shadowViewToManage.reactSubviews[indexToRemove]) {
          const tagToRemove =
            shadowViewToManage.reactSubviews[indexToRemove].reactTag;
          indicesToRemove[numToMove + i] = indexToRemove;
          tagsToRemove[numToMove + i] = tagToRemove;
          tagsToDelete[i] = tagToRemove;
        }
      }
    }

    // NB: moveFrom and removeFrom are both relative to the starting state of the View's children.
    // moveTo and addAt are both relative to the final state of the View's children.
    //
    // 1) Sort the views to add and indices to remove by index
    // 2) Iterate the indices being removed from high to low and remove them. Going high to low
    //    makes sure we remove the correct index when there are multiple to remove.
    // 3) Iterate the views being added by index low to high and add them. Like the view removal,
    //    iteration direction is important to preserve the correct index.

    viewsToAdd.sort(function(a, b) {
      return a.index - b.index;
    });
    indicesToRemove.sort(function(a, b) {
      return a - b;
    });

    // Apply changes to node hierarchy
    // removing in the order last index to first index
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const childIndex = indicesToRemove[i];

      let shadowSubView = undefined;
      if (shadowViewToManage instanceof RCTShadowText) {
        shadowSubView = shadowViewToManage.textChildren[childIndex];
      } else {
        shadowSubView = shadowViewToManage.reactSubviews[childIndex];
      }

      if (shadowSubView) {
        shadowViewToManage.removeReactSubview(shadowSubView);
        if (this.layoutAnimationManager.isPending()) {
          shadowSubView.reactSuperview = shadowViewToManage;
        }
      }

      // TODO: Remove
      // if (!this.layoutAnimationManager.isPending()) {
      //   this.addUIBlock((uiManager, viewRegistry) => {
      //     const subView = viewToManage.reactSubviews[childIndex];
      //     viewToManage.removeReactSubview(subView);
      //   });
      // }
    }

    // add the new children
    for (let i = 0; i < viewsToAdd.length; i++) {
      const { tag: tagToAdd, index: indexToAdd } = viewsToAdd[i];

      const shadowSubView = this.shadowViewRegistry.get(tagToAdd);
      if (shadowSubView) {
        shadowViewToManage.insertReactSubviewAtIndex(shadowSubView, indexToAdd);
      }

      // TODO: Remove
      // this.addUIBlock((uiManager, viewRegistry) => {
      //   const subView = viewRegistry.get(tagToAdd);
      //   invariant(
      //     subView,
      //     `Attempted to insert subview with tag ${tagToAdd} that does not exist`
      //   );
      //   viewToManage.insertReactSubviewAtIndex(subView, indexToAdd);
      // });
    }

    if (!shadowViewToManage.isVirtual()) {
      this.nativeViewHierarchyOptimizer.handleManageChildren(
        shadowViewToManage,
        indicesToRemove,
        tagsToRemove,
        viewsToAdd,
        tagsToDelete
      );
    } else {
      this.manageChildren(tag, indicesToRemove, viewsToAdd, tagsToDelete);
    }

    for (let i = 0; i < tagsToDelete.length; i++) {
      const reactTag = tagsToDelete[i];
      const shadowView = this.shadowViewRegistry.get(tagsToDelete[i]);
      if (shadowView) {
        !this.layoutAnimationManager.isPending() &&
          this.shadowViewRegistry.delete(reactTag);
        shadowView.purge();
      }
    }
  }

  manageChildren(
    tag: number,
    indicesToRemove: ?(number[]),
    viewsToAdd: ?({ tag: number, index: number }[]),
    tagsToDelete: ?(number[])
  ) {
    const viewToManage = this.viewRegistry.get(tag);
    invariant(viewToManage, `No such view found with tag ${tag}`);

    if (indicesToRemove != null) {
      for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        const indexToRemove = indicesToRemove[i];
        const viewToRemove = viewToManage.reactSubviews[indexToRemove];
        if (viewToRemove) {
          viewToManage.removeReactSubview(viewToRemove);
        }
      }
    }

    if (viewsToAdd != null) {
      for (let i = 0; i < viewsToAdd.length; i++) {
        const viewAtIndex = viewsToAdd[i];
        const viewToAdd = this.viewRegistry.get(viewAtIndex.tag);
        if (viewToAdd != null) {
          viewToManage.insertReactSubviewAtIndex(viewToAdd, viewAtIndex.index);
        }
      }
    }

    if (tagsToDelete != null) {
      for (let i = 0; i < tagsToDelete.length; i++) {
        const tagToDelete = tagsToDelete[i];
        this.purgeView(tagToDelete);
      }
    }
  }

  $dispatchViewManagerCommand(
    reactTag: number,
    commandID: number,
    commandArgs: any[]
  ) {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    invariant(shadowView, `No such shadow view with tag ${reactTag}`);

    const componentData = this.componentDataByName.get(shadowView.viewName);
    invariant(
      componentData,
      `No such componentData for name ${shadowView.viewName}`
    );

    const managerClass = componentData.managerClass;
    const module = this.bridge.moduleForClass(managerClass);

    const methodName = module.functionMap[commandID];
    const args = [reactTag, ...commandArgs];

    const manager = this.bridge.moduleForClass(managerClass);
    manager.functionMap[commandID].apply(manager, args);
  }

  $focus(reactTag: number) {
    const viewToFocus = this.viewRegistry.get(reactTag);
    invariant(viewToFocus, `No view found with react tag: ${reactTag}`);

    if (typeof viewToFocus.focus === "function") {
      viewToFocus.focus();
    } else {
      console.warn(`View with tag '${reactTag}' cannot be focused`);
    }
  }

  $blur(reactTag: number) {
    const viewToBlur = this.viewRegistry.get(reactTag);
    invariant(viewToBlur, `No view found with react tag: ${reactTag}`);

    if (typeof viewToBlur.blur === "function") {
      viewToBlur.blur();
    } else {
      console.warn(`View with tag '${reactTag}' cannot be blurred`);
    }
  }

  constantsToExport() {
    const constants = {};
    const bubblingEvents = {};
    const directEvents = {};

    for (const [name, componentData] of this.componentDataByName) {
      const moduleConstants = {};

      // Register which event-types this view dispatches.
      // React needs this for the event plugin.
      const bubblingEventTypes = {};
      const directEventTypes = {};

      // Add manager class
      moduleConstants.Manager = bridgeModuleNameForClass(
        componentData.managerClass
      );

      // Add native props
      const viewConfig = componentData.viewConfig;
      moduleConstants.NativeProps = viewConfig.propTypes;
      moduleConstants.baseModuleName = viewConfig.baseModuleName;

      // Add direct events
      for (let eventName of viewConfig.directEvents) {
        if (!directEvents[eventName]) {
          directEvents[eventName] = {
            registrationName: `on${eventName.substring(3)}`
          };
        }
        directEventTypes[eventName] = directEvents[eventName];
      }
      moduleConstants.directEventTypes = directEventTypes;

      // Add bubbling events
      for (let eventName of viewConfig.bubblingEvents) {
        if (!bubblingEvents[eventName]) {
          const bubbleName = `on${eventName.substring(3)}`;
          bubblingEvents[eventName] = {
            phasedRegistrationNames: {
              bubbled: bubbleName,
              captured: `${bubbleName}Capture`
            }
          };
        }
        bubblingEventTypes[eventName] = bubblingEvents[eventName];
      }
      moduleConstants.bubblingEventTypes = bubblingEventTypes;

      constants[name] = moduleConstants;
    }

    return constants;
  }
}

export default RCTUIManager;
