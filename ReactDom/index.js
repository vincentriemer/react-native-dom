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

// Register Built-in Native Modules
const builtInNativeModules = [
  import("RCTEventDispatcher"),
  import("RCTDeviceInfo"),
  import("RCTPlatform"),
  import("RCTTiming"),
  import("RCTUIManager"),
  import("RCTViewManager"),
  import("RCTTextManager"),
  import("RCTRawTextManager"),
  import("RCTScrollViewManager"),
  import("RCTScrollContentViewManager"),
  import("RCTNativeAnimatedModule"),
  import("RCTAsyncLocalStorage"),
  import("RCTImageViewManager"),
  import("RCTLinkingManager"),
  import("RCTSourceCode"),
  import("RCTTextInputManager"),
  import("RCTImageLoader"),
  import("RCTActivityIndicatorViewManager"),
  import("RCTWebSocketModule"),
  import("RCTAppState"),
  import("RCTSafeAreaViewManager"),
  import("RCTSwitchManager"),
  import("RCTStatusBarManager")
];

// Development Specific Native Modules
if (__DEV__) {
  builtInNativeModules.push(import("RCTDevLoadingView"));
  builtInNativeModules.push(import("RCTDevSettings"));
  builtInNativeModules.push(import("RCTDevMenu"));
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
      builtInNativeModules.concat(userNativeModules)
    );
  }

  start() {
    this.rootView.render();
  }
}
