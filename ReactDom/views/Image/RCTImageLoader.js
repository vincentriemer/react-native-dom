/**
 * @providesModule RCTImageLoader
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal,
  RCTFunctionTypePromise
} from "RCTBridge";

@RCT_EXPORT_MODULE("RCTImageLoader")
class RCTImageLoader {
  bridge: RCTBridge;

  imageCache: { [cacheKey: string]: Promise<Image> };

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
    this.imageCache = {};
  }

  loadImage(url: string): Promise<Image> {
    const loadPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;

      if (typeof image.decode === "function") {
        image
          .decode()
          .then(() => {
            resolve(image);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        image.onload = () => resolve(image);
        image.onerror = () => reject();
      }
    });

    this.imageCache[url] = loadPromise;

    return loadPromise;
  }

  getImagePromise(url: string): Promise<Image> {
    const existingImage = this.imageCache[url];
    if (existingImage != null) {
      return existingImage;
    } else {
      return this.loadImage(url);
    }
  }

  loadImageWithURLRequest(url: string): Promise<Image> {
    return this.getImagePromise(url);
  }

  getImageSizeForURLRequest(url: string): Promise<Size> {
    return this.getImagePromise(url).then((image: Image) => {
      return {
        width: image.width,
        height: image.height
      };
    });
  }
}

export default RCTImageLoader;
