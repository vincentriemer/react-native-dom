/**
 * @providesModule RCTDevSettings
 * @flow
 */

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";
import { defaultFontStack } from "RCTSharedTextValues";

type DevSettings = {
  isInspectorShown: boolean
};

@RCT_EXPORT_MODULE("RCTDevSettings")
class RCTDevSettings {
  bridge: RCTBridge;
  settings: DevSettings;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
    this.settings = {
      isInspectorShown: false
    };
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  reload() {
    location.reload();
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  toggleElementInspector() {
    const value = this.settings.isInspectorShown;
    this.settings.isInspectorShown = !value;

    this.bridge.eventDispatcher.sendDeviceEvent("toggleElementInspector");
  }
}

export default RCTDevSettings;
