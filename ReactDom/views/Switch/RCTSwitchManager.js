/**
 * @providesModule RCTSwitchManager
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";
import RCTSwitch from "RCTSwitch";
import type UIView from "UIView";

import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const { RCT_EXPORT_VIEW_PROP } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTSwitchManager")
  class RCTSwitchManager extends RCTViewManager {
    view(): UIView {
      return new RCTSwitch(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("value", "boolean")
    setValue(view: RCTSwitch, value: boolean) {
      view.value = value;
    }

    @RCT_EXPORT_VIEW_PROP("disabled", "boolean")
    setDisabledSwitch(view: RCTSwitch, value: boolean) {
      view.disabled = value;
    }

    @RCT_EXPORT_VIEW_PROP("onChange", "RCTBubblingEventBlock")
    setOnChange(view: RCTSwitch, value: Function) {
      view.onChange = value;
    }

    @RCT_EXPORT_VIEW_PROP("onTintColor", "color")
    setOnTintColor(view: RCTSwitch, value: string) {
      view.onTintColor = value;
    }

    @RCT_EXPORT_VIEW_PROP("tintColor", "color")
    setTintColor(view: RCTSwitch, value: string) {
      view.tintColor = value;
    }

    @RCT_EXPORT_VIEW_PROP("thumbTintColor", "color")
    setThumbTintColor(view: RCTSwitch, value: string) {
      view.thumbTintColor = value;
    }
  }

  return RCTSwitchManager;
})();
