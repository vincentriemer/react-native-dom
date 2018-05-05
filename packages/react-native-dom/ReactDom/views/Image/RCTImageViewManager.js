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
import RCTImageView from "RCTImageView";
import RCTImageSource from "RCTImageSource";

import _RCTViewManager from "RCTViewManager";

type ImageSourceJson = {
  __packager_asset?: boolean,
  width?: number,
  height?: number,
  scale?: number,
  uri: string
};

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const { RCT_EXPORT_VIEW_PROP } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTImageViewManager")
  class RCTImageViewManager extends RCTViewManager {
    constructor(bridge: RCTBridge) {
      super(bridge);

      // TODO: Revamp ViewManager decorators so this isn't necessary
      // $FlowFixMe
      this.__props = this.__props.filter((v) => {
        return v.name !== "hitSlop";
      });
    }

    view(): RCTImageView {
      return new RCTImageView(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("source", "array")
    setImageSources(view: RCTImageView, value: ImageSourceJson[]) {
      const imageSources = value.map((srcJson: ImageSourceJson) => {
        const size = {
          width: srcJson.width != null ? srcJson.width : 0,
          height: srcJson.height != null ? srcJson.height : 0
        };

        const imageSource = new RCTImageSource(
          srcJson.uri,
          // $FlowFixMe
          size,
          // $FlowFixMe
          srcJson.scale ? srcJson.scale : 1
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

    @RCT_EXPORT_VIEW_PROP("tintColor", "color")
    setTintColor(view: RCTImageView, value: ?number) {
      view.tintColor = value;
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

    // TODO: set this to something meaningfull
    @RCT_EXPORT_VIEW_PROP("onError", "RCTDirectEventBlock")
    setOnError() {}

    @RCT_EXPORT_METHOD(RCTFunctionTypePromise)
    prefetchImage(url: string, resolveId: number, rejectId: number) {
      const resolve = this.bridge.callbackFromId(resolveId);
      const reject = this.bridge.callbackFromId(rejectId);

      this.bridge.imageLoader
        .loadImageWithURLRequest(url)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
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
        .catch((errorMsg) => {
          error(errorMsg);
        });
    }
  }

  return RCTImageViewManager;
})();
