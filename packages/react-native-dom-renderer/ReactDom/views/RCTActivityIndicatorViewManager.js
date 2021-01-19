/** @flow */

import type UIView from "UIView";
import type RCTBridge from "RCTBridge";
import RCTActivityIndicatorView from "RCTActivityIndicatorView";
import RCTViewManager from "RCTViewManager";

class RCTActivityIndicatorViewManager extends RCTViewManager {
  static moduleName = "RCTActivityIndicatorViewManager";

  view(): UIView {
    return new RCTActivityIndicatorView(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addBooleanProp("animating", this.setAnimating)
      .addColorProp("color", this.setColor)
      .addBooleanProp("hidesWhenStopped", this.setHidesWhenStopped);
  }

  setAnimating(view: RCTActivityIndicatorView, value: ?boolean) {
    view.animating = value ?? true;
  }

  setColor(view: RCTActivityIndicatorView, value: ?string) {
    view.color = value ?? "rgb(25, 118, 210)";
  }

  setHidesWhenStopped(view: RCTActivityIndicatorView, value: ?boolean) {
    view.hidesWhenStopped = value ?? false;
  }
}

export default RCTActivityIndicatorViewManager;
