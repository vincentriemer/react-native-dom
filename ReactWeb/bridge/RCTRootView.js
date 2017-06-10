/**
 * @providesModule RCTRootView
 * @flow
 */
import RCTBridge from "RCTBridge";
import RCTUIManager from "RCTUIManager";
import UIView, { FrameZero } from "UIView";
import NotificationCenter from "NotificationCenter";
import RCTDeviceInfo from "RCTDeviceInfo";

type Size = { width: number, height: number };

function getAvailableSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

class RCTRootView extends UIView {
  _reactTag: number;

  bridge: RCTBridge;
  renderRoot: HTMLElement;
  moduleName: string;
  availableSize: Size;

  constructor(worker: Worker, moduleName: string) {
    super(FrameZero);

    this.moduleName = moduleName;

    // initialize bridge
    this.bridge = new RCTBridge();
    this.bridge.bundleFinishedLoading = this.bundleFinishedLoading.bind(this);
    this.bridge.setThread(worker);
    this.bridge.initializeModules();

    const deviceInfoModule: RCTDeviceInfo = (this.bridge.modulesByName[
      "DeviceInfo"
    ]: any);

    const dimensions = deviceInfoModule.exportedDimensions().window;
    this.availableSize = {
      width: dimensions.width,
      height: dimensions.height,
    };
  }

  get reactTag(): number {
    if (!this._reactTag) {
      this._reactTag = (this.bridge.modulesByName[
        "UIManager"
      ]: any).allocateRootTag;
    }
    return this._reactTag;
  }

  bundleFinishedLoading() {
    this.runApplication();
  }

  runApplication() {
    const appParameters = {
      rootTag: this.reactTag,
      initialProps: {},
    };

    // console.log(`Running application: ${this.moduleName}`);
    this.bridge.enqueueJSCall("AppRegistry", "runApplication", [
      this.moduleName,
      appParameters,
    ]);
  }

  render(domElement: HTMLElement) {
    this.renderRoot = domElement;
    this.renderRoot.appendChild(this.element);
    this.bridge.loadBridgeConfig();
  }
}

export default RCTRootView;
