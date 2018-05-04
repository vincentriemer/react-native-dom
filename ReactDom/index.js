/**
 * @providesModule ReactDom
 * @flow
 */

// Polyfills
import "pepjs";
import "@webcomponents/webcomponentsjs/webcomponents-sd-ce";
import "web-animations-js/web-animations-next.min";

global.process = global.process || {};
global.process.env = global.process.env || {};
if (!global.process.env.NODE_ENV) {
  global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
}

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";
import type { NativeModuleImports } from "RCTModule";

// Export native modules to provide ability for others to provide their own modules
import {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync
} from "RCTBridge";
import UIView from "UIView";
import RCTView from "RCTView";
import RCTViewManager from "RCTViewManager";
import RCTEventEmitter from "RCTNativeEventEmitter";
import CustomElement from "CustomElement";

export {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync,
  RCTView,
  RCTViewManager,
  RCTEventEmitter,
  UIView,
  CustomElement
};

// Export type definitions useful for native module development
import RCTEventDispatcher from "RCTEventDispatcher";
import RCTBridge from "RCTBridge";
import _RCTUIManager from "RCTUIManager";

type RCTUIManager = $await<typeof _RCTUIManager>;

export type { RCTUIManager, RCTEventDispatcher, RCTBridge };

// Register Built-in Native Modules
const builtInNativeModules: any[] = [
  import("RCTSourceCode"),
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
  import("RCTTextInputManager"),
  import("RCTImageLoader"),
  import("RCTActivityIndicatorViewManager"),
  import("RCTWebSocketModule"),
  import("RCTAppState"),
  import("RCTSafeAreaViewManager"),
  import("RCTSwitchManager"),
  import("RCTStatusBarManager"),
  import("RCTDeviceEventManager"),
  import("RCTKeyboardObserver"),
  import("RCTExceptionsManager"),
  import("RCTRedBox"),
  import("RCTWebViewManager"),
  import("RCTNetworkingNative"),
  import("RCTBlobManager")
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
