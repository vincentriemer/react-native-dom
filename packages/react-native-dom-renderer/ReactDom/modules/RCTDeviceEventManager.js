/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import type RCTEventDispatcher from "RCTEventDispatcher";
import type RCTHistory from "RCTHistory";

class RCTDeviceEventManager extends RCTModule {
  static moduleName = "RCTDeviceEventManager";

  dispatcher: RCTEventDispatcher;
  history: RCTHistory;

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.dispatcher = bridge.eventDispatcher;
    this.history = bridge.getModuleByName("History");
    this.setupBackHandler();
  }

  // TODO: Determine if this is necessary or not
  setupBackHandler() {
    //   this.history.listen((location, action) => {
    //     if (action === "POP") {
    //       this.dispatcher.sendDeviceEvent("hardwareBackPress");
    //     }
    //   });
  }

  $invokeDefaultBackPressHandler() {
    this.history.$goBack();
  }
}

export default RCTDeviceEventManager;
