/**
 * @providesModule RCTUIManager
 * @flow
 */

import invariant from "Invariant";
import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  bridgeModuleNameForClass,
  RCTFunctionTypeNormal
} from "RCTBridge";
import RCTComponentData from "RCTComponentData";
import RCTViewManager from "RCTViewManager";
import UIView from "UIView";
import RCTView from "RCTView";
import RCTRootView from "RCTRootView";
import RCTDeviceInfo from "RCTDeviceInfo";
import RCTRootShadowView from "RCTRootShadowView";
import RCTLayoutAnimationManager from "RCTLayoutAnimationManager";
import RCTUIManagerObserverCoordinator from "RCTUIManagerObserverCoordinator";
import RCTShadowText from "RCTShadowText";
import { GlobalConfig } from "yoga-js";
import CanUse from "CanUse";

import type { RCTComponent } from "RCTComponent";
import type RCTShadowView, { LayoutChange } from "RCTShadowView";
import type { LayoutAnimationConfig } from "RCTLayoutAnimationManager";

type ShadowView = any;
type Size = { width: number, height: number };

let rootTagCounter = 0;

function byPosition(a, b) {
  if (a === b) return 0;
  if (!a.compareDocumentPosition) {
    return b.sourceIndex - a.sourceIndex;
  }
  if (a.compareDocumentPosition(b) & 2) {
    return -1;
  }
  return 1;
}

// Doesn't get more hacky than this folks
function reactViewFromPoint(topView: RCTView, x: number, y: number) {
  var element,
    elements = [];
  var old_visibility = [];
  while (true) {
    element = document.elementFromPoint(x, y);
    if (!element || element === document.documentElement) {
      break;
    }
    elements.push(element);
    old_visibility.push(element.style.visibility);
    element.style.visibility = "hidden"; // Temporarily hide the element (without changing the layout)
  }
  for (var k = 0; k < elements.length; k++) {
    elements[k].style.visibility = old_visibility[k];
  }

  elements = elements.filter(elem => topView.contains(elem) && elem.reactTag);
  elements.sort(byPosition);

  return elements[0];
}

@RCT_EXPORT_MODULE("RCTUIManager")
class RCTUIManager {
  bridge: RCTBridge;
  rootViewTags: Set<number>;
  shadowViewRegistry: Map<number, RCTShadowView>;
  viewRegistry: Map<number, UIView>;
  componentDataByName: Map<string, RCTComponentData>;
  jsResponder: ?UIView;
  layoutAnimationManager: RCTLayoutAnimationManager;
  observerCoordinator: RCTUIManagerObserverCoordinator;

  pendingUIBlocks: Array<Function> = [];

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;

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
    GlobalConfig.setPointScaleFactor(scale);

