/**
 * @providesModule RCTRootView
 * @flow
 */
import RCTBridge from "RCTBridge";
import UIView, { FrameZero } from "UIView";
import NotificationCenter from "NotificationCenter";
import RCTDeviceInfo from "RCTDeviceInfo";
import RCTTiming from "RCTTiming";
import RCTTouchHandler from "RCTTouchHandler";
import CustomElement from "CustomElement";

import type { NativeModuleImports } from "RCTModule";

function getAvailableSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

@CustomElement("rct-root-view")
// $FlowFixMe
class RCTRootView extends UIView {
  _reactTag: number;

  bridge: RCTBridge;
  renderRoot: HTMLElement;
  moduleName: string;
  availableSize: Size;
  parent: Element;
  uiManager: *;
  timing: RCTTiming;
  ticking: boolean;
  bundleLocation: string;
  enableHotReload: boolean;

  touchHandler: RCTTouchHandler;

  initialization: Promise<void>;

  constructor(
    bundle: string,
    moduleName: string,
    parent: Element,
    enableHotReload: boolean = false,
    nativeModules: NativeModuleImports
  ) {
    super();

    this.bundleLocation = bundle;
    this.enableHotReload = enableHotReload;
    this.moduleName = moduleName;
    this.parent = parent;

    if (this.enableHotReload) {
      bundle += "&hot=true";
    }

    const bridge = new RCTBridge(moduleName, bundle, nativeModules);
    this.initialization = this.initializeBridge(bridge);
  }

  async initializeBridge(bridge: RCTBridge) {
    this.bridge = bridge;
    this.bridge.bundleFinishedLoading = this.bundleFinishedLoading.bind(this);

    await this.bridge.initializeModules();

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

    this.uiManager = this.bridge.uiManager;
    this.timing = (this.bridge.modulesByName["Timing"]: any);

    this.touchHandler = new RCTTouchHandler(this.bridge);
    this.touchHandler.attachToView(this);

    this.updateHostStyle({
      WebkitTapHighlightColor: "transparent",
      userSelect: "none",
      position: "fixed"
    });

    this.ticking = false;
  }

  get reactTag(): number {
    if (!this._reactTag) {
      this._reactTag = this.uiManager.allocateRootTag;
      this.uiManager.registerRootView(this);
    }
    return this._reactTag;
  }

  set reactTag(value: number) {}

  bundleFinishedLoading() {
    this.runApplication();
  }

  runApplication() {
    const appParameters = {
      rootTag: this.reactTag,
      initialProps: {}
    };

    this.bridge.enqueueJSCall("AppRegistry", "runApplication", [
      this.moduleName,
      appParameters
    ]);

    if (this.enableHotReload) {
      const bundleURL = new URL(this.bundleLocation);
      console.warn("HotReload on " + this.bundleLocation);
      this.bridge.enqueueJSCall("HMRClient", "enable", [
        "web",
        bundleURL.pathname.toString().substr(1),
        bundleURL.hostname,
        bundleURL.port
      ]);
    }

    this.requestTick();
  }

  requestTick() {
    if (!this.ticking) {
      window.requestAnimationFrame(this.renderLoop.bind(this));
    }
    this.ticking = true;
  }

  async renderLoop() {
    this.ticking = false;

    const frameStart = window.performance ? performance.now() : Date.now();

    await this.timing.frame();
    await this.bridge.frame();
    await this.uiManager.frame();

    await this.timing.idle(frameStart);

    if (
      this.timing.shouldContinue() ||
      this.bridge.shouldContinue() ||
      this.uiManager.shouldContinue()
    ) {
      this.requestTick();
    }
  }

  async render() {
    await this.initialization;

    this.parent.appendChild(this);
    this.bridge.loadBridgeConfig();
    this.requestTick();
  }
}

export default RCTRootView;
