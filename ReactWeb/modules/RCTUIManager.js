// @flow
import { RCT_EXPORT_MODULE, RCT_EXPORT_METHOD } from "RCTBridge";

type View = any;
type ShadowView = any;
type Size = any;

@RCT_EXPORT_MODULE class UIManager {
  rootViewTags: Set<number> = new Set();
  shadowViewRegistry: Map<number, ShadowView> = new Map();
  viewRegistry: Map<number, View> = new Map();
  componentDataByName: Map<string, any> = new Map();

  /**
   * Register a root view with the RCTUIManager.
   */
  registerRootView(view: View) {}

  /**
   * Gets the view name associated with a reactTag.
   */
  viewNameForReactTag(reactTag: number): string {}

  /**
   * Gets the view associated with a reactTag.
   */
  viewForReactTag(reactTag: number): View {}

  /**
   * Gets the shadow view associated with a reactTag.
   */
  shadowViewForReactTag(reactTag: number): View {}

  /**
   * Set the available size (`availableSize` property) for a root view.
   * This might be used in response to changes in external layout constraints.
   * This value will be directly trasmitted to layout engine and defines how big viewport is;
   * this value does not affect root node size style properties.
   * Can be considered as something similar to `setSize:forView:` but applicable only for root view.
   */
  setAvailableSize(size: Size, rootView: View): void {}

  /**
   * Set the size of a view. This might be in response to a screen rotation
   * or some other layout event outside of the React-managed view hierarchy.
   */
  setSize(size: Size, view: View) {}

  /**
   * Set the natural size of a view, which is used when no explicit size is set.
   * Use `UIViewNoIntrinsicMetric` to ignore a dimension.
   * The `size` must NOT include padding and border.
   */
  setIntrinsicContentSize(size: Size, view: View) {}

  /**
   * Update the background color of a view. The source of truth for
   * backgroundColor is the shadow view, so if to update backgroundColor from
   * native code you will need to call this method.
   */
  setBackgroundColor(size: Size, view: View) {}

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

  constantsToExport() {
    return {};
  }
}

export default UIManager;
