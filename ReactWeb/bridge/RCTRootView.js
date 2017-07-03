/**
 * @providesModule RCTRootView
 * @flow
 */
import RCTBridge from "RCTBridge";
import RCTUIManager from "RCTUIManager";
import UIView, { FrameZero } from "UIView";
import NotificationCenter from "NotificationCenter";
import RCTDeviceInfo from "RCTDeviceInfo";
import RCTTiming from "RCTTiming";
import CustomElement from "CustomElement";

type Size = { width: number, height: number };

function getAvailableSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

@CustomElement("rct-root-view")
class RCTRootView extends UIView {
  _reactTag: number;

  bridge: RCTBridge;
  renderRoot: HTMLElement;
  moduleName: string;
  availableSize: Size;
  parent: Element;
  uiManager: RCTUIManager;
  timing: RCTTiming;

  constructor(bundle: string, moduleName: string, parent: Element) {
    super();

    this.moduleName = moduleName;
    this.parent = parent;

    // initialize bridge
    this.bridge = new RCTBridge(moduleName, bundle);
    this.bridge.bundleFinishedLoading = this.bundleFinishedLoading.bind(this);
    this.bridge.initializeModules();

    const deviceInfoModule: RCTDeviceInfo = (this.bridge.modulesByName[
      "DeviceInfo"
    ]: any);

    const dimensions = deviceInfoModule.exportedDimensions().window;
    this.availableSize = {
      width: dimensions.width,
      height: dimensions.height
    };

    this.width = this.availableSize.width;
    this.height = this.availableSize.height;

    this.uiManager = (this.bridge.modulesByName["UIManager"]: any);
    this.timing = (this.bridge.modulesByName["Timing"]: any);
  }

  get reactTag(): number {
    if (!this._reactTag) {
      this._reactTag = this.uiManager.allocateRootTag;
      this.uiManager.registerRootView(this);
    }
    return this._reactTag;
  }

  bundleFinishedLoading() {
    this.runApplication();
  }

  runApplication() {
    const appParameters = {
      rootTag: this.reactTag,
      initialProps: {}
    };

    // console.log(`Running application: ${this.moduleName}`);
    this.bridge.enqueueJSCall("AppRegistry", "runApplication", [
      this.moduleName,
      appParameters
    ]);
  }

  frame() {
    this.timing.frame();
    this.bridge.frame();
    this.uiManager.frame();

    window.requestAnimationFrame(this.frame.bind(this));
  }

  render() {
    this.parent.appendChild(this);
    this.bridge.loadBridgeConfig();
    this.frame();
  }
}

export default RCTRootView;
