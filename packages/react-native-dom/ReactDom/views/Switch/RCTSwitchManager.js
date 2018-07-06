/** @flow */

import type RCTBridge from "RCTBridge";
import RCTSwitch from "RCTSwitch";
import type UIView from "UIView";
import RCTViewManager from "RCTViewManager";

class RCTSwitchManager extends RCTViewManager {
  static moduleName = "RCTSwitchManager";

  view(): UIView {
    return new RCTSwitch(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addBooleanProp("value", this.setValue)
      .addBooleanProp("disabled", this.setDisabledSwitch)
      .addBubblingEvent("onChange")
      .addColorProp("onTintColor", this.setOnTintColor)
      .addColorProp("tintColor", this.setTintColor)
      .addColorProp("thumbTintColor", this.setThumbTintColor);
  }

  setValue(view: RCTSwitch, value: ?boolean) {
    view.value = value;
  }

  setDisabledSwitch(view: RCTSwitch, value: ?boolean) {
    view.disabled = value;
  }

  setOnTintColor(view: RCTSwitch, value: ?string) {
    view.onTintColor = value;
  }

  setTintColor(view: RCTSwitch, value: ?string) {
    view.tintColor = value;
  }

  setThumbTintColor(view: RCTSwitch, value: ?string) {
    view.thumbTintColor = value;
  }
}

export default RCTSwitchManager;
