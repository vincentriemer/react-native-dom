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
import RCTTouchHandler from "RCTTouchHandler";
import CustomElement from "CustomElement";
import { GlobalConfig } from "yoga-js";

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
  ticking: boolean;
  bundleLocation: string;
  enableHotReload: boolean;

  touchHandler: RCTTouchHandler;

  constructor(
    bundle: string,
    moduleName: string,
    parent: Element,
    enableHotReload: boolean = false
  ) {
    super();

    this.bundleLocation = bundle;
    this.enableHotReload = enableHotReload;
    this.moduleName = moduleName;
    this.parent = parent;

    if (this.enableHotReload) {
      bundle += "&hot=true";
    }

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

    const pixelRatio = deviceInfoModule.getDevicePixelRatio();
    GlobalConfig.setPointScaleFactor(pixelRatio);

    this.uiManager = (this.bridge.modulesByName["UIManager"]: any);
    this.timing = (this.bridge.modulesByName["Timing"]: any);

    this.touchHandler = new RCTTouchHandler(this.bridge);
    this.touchHandler.attachToView(this);

    // $FlowFixMe
    Object.assign(this.style, {
      WebkitTapHighlightColor: "transparent",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      userSelect: "none"
    });

    // this.style.position = "fixed";

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

  renderLoop() {
    this.ticking = false;

    this.timing.frame();
    this.bridge.frame();
    this.uiManager.frame();

    if (
      this.timing.shouldContinue() ||
      this.bridge.shouldContinue() ||
      this.uiManager.shouldContinue()
    ) {
      this.requestTick();
    }
  }

  render() {
    this.parent.appendChild(this);
    this.bridge.loadBridgeConfig();
    this.requestTick();
  }
}

export default RCTRootView;
