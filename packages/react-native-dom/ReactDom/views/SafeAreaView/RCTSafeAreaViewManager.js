/**
 * @providesModule RCTSafeAreaViewManager
 * @flow
 */

import { RCT_EXPORT_MODULE } from "RCTBridge";
import type UIView from "UIView";
import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;

  @RCT_EXPORT_MODULE("RCTSafeAreaViewManager")
  class RCTSafeAreaViewManager extends RCTViewManager {}

  return RCTSafeAreaViewManager;
})();
