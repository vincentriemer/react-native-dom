/**
 * @providesModule ReactDom
 * @flow
 */

import "pepjs";
import "@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce";
import "web-animations-js/web-animations-next.min";

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";
import type { NativeModuleImports } from "RCTModule";
import RCTBridge, {
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";
import UIView from "UIView";
import RCTView from "RCTView";
import RCTViewManager from "RCTViewManager";
import RCTEventEmitter from "RCTNativeEventEmitter";
import CustomElement from "CustomElement";
import RCTEventDispatcher from "RCTEventDispatcher";
import _RCTUIManager from "RCTUIManager";

declare var __DEV__: boolean;

global.process = global.process || {};
global.process.env = global.process.env || {};
if (!global.process.env.NODE_ENV) {
  global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
}

// Export native modules to provide ability for others to provide their own modules
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

type RCTUIManager = $await<typeof _RCTUIManager>;

// Export type definitions useful for native module development
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
  import("RCTBlobManager"),
  import("RCTVibration")
];

// Development Specific Native Modules
if (__DEV__) {
  builtInNativeModules.push(require("RCTDevLoadingView"));
  builtInNativeModules.push(require("RCTDevSettings"));
  builtInNativeModules.push(require("RCTDevMenu"));
}

type RNDomInstanceOptions = {
  enableHotReload?: boolean,
  nativeModules?: any[],
  bundleFromRoot?: boolean
};

// React Native Web Entrypoint instance
export class RNDomInstance {
  rootView: RCTRootView;

  constructor(
    bundle: string,
    moduleName: string,
    parent: HTMLElement,
    options: RNDomInstanceOptions = {}
  ) {
    const enableHotReload = options.enableHotReload
      ? options.enableHotReload
      : false;

    const userNativeModules = options.nativeModules
      ? options.nativeModules
      : [];

    const shouldBundleFromRoot = options.bundleFromRoot
      ? options.bundleFromRoot
      : true;

    this.rootView = new RCTRootView(
      shouldBundleFromRoot ? bundleFromRoot(bundle) : bundle,
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
