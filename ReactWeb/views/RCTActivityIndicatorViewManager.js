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
import RCTViewManager, {
  RCT_EXPORT_VIEW_PROP,
  RCT_EXPORT_MIRRORED_PROP
} from "RCTViewManager";
import RCTActivityIndicatorView from "RCTActivityIndicatorView";

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

export default RCTActivityIndicatorViewManager;
