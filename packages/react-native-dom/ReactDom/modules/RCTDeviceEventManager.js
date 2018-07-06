/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import type RCTEventDispatcher from "RCTEventDispatcher";

class RCTDeviceEventManager extends RCTModule {
  static moduleName = "RCTDeviceEventManager";

  dispatcher: RCTEventDispatcher;
  shouldBlockHistory = true;

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.dispatcher = bridge.eventDispatcher;
    this.setupBackHandler();
  }

  setupBackHandler() {
    if (typeof history.pushState === "function") {
      // $FlowFixMe
      history.pushState("BackHandler", null, null);

      window.onpopstate = () => {
        if (this.shouldBlockHistory) {
          // $FlowFixMe
          history.pushState("BackHandler", null, null);
          this.dispatcher.sendDeviceEvent("hardwareBackPress");
        }
      };
    }
  }

  $invokeDefaultBackPressHandler() {
    this.shouldBlockHistory = false;
    window.history.go(-2);
  }
}

export default RCTDeviceEventManager;
