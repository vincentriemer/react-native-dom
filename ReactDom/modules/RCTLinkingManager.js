/**
 * @providesModule RCTLinkingManager
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypePromise
} from "../bridge/RCTBridge";
import RCTEventEmitter from "./RCTEventEmitter";

const initialURL = location.href;

@RCT_EXPORT_MODULE("RCTLinkingManager")
class RCTLinkingManager extends RCTEventEmitter {
  // TODO: URL Events

  @RCT_EXPORT_METHOD(RCTFunctionTypePromise)
  openURL(url: string, resolveId: number, rejectId: number) {
    window.location = new URL(url, window.location).toString();
    this.bridge.callbackFromId(resolveId)(true);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypePromise)
  canOpenURL(url: string, resolveId: number, rejectId: number) {
    this.bridge.callbackFromId(resolveId)(true);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypePromise)
  getInitialURL(resolveId: number, rejectId: number) {
    this.bridge.callbackFromId(resolveId)(initialURL);
  }
}

export default RCTLinkingManager;
