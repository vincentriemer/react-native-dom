/** @flow */

import type RCTBridge from "RCTBridge";
import RCTRawText from "RCTRawText";
import RCTViewManager from "RCTViewManager";
import RCTShadowRawText from "RCTShadowRawText";
import RCTPropTypes from "RCTPropTypes";

class RCTRawTextManager extends RCTViewManager {
  static moduleName = "RCTRawTextManager";

  view(): RCTRawText {
    return new RCTRawText(this.bridge);
  }

  shadowView(): RCTShadowRawText {
    return new RCTShadowRawText(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addMirroredProp("text", RCTPropTypes.string, this.setText);
  }

  setText(view: RCTRawText, value: ?string) {
    view.text = value ?? "";
  }
}

export default RCTRawTextManager;
