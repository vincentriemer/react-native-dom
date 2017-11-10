/**
 * @providesModule ReactWeb
 * @flow
 */
import "proxy-polyfill";

global.process = global.process || {};
global.process.env = global.process.env || {};
if (!global.process.env.NODE_ENV) {
  global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
}

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";

// Register Built-in Native Modules
import "RCTEventDispatcher";
import "RCTDeviceInfo";
import "RCTPlatform";
import "RCTTiming";
import "RCTUIManager";
import "RCTViewManager";
import "RCTTextManager";
import "RCTRawTextManager";
import "RCTScrollViewManager";
import "RCTNativeAnimatedModule";
import "RCTAsyncLocalStorage";
import "RCTImageViewManager";
import "RCTLinkingManager";
import "RCTSourceCode";
import "RCTTextInputManager";
import "RCTImageLoader";
import "RCTActivityIndicatorViewManager";
import "RCTWebSocketModule";
import "RCTAppState";
import "RCTDevLoadingView";
import "RCTSafeAreaViewManager";

// React Native Web Entrypoint instance
export class RNWebInstance {
  rootView: RCTRootView;

  constructor(
    bundle: string,
    moduleName: string,
    parent: Element,
    enableHotReload?: boolean
  ) {
    this.rootView = new RCTRootView(
      bundleFromRoot(bundle),
      moduleName,
      parent,
      enableHotReload
    );
  }

  start() {
    this.rootView.render();
  }
}
