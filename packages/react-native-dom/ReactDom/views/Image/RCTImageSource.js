/** @flow */

import type { Size } from "InternalLib";

class RCTImageSource {
  request: string;
  size: Size;
  scale: number;
  packagerAsset: boolean;

  constructor(request: string, size: Size, scale: number) {
    this.request = request;
    this.size = size;
    this.scale = scale;
    this.packagerAsset = false;
  }

  imageSourceWithSizeAndScale(size: Size, scale: number): RCTImageSource {
    const imageSource = new RCTImageSource(this.request, size, scale);
    imageSource.packagerAsset = this.packagerAsset;
    return imageSource;
  }
}

export default RCTImageSource;
