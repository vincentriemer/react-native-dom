/**
 * @providesModule RCTAppState
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "../bridge/RCTBridge";
import RCTEventEmitter from "./RCTEventEmitter";

let hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
  // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

@RCT_EXPORT_MODULE("RCTAppState")
class RCTAppState extends RCTEventEmitter {
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

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  getCurrentAppState(callbackId: number) {
    this.bridge.callbackFromId(callbackId)({
      app_state: this.currentBackgroundState()
    });
  }
}

export default RCTAppState;
