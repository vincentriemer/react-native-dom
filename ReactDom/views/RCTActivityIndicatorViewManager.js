/**
 * @providesModule RCTActivityIndicatorViewManager
 * @flow
 */

import type UIView from "UIView";
import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";
import RCTActivityIndicatorView from "RCTActivityIndicatorView";

import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const { RCT_EXPORT_VIEW_PROP } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTActivityIndicatorViewManager")
  class RCTActivityIndicatorViewManager extends RCTViewManager {
    view(): UIView {
      return new RCTActivityIndicatorView(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("animating", "boolean")
    setAnimating(view: RCTActivityIndicatorView, value: boolean) {
      view.animating = value;
    }

    @RCT_EXPORT_VIEW_PROP("color", "color")
    setColor(view: RCTActivityIndicatorView, value: number) {
      view.color = value;
    }

    @RCT_EXPORT_VIEW_PROP("hidesWhenStopped", "boolean")
    setHidesWhenStopped(view: RCTActivityIndicatorView, value: boolean) {
      view.hidesWhenStopped = value;
    }
  }

  return RCTActivityIndicatorViewManager;
})();
