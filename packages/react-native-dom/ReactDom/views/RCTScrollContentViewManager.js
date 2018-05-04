/**
 * @providesModule RCTScrollContentViewManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";
import { RCTScrollContentView } from "RCTScrollView";
import type UIView from "UIView";

import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;

  @RCT_EXPORT_MODULE("RCTScrollContentViewManager")
  class RCTScrollContentViewManager extends RCTViewManager {
    view(): UIView {
      return new RCTScrollContentView(this.bridge);
    }
  }

  return RCTScrollContentViewManager;
})();
