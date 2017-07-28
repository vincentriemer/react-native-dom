/**
 * @providesModule RCTImageViewManager
 * @flow
 */
import type UIView from "UIView";
import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise
} from "RCTBridge";
import RCTViewManager, {
  RCT_EXPORT_VIEW_PROP,
  RCT_EXPORT_MIRRORED_PROP
} from "RCTViewManager";
import RCTImageView from "RCTImageView";

@RCT_EXPORT_MODULE
class RCTImageViewManager extends RCTViewManager {
  view(): UIView {
    return new RCTImageView();
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypePromise)
  prefetchImage(url: string, resolveId: number, rejectId: number) {
    const resolve = this.bridge.callbackFromId(resolveId);
    const reject = this.bridge.callbackFromId(rejectId);

    resolve(true);
  }
}

export default RCTImageViewManager;
