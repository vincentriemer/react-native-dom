/**
 * @providesModule RCTUIManager
 * @flow
 */
import invariant from "Invariant";
import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  bridgeModuleNameForClass,
} from "RCTBridge";
import RCTComponentData from "RCTComponentData";
import RCTViewManager from "RCTViewManager";
import UIView from "UIView";
import RCTRootView from "RCTRootView";
import RCTDeviceInfo from "RCTDeviceInfo";

type ShadowView = any;
type Size = { width: number, height: number };

let rootTagCounter = 1;

@RCT_EXPORT_MODULE
class RCTUIManager {
  bridge: ?RCTBridge;
  rootViewTags: Set<number> = new Set();
  shadowViewRegistry: Map<number, ShadowView> = new Map();
  viewRegistry: Map<number, UIView> = new Map();
  componentDataByName: Map<string, RCTComponentData> = new Map();

  didUpdateDimensions = ({ window: { width, height } }: any) => {
    for (let rootViewTag of this.rootViewTags) {
      const rootView = this.viewRegistry.get(rootViewTag);

      invariant(rootView, "Root view must exist");
      invariant(rootView instanceof RCTRootView, "View must be an RCTRootView");
      this.setAvailableSize({ width, height }, rootView);
    }
  };

  setBridge(bridge: RCTBridge) {
    this.bridge = bridge;

    this.shadowViewRegistry = new Map();
    this.viewRegistry = new Map();

    // Internal resources
    this.rootViewTags = new Set();

    // Get view managers from bridge
    this.componentDataByName = new Map();
    this.bridge.moduleClasses.forEach(moduleClass => {
      if (moduleClass.__isViewManager) {
        invariant(this.bridge, "bridge must be set");
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

  get allocateRootTag(): number {
    const tag = rootTagCounter;
    rootTagCounter++;
    return tag;
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
    (async () => {})();
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
    const reactTag = rootView.reactTag;
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
