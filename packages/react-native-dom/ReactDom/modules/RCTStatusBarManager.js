/** @flow */

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

class RCTStatusBarManager extends RCTEventEmitter {
  static moduleName = "RCTStatusBarManager";

  supportedEvents() {
    return ["statusBarFrameDidChange", "statusBarFrameWillChange"];
  }

  $getHeight(callbackId: number) {
    this.bridge.callbackFromId(callbackId)({ height: 0 });
  }

  $setStyle() {
    /* no-op */
  }

  $setHidden() {
    /* no-op */
  }

  $setNetworkActivityIndicatorVisible() {
    /* no-op */
  }

  constantsToExport() {
    return {
      HEIGHT: 0
    };
  }
}

export default RCTStatusBarManager;
