/** @flow */

import type { Size } from "InternalLib";
import type UIView from "UIView";
import type RCTBridge from "RCTBridge";
import RCTImageView from "RCTImageView";
import RCTImageSource from "RCTImageSource";
import RCTViewManager from "RCTViewManager";

type ImageSourceJson = {
  __packager_asset?: boolean,
  width?: number,
  height?: number,
  scale?: number,
  uri: string
};

class RCTImageViewManager extends RCTViewManager {
  static moduleName = "RCTImageViewManager";

  view(): RCTImageView {
    return new RCTImageView(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addArrayProp("source", this.setImageSources)
      .addStringProp("resizeMode", this.setResizeMode)
      .addNumberProp("blurRadius", this.setBlurRadius)
      .addColorProp("tintColor", this.setTintColor)
      .addDirectEvent("onLoadStart")
      .addDirectEvent("onLoad")
      .addDirectEvent("onLoadEnd")
      .addDirectEvent("onError");
  }

  setImageSources(view: RCTImageView, value: ?(ImageSourceJson[])) {
    value = value || [];
    const imageSources = value.map((srcJson: ImageSourceJson) => {
      const size = {
        width: srcJson.width != null ? srcJson.width : 0,
        height: srcJson.height != null ? srcJson.height : 0
      };

      const imageSource = new RCTImageSource(
        srcJson.uri,
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

  setResizeMode(view: RCTImageView, value: ?string) {
    view.resizeMode = value;
  }

  setBlurRadius(view: RCTImageView, value: ?number) {
    view.blurRadius = value;
  }

  setTintColor(view: RCTImageView, value: ?string) {
    view.tintColor = value;
  }

  $$prefetchImage(url: string, resolveId: number, rejectId: number) {
    return this.bridge.imageLoader.loadImageWithURLRequest(url);
  }

  $getSize(request: string, successId: number, errorId: number) {
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

export default RCTImageViewManager;
