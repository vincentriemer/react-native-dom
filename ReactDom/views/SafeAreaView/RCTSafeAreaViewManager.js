/**
 * @providesModule RCTSafeAreaViewManager
 * @flow
 */

import { RCT_EXPORT_MODULE } from "../../bridge/RCTBridge";

import RCTSafeAreaView from "./RCTSafeAreaView";
import type UIView from "../../base/UIView";

import _RCTViewManager from "../RCTViewManager";
import _RCTSafeAreaShadowView from "./RCTSafeAreaShadowView";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const RCTSafeAreaShadowView = await _RCTSafeAreaShadowView;

  @RCT_EXPORT_MODULE("RCTSafeAreaViewManager")
  class RCTSafeAreaViewManager extends RCTViewManager {
    view(): UIView {
      return new RCTSafeAreaView(this.bridge);
    }

    shadowView(): * {
      return new RCTSafeAreaShadowView();
    }
  }

  return RCTSafeAreaViewManager;
})();
