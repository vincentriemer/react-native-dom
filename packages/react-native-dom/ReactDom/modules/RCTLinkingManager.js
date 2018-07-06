/** @flow */

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

class RCTLinkingManager extends RCTEventEmitter {
  static moduleName = "RCTLinkingManager";

  // TODO: URL Events

  async $$openURL(url: string) {
    window.location = new URL(url, window.location).toString();
    return true;
  }

  async $$canOpenURL(url: string) {
    return true;
  }

  async $$getInitialURL() {
    return location.href;
  }
}

export default RCTLinkingManager;
