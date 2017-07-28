// @flow
import "proxy-polyfill";

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";

// Register Built-in Native Modules
require("RCTEventDispatcher");
require("RCTDeviceInfo");
require("RCTPlatform");
require("RCTTiming");
require("RCTUIManager");
require("RCTViewManager");
require("RCTTextManager");
require("RCTRawTextManager");
require("RCTScrollViewManager");
require("RCTNativeAnimatedModule");
require("RCTAsyncLocalStorage");
require("RCTImageViewManager");
require("RCTLinkingManager");

// React Native Web Entrypoint instance
export class RNWebInstance {
  rootView: RCTRootView;

  constructor(bundle: string, moduleName: string, parent: Element) {
    this.rootView = new RCTRootView(bundleFromRoot(bundle), moduleName, parent);
  }

  start() {
    this.rootView.render();
  }
}
