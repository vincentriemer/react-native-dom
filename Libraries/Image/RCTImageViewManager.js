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
import RCTImageSource from "RCTImageSource";

type ImageSourceJson = {
  __packager_asset?: boolean,
  width?: number,
  height?: number,
  scale?: number,
  uri: string
};

@RCT_EXPORT_MODULE("RCTImageViewManager")
class RCTImageViewManager extends RCTViewManager {
  view(): RCTImageView {
    return new RCTImageView(this.bridge);
  }

  @RCT_EXPORT_VIEW_PROP("source", "array")
  setImageSources(view: RCTImageView, value: ImageSourceJson[]) {
    const imageSources = value.map((srcJson: ImageSourceJson) => {
      const size = {
        width: value.width ? value.width : 0,
        height: value.height ? value.height : 0
      };

      const imageSource = new RCTImageSource(
        srcJson.uri,
        // $FlowFixMe
        size,
        // $FlowFixMe
        value.scale ? value.scale : 1
      );

      if (srcJson.__packager_asset != null) {
        imageSource.packagerAsset = srcJson.__packager_asset;
      }

      return imageSource;
    });

    view.imageSources = imageSources;
  }

  @RCT_EXPORT_VIEW_PROP("resizeMode", "string")
  setResizeMode(view: RCTImageView, value: string) {
    view.resizeMode = value;
  }

  @RCT_EXPORT_VIEW_PROP("blurRadius", "number")
  setBlurRadius(view: RCTImageView, value: number) {
    view.blurRadius = value;
  }

  @RCT_EXPORT_VIEW_PROP("onLoadStart", "RCTDirectEventBlock")
  setOnLoadStart(view: RCTImageView, value: boolean) {
    view.onLoadStart = value;
  }

  @RCT_EXPORT_VIEW_PROP("onLoad", "RCTDirectEventBlock")
  setOnLoad(view: RCTImageView, value: boolean) {
    view.onLoad = value;
  }

  @RCT_EXPORT_VIEW_PROP("onLoadEnd", "RCTDirectEventBlock")
  setOnLoadEnd(view: RCTImageView, value: boolean) {
    view.onLoadEnd = value;
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
        success(size.width, size.height);
      })
      .catch(errorMsg => {
        error(errorMsg);
      });
  }
}

export default RCTImageViewManager;
