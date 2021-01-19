/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import { defaultFontStack } from "RCTSharedTextValues";

type DevSettings = {
  isInspectorShown: boolean
};

class RCTDevSettings extends RCTModule {
  static moduleName = "RCTDevSettings";

  settings: DevSettings;

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.settings = {
      isInspectorShown: false
    };
  }

  $reload() {
    location.reload();
  }

  $toggleElementInspector() {
    const value = this.settings.isInspectorShown;
    this.settings.isInspectorShown = !value;

    this.bridge.eventDispatcher.sendDeviceEvent("toggleElementInspector");
  }
}

export default RCTDevSettings;
