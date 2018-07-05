/** @flow */

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

@RCT_EXPORT_MODULE("RCTStatusBarManager")
class RCTStatusBarManager extends RCTEventEmitter {
  constructor(bridge: RCTBridge) {
    super(bridge);
  }

  supportedEvents() {
    return ["statusBarFrameDidChange", "statusBarFrameWillChange"];
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  getHeight(callbackId: number) {
    this.bridge.callbackFromId(callbackId)({
      height: 0
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  setStyle() {
    /* no-op */
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  setHidden() {
    /* no-op */
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  setNetworkActivityIndicatorVisible() {
    /* no-op */
  }

  constantsToExport() {
    return {
      HEIGHT: 0
    };
  }
}

export default RCTStatusBarManager;
