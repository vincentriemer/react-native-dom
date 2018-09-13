/** @flow */

import "pepjs";
import "@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce";
import "web-animations-js/web-animations-next.min";

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";
import type { NativeModuleImports } from "RCTModule";
import type RCTUIManager from "RCTUIManager";
import RCTBridge from "RCTBridge";
import UIView from "UIView";
import RCTView from "RCTView";
import RCTModule from "RCTModule";
import RCTViewManager from "RCTViewManager";
import RCTEventEmitter from "RCTNativeEventEmitter";
import RCTEventDispatcher, { type RCTEvent } from "RCTEventDispatcher";

declare var __DEV__: boolean;

global.process = global.process || {};
global.process.env = global.process.env || {};
if (!global.process.env.NODE_ENV) {
  global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
}

// Export native modules to provide ability for others to provide their own modules
export {
  RCTView,
  RCTViewManager,
  RCTEventEmitter,
  UIView,
  RCTRootView,
  RCTModule
};

// Export type definitions useful for native module development
export type { RCTEventDispatcher, RCTBridge, RCTEvent, RCTUIManager };

// Register Built-in Native Modules
const builtInNativeModules: any[] = [
  require("RCTHistory"),
  require("RCTSourceCode"),
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
  require("RCTTextInputManager"),
  require("RCTImageLoader"),
  require("RCTActivityIndicatorViewManager"),
  require("RCTWebSocketModule"),
  require("RCTAppState"),
  require("RCTSafeAreaViewManager"),
  require("RCTSwitchManager"),
  require("RCTStatusBarManager"),
  require("RCTDeviceEventManager"),
  require("RCTKeyboardObserver"),
  require("RCTExceptionsManager"),
  require("RCTRedBox"),
  require("RCTWebViewManager"),
  require("RCTNetworkingNative"),
  require("RCTBlobManager"),
  require("RCTVibration"),
  require("RCTI18nManager")
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
  bundleFromRoot?: boolean,
  urlScheme?: string,
  basename?: string
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
    const enableHotReload = options.enableHotReload ?? false;
    const userNativeModules = options.nativeModules ?? [];
    const shouldBundleFromRoot = options.bundleFromRoot ?? true;
    const urlScheme = options.urlScheme ?? moduleName.toLowerCase();
    const basename = options.basename ?? "";

    this.rootView = new RCTRootView(
      shouldBundleFromRoot ? bundleFromRoot(bundle) : bundle,
      moduleName,
      parent,
      enableHotReload,
      urlScheme,
      basename,
      (builtInNativeModules.concat(userNativeModules): NativeModuleImports)
    );
  }

  start() {
    this.rootView.render();
  }
}
