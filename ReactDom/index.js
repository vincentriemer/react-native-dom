/**
 * @providesModule ReactDom
 * @flow
 */

// Polyfills
import "@webcomponents/webcomponentsjs/webcomponents-sd-ce.js";
import "web-animations-js/web-animations-next.min";

global.process = global.process || {};
global.process.env = global.process.env || {};
if (!global.process.env.NODE_ENV) {
  global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
}

import RCTRootView from "./bridge/RCTRootView";
import bundleFromRoot from "./utils/BundleFromRoot";
import type { NativeModuleImports } from "./bridge/RCTModule";

// Export native modules to provide ability for others to provide their own modules
import {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise,
  RCTFunctionTypeSync
} from "./bridge/RCTBridge";
import UIView from "./base/UIView";
import RCTView from "./views/RCTView";
import RCTViewManager from "./views/RCTViewManager";
import RCTEventEmitter from "./modules/RCTEventEmitter";
import CustomElement from "./utils/CustomElement";

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
import RCTEventDispatcher from "./bridge/RCTEventDispatcher";
import RCTBridge from "./bridge/RCTBridge";
import _RCTUIManager from "./modules/RCTUIManager";

type RCTUIManager = $await<typeof _RCTUIManager>;

export type { RCTUIManager, RCTEventDispatcher, RCTBridge };

// Register Built-in Native Modules
const builtInNativeModules: any[] = [
  require("./modules/RCTSourceCode"),
  require("./bridge/RCTEventDispatcher"),
  require("./modules/RCTDeviceInfo"),
  require("./modules/RCTPlatform"),
  require("./modules/RCTTiming"),
  require("./modules/RCTUIManager"),
  require("./views/RCTViewManager"),
  require("./views/Text/RCTTextManager"),
  require("./views/Text/RCTRawTextManager"),
  require("./views/RCTScrollViewManager"),
  require("./views/RCTScrollContentViewManager"),
  require("./modules/NativeAnimation/RCTNativeAnimatedModule"),
  require("./modules/RCTAsyncLocalStorage"),
  require("./views/Image/RCTImageViewManager"),
  require("./modules/RCTLinkingManager"),
  require("./views/Text/RCTTextInputManager"),
  require("./views/Image/RCTImageLoader"),
  require("./views/RCTActivityIndicatorViewManager"),
  require("./modules/RCTWebSocketModule"),
  require("./modules/RCTAppState"),
  require("./views/SafeAreaView/RCTSafeAreaViewManager"),
  require("./views/Switch/RCTSwitchManager"),
  require("./modules/RCTStatusBarManager"),
  require("./modules/RCTDeviceEventManager"),
  require("./modules/RCTKeyboardObserver")
];

// Development Specific Native Modules
if (__DEV__) {
  builtInNativeModules.push(require("./DevSupport/RCTDevLoadingView"));
  builtInNativeModules.push(require("./modules/RCTDevSettings"));
  builtInNativeModules.push(require("./DevSupport/RCTDevMenu"));
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
