/**
 * @providesModule RCTImageView
 * @flow
 */

import type RCTBridge from "RCTBridge";

import RCTView from "RCTView";
import RCTImageSource from "RCTImageSource";
import CustomElement from "CustomElement";

@CustomElement("rct-image-view")
class RCTImageView extends RCTView {
  _imageSources: RCTImageSource[];

  constructor(bridge: RCTBridge) {
    super(bridge);

    this._imageSources = [];
  }

  imageScale(): number {
    return this.bridge.deviceInfo.getDevicePixelRatio();
  }

  hasMultipleSources(): boolean {
    return this._imageSources.length > 1;
  }

  imageSourceForSize(size: Size): ?RCTImageSource {
    if (!this.hasMultipleSources()) {
      return this._imageSources[0];
    }

    // need to wait for layout pass before deciding
    if (size.width === 0 && size.height === 0) {
      return null;
    }

    const scale = this.imageScale();
    const targetImagePixels = size.width * size.height * scale * scale;

    let bestSource: ?RCTImageSource = null;
    let bestFit: number = Infinity;

    for (let source of this._imageSources) {
      const imgSize = source.size;
      const imagePixels =
        imgSize.width * imgSize.height * source.scale * source.scale;
      const fit = Math.abs(1 - imagePixels / targetImagePixels);

      if (fit < bestFit) {
        bestFit = fit;
        bestSource = source;
      }
    }

    return bestSource;
  }
}

export default RCTImageView;
