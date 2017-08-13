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

@RCT_EXPORT_MODULE("RCTImageViewManager")
class RCTImageViewManager extends RCTViewManager {
  view(): UIView {
    return new RCTImageView(this.bridge);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypePromise)
  prefetchImage(url: string, resolveId: number, rejectId: number) {
    const resolve = this.bridge.callbackFromId(resolveId);
    const reject = this.bridge.callbackFromId(rejectId);

    this.bridge.imageLoader
      .loadImageWithURLRequest(url)
      .then(() => {
        resolve(true);
      })
      .catch(error => {
        reject("E_PREFETCH_FAILURE", null, error);
      });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  getSize(request: string, successId: number, errorId: number) {
    const success = this.bridge.callbackFromId(successId);
    const error = this.bridge.callbackFromId(errorId);

    this.bridge.imageLoader
      .getImageSizeForURLRequest(request)
      .then((size: Size) => {
        success([size.width, size.height]);
      })
      .catch(errorMsg => {
        console.log(errorMsg);
        error(errorMsg);
      });
  }
}

export default RCTImageViewManager;
