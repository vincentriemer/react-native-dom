/** @flow */

import RCTBridge from "RCTBridge";
import { RCTScrollContentView } from "RCTScrollView";
import type UIView from "UIView";
import RCTViewManager from "RCTViewManager";

class RCTScrollContentViewManager extends RCTViewManager {
  static moduleName = "RCTScrollContentViewManager";

  view(): UIView {
    return new RCTScrollContentView(this.bridge);
  }
}

export default RCTScrollContentViewManager;
