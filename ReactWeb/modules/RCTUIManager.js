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
import type { RCTComponent } from "RCTComponent";
import RCTComponentData from "RCTComponentData";
import RCTViewManager from "RCTViewManager";
import UIView from "UIView";
import RCTRootView from "RCTRootView";
import RCTDeviceInfo from "RCTDeviceInfo";
import RCTRootShadowView from "RCTRootShadowView";
import RCTLayoutAnimationManager from "RCTLayoutAnimationManager";

import type RCTShadowView from "RCTShadowView";
import type { LayoutAnimationConfig } from "RCTLayoutAnimationManager";
import type { Frame } from "UIView";

type ShadowView = any;
type Size = { width: number, height: number };

type LayoutChange = [
  number /* reactTag*/,
  Frame /* newFrame */,
  "add" | "update" /* nodeOperation*/
];

let rootTagCounter = 0;

@RCT_EXPORT_MODULE
class RCTUIManager {
  bridge: RCTBridge;
  rootViewTags: Set<number>;
  shadowViewRegistry: Map<number, RCTShadowView>;
  viewRegistry: Map<number, UIView>;
  componentDataByName: Map<string, RCTComponentData>;
  jsResponder: ?UIView;
  layoutAnimationManager: RCTLayoutAnimationManager;

  pendingLayoutAnimation: ?{
    config: LayoutAnimationConfig,
    callback: Function,
    addedNodes: { [reactTag: number]: ?Frame },
    updatedNodes: { [reactTag: number]: ?Frame },
    removedNodes: number[]
  };

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

    this.layoutAnimationManager = new RCTLayoutAnimationManager();
    this.pendingLayoutAnimation = undefined;

