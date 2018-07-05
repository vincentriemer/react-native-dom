/** @flow */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

@RCT_EXPORT_MODULE("RCTKeyboardObserver")
class RCTKeyboardObserver extends RCTEventEmitter {}

export default RCTKeyboardObserver;
