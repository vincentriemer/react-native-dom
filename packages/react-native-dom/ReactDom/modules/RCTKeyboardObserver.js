/** @flow */

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

class RCTKeyboardObserver extends RCTEventEmitter {
  static moduleName = "RCTKeyboardObserver";
}

export default RCTKeyboardObserver;
