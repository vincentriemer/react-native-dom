/**
 * @providesModule RCTDeviceEventManager
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";

import type RCTEventDispatcher from "RCTEventDispatcher";

@RCT_EXPORT_MODULE("RCTDeviceEventManager")
export default class RCTDeviceEventManager {
  dispatcher: RCTEventDispatcher;
  shouldBlockHistory = true;

  constructor(bridge: RCTBridge) {
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

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  invokeDefaultBackPressHandler() {
    this.shouldBlockHistory = false;
    window.history.go(-2);
  }
}
