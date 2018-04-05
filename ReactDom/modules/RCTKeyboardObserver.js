/**
 * @providesModule RCTKeyboardObserver
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "../bridge/RCTBridge";
import RCTEventEmitter from "./RCTEventEmitter";

@RCT_EXPORT_MODULE("RCTKeyboardObserver")
class RCTKeyboardObserver extends RCTEventEmitter {}

export default RCTKeyboardObserver;
