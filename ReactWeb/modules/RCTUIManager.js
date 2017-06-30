/**
 * @providesModule RCTUIManager
 * @flow
 */
import invariant from "Invariant";
import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  bridgeModuleNameForClass,
  RCTFunctionTypeNormal,
} from "RCTBridge";
import type { RCTComponent } from "RCTComponent";
import RCTComponentData from "RCTComponentData";
import RCTViewManager from "RCTViewManager";
import UIView from "UIView";
import RCTRootView from "RCTRootView";
import RCTDeviceInfo from "RCTDeviceInfo";
import RCTRootShadowView from "RCTRootShadowView";

type ShadowView = any;
type Size = { width: number, height: number };
type LayoutChange = [number, string, number];

let rootTagCounter = 0;

@RCT_EXPORT_MODULE
class RCTUIManager {
  ticking: boolean = false;
  bridge: RCTBridge;
  rootViewTags: Set<number> = new Set();
  shadowViewRegistry: Map<number, ShadowView> = new Map();
  viewRegistry: Map<number, UIView> = new Map();
  componentDataByName: Map<string, RCTComponentData> = new Map();

  pendingUIBlocks: Array<Function> = [];

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;

    this.shadowViewRegistry = new Map();
    this.viewRegistry = new Map();

    // Internal resources
    this.rootViewTags = new Set();

    // Get view managers from bridge
    this.componentDataByName = new Map();
    this.bridge.moduleClasses.forEach(moduleClass => {
      if (moduleClass.__isViewManager) {
        const componentData = new RCTComponentData(
          (moduleClass: any),
          this.bridge
        );
        this.componentDataByName.set(componentData.name, componentData);
      }
    });

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
   * Gets the view name associated with a reactTag.
   */
  viewNameForReactTag(reactTag: number): string {
    return "";
  }

  /**
   * Gets the view associated with a reactTag.
   */
  viewForReactTag(reactTag: number): ?UIView {
    return this.viewRegistry.get(reactTag);
  }

  /**
   * Gets the shadow view associated with a reactTag.
   */
  shadowViewForReactTag(reactTag: number): ShadowView {}

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
      if (rootShadowView) rootShadowView.updateAvailableSize(size);
    });
  }

  /**
   * Set the size of a view. This might be in response to a screen rotation
   * or some other layout event outside of the React-managed view hierarchy.
   */
  setSize(size: Size, view: UIView) {}

  /**
   * Set the natural size of a view, which is used when no explicit size is set.
   * Use `UIViewNoIntrinsicMetric` to ignore a dimension.
   * The `size` must NOT include padding and border.
   */
  setIntrinsicContentSize(size: Size, view: UIView) {}

  /**
   * Update the background color of a view. The source of truth for
   * backgroundColor is the shadow view, so if to update backgroundColor from
   * native code you will need to call this method.
   */
  setBackgroundColor(size: Size, view: UIView) {}

  // addUIBlock
  // prependUIBlock
  // synchronouslyUpdateViewOnUIThread

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
        const layoutChanges = rootShadowView.recalculateLayout();
        this.addUIBlock(() => {
          this.applyLayoutChanges(layoutChanges);
        });
      }
    });
  }

  applyLayoutChanges(layoutChanges: LayoutChange[]) {
    layoutChanges.forEach(layoutChange => {
      const [reactTag, propName, value] = layoutChange;
      const view = this.viewRegistry.get(reactTag);
      (view: any)[propName] = value;
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  configureNextLayoutAnimation(config, onAnimationDidEnd) {
    console.log(config, onAnimationDidEnd);
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
          index: moveTo[i],
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
          index: indexToAddAt,
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

    for (const [name, componentData] of this.componentDataByName) {
      const moduleConstants = {};

      moduleConstants.Manager = bridgeModuleNameForClass(
        componentData.managerClass
      );

      const viewConfig = componentData.viewConfig;
      moduleConstants.NativeProps = viewConfig.propTypes;

      // Add direct events
      // Add bubbling events

      constants[name] = moduleConstants;
    }

    return constants;
  }
}

export default RCTUIManager;
