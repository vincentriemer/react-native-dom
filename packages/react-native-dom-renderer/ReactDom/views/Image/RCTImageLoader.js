/** @flow */

import type { Size } from "InternalLib";
import type RCTBridge from "RCTBridge";
import RCTModule from "RCTModule";

class RCTImageLoader extends RCTModule {
  static ERROR_GET_SIZE_FAILURE = "E_GET_SIZE_FAILURE";
  static moduleName = "RCTImageLoader";

  imageCache: { [cacheKey: string]: Promise<Image> };

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.imageCache = {};
  }

  loadImage(url: string): Promise<Image> {
    const loadPromise = new Promise((resolve, reject) => {
      const image = new Image();

      // skip loading on data uris
      if (url.startsWith("data:")) {
        image.src = url;
        return resolve(image);
      }

      if (url.startsWith("blob:")) {
        const blob = this.bridge.blobManager.resolveURL(url);
        url = URL.createObjectURL(blob);
      }

      image.onload = () => resolve(image);
      image.onerror = () => reject();

      image.src = url;
    });

    this.imageCache[url] = loadPromise;

    return loadPromise;
  }

  getImageSizePromise(url: string): Promise<Image> {
    const loadPromise = new Promise((resolve, reject) => {
      const image = new Image();

      // skip loading on data uris
      if (url.startsWith("data:")) {
        image.src = url;
        return resolve([image.width, image.height]);
      }

      if (url.startsWith("blob:")) {
        const blob = this.bridge.blobManager.resolveURL(url);
        url = URL.createObjectURL(blob);
      }

      image.onload = () => resolve([image.width, image.height]);
      //TODO : pass the correct additional params for rejection
      image.onerror = (e) => reject(ERROR_GET_SIZE_FAILURE, e);

      image.src = url;
    });

    return loadPromise;
  }

  getImagePromise(url: string): Promise<Image> {
    const existingImage = this.imageCache[url];
    if (existingImage != null) {
      return existingImage;
    }
    return this.loadImage(url);
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
  $$prefetchImage(url: string, resolveId: number, rejectId: number) {
    return this.bridge.imageLoader.loadImageWithURLRequest(url);
  }
  $$getSize(request: string) {
    return this.getImageSizePromise(request);
  }
}

export default RCTImageLoader;
