/** @flow */

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

let hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
  // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
  // $FlowFixMe: libdef
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
  // $FlowFixMe: libdef
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

class RCTAppState extends RCTEventEmitter {
  static moduleName = "RCTAppState";

  startObserving() {
    document.addEventListener(
      visibilityChange,
      this.didUpdateVisibility,
      false
    );
  }

  stopObserving() {
    document.removeEventListener(
      visibilityChange,
      this.didUpdateVisibility,
      false
    );
  }

  currentBackgroundState() {
    // $FlowFixMe
    if (document[hidden] == null) {
      return "unknown";
    }
    if (document[hidden]) {
      return "background";
    }
    return "active";
  }

  constantsToExport() {
    return {
      initialAppState: this.currentBackgroundState()
    };
  }

  supportedEvents() {
    return ["appStateDidChange"];
  }

  didUpdateVisibility = () => {
    this.bridge.uiManager.requestTick();
    this.sendEventWithName("appStateDidChange", {
      app_state: this.currentBackgroundState()
    });
  };

  $getCurrentAppState(callbackId: number) {
    this.bridge.callbackFromId(callbackId)({
      app_state: this.currentBackgroundState()
    });
  }
}

export default RCTAppState;