    for (let rootViewTag of this.rootViewTags) {
      const rootView = this.viewRegistry.get(rootViewTag);

      invariant(rootView, "Root view must exist");
      invariant(rootView instanceof RCTRootView, "View must be an RCTRootView");
      this.addUIBlock(() => {
        this.setAvailableSize({ width, height }, rootView);
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
    const shadowView = new RCTRootShadowView();
    shadowView.availableSize = availableSize;
    shadowView.reactTag = reactTag;
    shadowView.backgroundColor = rootView.backgroundColor;
    shadowView.viewName = rootView.constructor.name;

    this.shadowViewRegistry.set(reactTag, shadowView);
    this.rootViewTags.add(reactTag);
  }

  /**
   * Set the available size (`availableSize` property) for a root view.
   * This might be used in response to changes in external layout constraints.
   * This value will be directly trasmitted to layout engine and defines how big viewport is;
   * this value does not affect root node size style properties.
   * Can be considered as something similar to `setSize:forView:` but applicable only for root view.
   */
  setAvailableSize(size: Size, rootView: RCTRootView): void {
    this.pendingUIBlocks.push(() => {
      const reactTag = rootView.reactTag;
      const rootShadowView = this.shadowViewRegistry.get(reactTag);
      if (rootShadowView && rootShadowView instanceof RCTRootShadowView)
        rootShadowView.updateAvailableSize(size);
    });
  }

  setLocalDataForView(localData: any, view: UIView) {
    const tag = view.reactTag;
    const shadowView = this.shadowViewRegistry.get(tag);
    if (shadowView == null) {
      console.warn(
        `Could not locate shadow view with tag ${
          tag
        }, this is probably caused by a temporary inconsistency between native views and shadow views.`
      );
      return;
    }
    shadowView.localData = localData;
    this.requestTick();
  }

  /**
   * Given a reactTag from a component, find its root view, if possible.
   * Otherwise, this will give back nil.
   *
   * @param reactTag the component tag
   * @param completion the completion block that will hand over the rootView, if any.
   *
   */
  rootViewForReactTag(reactTag: number, completion: Function) {}

  viewNameForReactTag(reactTag: number): string {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    invariant(shadowView, `No such shadowView with id ${reactTag}`);
    return shadowView.viewName;
  }

  purgeView(reactTag: number) {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    if (shadowView) {
      this.shadowViewRegistry.delete(reactTag);
      shadowView.purge();
    }

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
        view.purge();
      });
    }
  }

  frame() {
    this.observerCoordinator.uiManagerWillPerformLayout(this);

    this.rootViewTags.forEach(rootTag => {
      const rootShadowView = this.shadowViewRegistry.get(rootTag);
      if (rootShadowView != null && rootShadowView.isDirty) {
        invariant(
          rootShadowView instanceof RCTRootShadowView,
          "attempting to recalculate from shadowView that isn't root"
        );

        const layoutChanges = rootShadowView.recalculateLayout();
        if (this.layoutAnimationManager.isPending()) {
          this.layoutAnimationManager.addLayoutChanges(layoutChanges);
        } else {
          this.applyLayoutChanges(layoutChanges);
        }
      }
    });

    this.observerCoordinator.uiManagerDidPerformLayout(this);

    if (this.layoutAnimationManager.isPending()) {
      this.layoutAnimationManager.applyLayoutChanges();
    }

    this.observerCoordinator.uiManagerWillFlushBlocks(this);

    if (this.pendingUIBlocks.length > 0) {
      const uiBlocks = [...this.pendingUIBlocks];
      this.pendingUIBlocks = [];

      uiBlocks.forEach(block => {
        block.call(null, this, this.viewRegistry);
      });
      this.requestTick();
    }
  }

  shouldContinue(): boolean {
    return this.pendingUIBlocks.length !== 0;
  }

  requestTick() {
    this.rootViewTags.forEach(rootViewTag => {
      const rootView = this.viewRegistry.get(rootViewTag);
      invariant(
        rootView && rootView instanceof RCTRootView,
        `RootView (with ID ${rootViewTag}) does not exist`
      );
      rootView.requestTick();
    });
  }

  applyLayoutChanges(layoutChanges: LayoutChange[]) {
    layoutChanges.forEach(layoutChange => {
      const { reactTag, layout } = layoutChange;
      const view = this.viewRegistry.get(reactTag);
      invariant(view, `View with reactTag ${reactTag} does not exist`);
      view.frame = layout;
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  measure(reactTag: number, callbackId: ?number) {
    let shadowView = this.shadowViewRegistry.get(reactTag);
    let view = this.viewRegistry.get(reactTag);

    if (!shadowView || !shadowView.measurement) {
      return;
    }

    let {
      /*left: globalX, top: globalY, */ width,
      height
    } = shadowView.measurement;

    const { left: globalX, top: globalY } = view.getBoundingClientRect();

    invariant(shadowView.previousLayout, "Shadow view has no previous layout");
    let { left, top } = shadowView.previousLayout;

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

    return {
      left,
      top,
      width,
      height,
      globalX,
      globalY
    };
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  setJSResponder(reactTag: number) {
    this.addUIBlock(() => {
      this.jsResponder = this.viewRegistry.get(reactTag);
      if (!this.jsResponder) {
        console.error(
          `Invalid view set to be the JS responder - tag ${reactTag}`
        );
      }
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  clearJSResponder() {
    this.jsResponder = null;
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  configureNextLayoutAnimation(
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

  addUIBlock(block: ?Function) {
    if (block == null || this.viewRegistry == null) {
      return;
    }
    block.call(null, this, this.viewRegistry);
    // this.pendingUIBlocks.push(block);
  }

  prependUIBlock(block: ?Function) {
    if (!block) {
      return;
    }
    this.pendingUIBlocks.unshift(block);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  setChildren(containerTag: number, reactTags: Array<number>) {
    RCTUIManager.RCTSetChildren(
      containerTag,
      reactTags,
      this.shadowViewRegistry
    );

    this.addUIBlock(
      (uiManager: RCTUIManager, viewRegistry: Map<number, UIView>) => {
        RCTUIManager.RCTSetChildren(containerTag, reactTags, viewRegistry);
      }
    );
  }

  static RCTSetChildren(
    containerTag: number,
    reactTags: Array<number>,
    registry: Map<number, $Subtype<RCTComponent>>
  ) {
    const container = registry.get(containerTag);
    let index = 0;
    reactTags.forEach(reactTag => {
      const view = registry.get(reactTag);
      invariant(container, `No container view found with id: ${containerTag}`);
      invariant(view, `No view found with id: ${reactTag}`);
      container.insertReactSubviewAtIndex(view, index++);
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  createView(
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
      shadowView.viewName = viewName;
      componentData.setPropsForShadowView(props, shadowView);
      this.shadowViewRegistry.set(reactTag, shadowView);
    }

    // Shadow view is the source of truth for background color this is a little
    // bit counter-intuitive if people try to set background color when setting up
    // the view, but it's the only way that makes sense given our threading model
    const backgroundColor = shadowView.backgroundColor;

    // Dispatch view creation directly to the main thread instead of adding to
    // UIBlocks array. This way, it doesn't get deferred until after layout.
    const view = componentData.createView(reactTag);
    if (view != null) {
      componentData.setPropsForView(props, view);

      if (typeof view.setBackgroundColor === "function") {
        view.setBackgroundColor(backgroundColor);
      }

      // TODO: investigate usage of reactBridgeDidFinishTransaction

      this.viewRegistry.set(reactTag, view);
    }
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  updateView(reactTag: number, viewName: string, updatedProps: Object) {
    const componentData = this.componentDataByName.get(viewName);
    invariant(
      componentData,
      `No component found for view with name ${viewName}`
    );

    const shadowView = this.shadowViewRegistry.get(reactTag);
    if (shadowView) {
      componentData.setPropsForShadowView(updatedProps, shadowView);
    }

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
      componentData.setPropsForView(props, view);
    }
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  replaceExistingNonRootView(reactTag: number, newReactTag: number) {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    invariant(shadowView, `shadowView (for ID ${reactTag}) not found`);

    const superShadowView = shadowView.reactSuperview;
    if (!superShadowView) {
      invariant(false, `shadowView super (of ID ${reactTag}) not found`);
      return;
    }

    const indexOfView = superShadowView.reactSubviews.indexOf(shadowView);
    invariant(
      indexOfView !== -1,
      "View's superview does't claim it as subview"
    );

    const removeAtIndices = [indexOfView];
    const addTags = [newReactTag];

    this.manageChildren(
      superShadowView.reactTag,
      null,
      null,
      addTags,
      removeAtIndices,
      removeAtIndices
    );
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  findSubviewIn(
    reactTag: number,
    atPoint: [number, number],
    callbackId: number
  ) {
    const [x, y] = atPoint;
    const view = this.viewRegistry.get(reactTag);

    const target = reactViewFromPoint(view, x, y);

    const { globalX, globalY, width, height } = this.measure(target.reactTag);

    this.bridge.callbackFromId(callbackId)(
      target.reactTag,
      globalX,
      globalY,
      width,
      height
    );
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  manageChildren(
    tag: number,
    moveFrom: ?Array<number>,
    moveTo: ?Array<number>,
    addChildTags: Array<number>,
    addAtIndices: Array<number>,
    removeFrom: Array<number>
  ) {
    const viewToManage = this.viewRegistry.get(tag);
    const shadowViewToManage = this.shadowViewRegistry.get(tag);

    if (!viewToManage || !shadowViewToManage) return;

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
        const tagToMove = viewToManage.reactSubviews[moveFromIndex].reactTag;
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
        if (viewToManage.reactSubviews[indexToRemove]) {
          const tagToRemove =
            viewToManage.reactSubviews[indexToRemove].reactTag;
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

      if (shadowSubView) shadowViewToManage.removeReactSubview(shadowSubView);

      if (!this.layoutAnimationManager.isPending()) {
        this.addUIBlock((uiManager, viewRegistry) => {
          const subView = viewToManage.reactSubviews[childIndex];
          viewToManage.removeReactSubview(subView);
        });
      }
    }

    // add the new children
    for (let i = 0; i < viewsToAdd.length; i++) {
      const { tag: tagToAdd, index: indexToAdd } = viewsToAdd[i];

      const shadowSubView = this.shadowViewRegistry.get(tagToAdd);
      if (shadowSubView) {
        shadowViewToManage.insertReactSubviewAtIndex(shadowSubView, indexToAdd);
        shadowSubView.makeDirty();
      }

      this.addUIBlock((uiManager, viewRegistry) => {
        const subView = viewRegistry.get(tagToAdd);
        viewToManage.insertReactSubviewAtIndex(subView, indexToAdd);
      });
    }

    for (let i = 0; i < tagsToDelete.length; i++) {
      this.purgeView(tagsToDelete[i]);
    }
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  focus(reactTag: number) {}

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  blur(reactTag: number) {}

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