    invariant(this.bridge, "Bridge must be set");
    const deviceInfoModule: RCTDeviceInfo = (this.bridge.modulesByName[
      "DeviceInfo"
    ]: any);
    deviceInfoModule.addListener(
      "didUpdateDimensions",
      this.didUpdateDimensions
    );
  }

  didUpdateDimensions = ({ window: { width, height } }: any) => {
    for (let rootViewTag of this.rootViewTags) {
      const rootView = this.viewRegistry.get(rootViewTag);

      invariant(rootView, "Root view must exist");
      invariant(rootView instanceof RCTRootView, "View must be an RCTRootView");
      this.addUIBlock(() => {
        this.setAvailableSize({ width, height }, rootView);
      });
    }
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

  /**
   * Given a reactTag from a component, find its root view, if possible.
   * Otherwise, this will give back nil.
   *
   * @param reactTag the component tag
   * @param completion the completion block that will hand over the rootView, if any.
   *
   */
  rootViewForReactTag(reactTag: number, completion: Function) {}

  purgeView(reactTag: number) {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    if (shadowView) {
      this.shadowViewRegistry.delete(reactTag);
      shadowView.purge();
    }

    this.addUIBlock((uiManager, viewRegistry) => {
      if (this.pendingLayoutAnimation != undefined) {
        this.pendingLayoutAnimation.removedNodes.push(reactTag);
      }

      const view = viewRegistry.get(reactTag);
      viewRegistry.delete(reactTag);
      view.purge();
    });
  }

  frame() {
    if (this.pendingUIBlocks.length > 0) {
      const uiBlocks = [...this.pendingUIBlocks];
      this.pendingUIBlocks = [];

      uiBlocks.forEach(block => {
        block.call(null, this, this.viewRegistry);
      });
    }

    this.rootViewTags.forEach(rootTag => {
      const rootShadowView = this.shadowViewRegistry.get(rootTag);
      if (rootShadowView != null && rootShadowView.isDirty) {
        invariant(
          rootShadowView instanceof RCTRootShadowView,
          "attempting to recalculate from shadowView that isn't root"
        );
        const layoutChanges = rootShadowView.recalculateLayout();

        if (this.pendingLayoutAnimation !== undefined) {
          this.queueAnimatedLayoutChanges(layoutChanges);
        } else {
          this.addUIBlock(() => {
            this.applyLayoutChanges(layoutChanges);
          });
        }
      }
    });

    if (this.pendingLayoutAnimation !== undefined) {
      console.log(this.pendingLayoutAnimation);
      this.pendingLayoutAnimation = undefined;
    }
  }

  queueAnimatedLayoutChanges(layoutChanges: LayoutChange[]) {
    layoutChanges.forEach(layoutChange => {
      const [reactTag, newFrame, type] = layoutChange;

      invariant(
        this.pendingLayoutAnimation,
        "Attempted to queue layout animations without a pending layout animation"
      );

      if (type === "add") {
        this.pendingLayoutAnimation.addedNodes[reactTag] = newFrame;
      } else if (type === "update") {
        this.pendingLayoutAnimation.updatedNodes[reactTag] = newFrame;
      }
    });

    this.applyLayoutChanges(layoutChanges);
  }

  applyLayoutChanges(layoutChanges: LayoutChange[]) {
    layoutChanges.forEach(layoutChange => {
      const [reactTag, newFrame] = layoutChange;
      const view = this.viewRegistry.get(reactTag);
      invariant(view, `View with reactTag ${reactTag} does not exist`);
      view.frame = newFrame;
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  measure(reactTag: number, callbackId: number) {
    const cb = this.bridge.callbackFromId(callbackId);

    let view = this.shadowViewRegistry.get(reactTag);

    if (!view || !view.previousLayout) {
      cb();
      return;
    }

    let { width: w, height: h, left: x, top: y } = view.previousLayout;

    view = view.reactSuperview;
    while (view && view.previousLayout) {
      const { left, top } = view.previousLayout;
      x += left;
      y += top;
      view = view.reactSuperview;
    }

    cb(x, y, w, h);
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
    this.addUIBlock(() => {
      this.pendingLayoutAnimation = {
        config,
        callback: this.bridge.callbackFromId(onAnimationDidEnd),
        addedNodes: {},
        updatedNodes: {},
        removedNodes: []
      };
    });
  }

  addUIBlock(block: ?Function) {
    if (block == null || this.viewRegistry == null) {
      return;
    }
    this.pendingUIBlocks.push(block);
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

    // TODO determine if should be added to UI Queue or not
    const view = this.viewRegistry.get(reactTag);
    if (view) {
      componentData.setPropsForView(updatedProps, view);
    }
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
        const tagToRemove = viewToManage.reactSubviews[indexToRemove].reactTag;
        indicesToRemove[numToMove + i] = indexToRemove;
        tagsToRemove[numToMove + i] = tagToRemove;
        tagsToDelete[i] = tagToRemove;
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

      const shadowSubView = shadowViewToManage.reactSubviews[childIndex];
      if (shadowSubView) shadowViewToManage.removeReactSubview(shadowSubView);

      this.addUIBlock((uiManager, viewRegistry) => {
        const subView = viewToManage.reactSubviews[childIndex];
        viewToManage.removeReactSubview(subView);
      });
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

    const postShadowChildren = shadowViewToManage.reactSubviews.length;

    for (let i = 0; i < tagsToDelete.length; i++) {
      this.purgeView(tagsToDelete[i]);
    }
  }

  constantsToExport() {
    const constants = {};
    const bubblingEvents = {};

    for (const [name, componentData] of this.componentDataByName) {
      const moduleConstants = {};

      moduleConstants.Manager = bridgeModuleNameForClass(
        componentData.managerClass
      );

      // Add native props
      const viewConfig = componentData.viewConfig;
      moduleConstants.NativeProps = viewConfig.propTypes;

      // TODO: Add direct events

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
      }

      constants[name] = moduleConstants;
    }

    constants["customBubblingEventTypes"] = bubblingEvents;
    constants["customDirectEventTypes"] = {}; // TODO: direct events

    return constants;
  }
}

export default RCTUIManager;
