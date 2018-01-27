/**
 * @providesModule ReactDom
 * @flow
 */

global.process = global.process || {};
global.process.env = global.process.env || {};
if (!global.process.env.NODE_ENV) {
  global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
}

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";

import type { NativeModuleImports } from "RCTModule";

// Register Built-in Native Modules
const builtInNativeModules: any[] = [
  require("RCTEventDispatcher"),
  require("RCTDeviceInfo"),
  require("RCTPlatform"),
  require("RCTTiming"),
  require("RCTUIManager"),
  require("RCTViewManager"),
  require("RCTTextManager"),
  require("RCTRawTextManager"),
  require("RCTScrollViewManager"),
  require("RCTScrollContentViewManager"),
  require("RCTNativeAnimatedModule"),
  require("RCTAsyncLocalStorage"),
  require("RCTImageViewManager"),
  require("RCTLinkingManager"),
  require("RCTSourceCode"),
  require("RCTTextInputManager"),
  require("RCTImageLoader"),
  require("RCTActivityIndicatorViewManager"),
  require("RCTWebSocketModule"),
  require("RCTAppState"),
  require("RCTSafeAreaViewManager"),
  require("RCTSwitchManager"),
  require("RCTStatusBarManager")
];

// Development Specific Native Modules
if (__DEV__) {
  builtInNativeModules.push(require("RCTDevLoadingView"));
  builtInNativeModules.push(require("RCTDevSettings"));
  builtInNativeModules.push(require("RCTDevMenu"));
}

type RNDomInstanceOptions = {
  enableHotReload?: boolean,
  nativeModules?: any[]
};

// React Native Web Entrypoint instance
export class RNDomInstance {
  rootView: RCTRootView;

  constructor(
    bundle: string,
    moduleName: string,
    parent: Element,
    options: RNDomInstanceOptions = {}
  ) {
    const enableHotReload = options.enableHotReload
      ? options.enableHotReload
      : false;

    const userNativeModules = options.nativeModules
      ? options.nativeModules
      : [];

    this.rootView = new RCTRootView(
      bundleFromRoot(bundle),
      moduleName,
      parent,
      enableHotReload,
      (builtInNativeModules.concat(userNativeModules): NativeModuleImports)
    );
  }

  start() {
    this.rootView.render();
  }
}
