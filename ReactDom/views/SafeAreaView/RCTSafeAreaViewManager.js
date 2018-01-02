/**
 * @providesModule RCTSafeAreaViewManager
 * @flow
 */

import { RCT_EXPORT_MODULE } from "RCTBridge";
import RCTViewManager from "RCTViewManager";
import RCTSafeAreaView from "RCTSafeAreaView";
import RCTSafeAreaShadowView from "RCTSafeAreaShadowView";

import type UIView from "UIView";
import type RCTShadowView from "RCTShadowView";

@RCT_EXPORT_MODULE("RCTSafeAreaViewManager")
class RCTSafeAreaViewManager extends RCTViewManager {
  view(): UIView {
    return new RCTSafeAreaView(this.bridge);
  }

  shadowView(): RCTShadowView {
    return new RCTSafeAreaShadowView(this.bridge.YogaModule);
  }
}

export default RCTSafeAreaViewManager;
