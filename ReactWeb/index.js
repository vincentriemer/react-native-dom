// @flow
import "proxy-polyfill";

import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";

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
