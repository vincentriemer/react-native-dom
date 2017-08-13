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

import guid from "Guid";

const MAX_WORKERS = 4;

// $FlowFixMe
let WORKER_SRC = preval`
  const fs = require('fs');
  const path = require('path');

  module.exports = fs.readFileSync(
    path.resolve(__dirname, 'RCTImageLoader.worker.js'),
    'utf8'
  );
`;

@RCT_EXPORT_MODULE("RCTImageLoader")
class RCTImageLoader {
  bridge: RCTBridge;
  loaderWorkers: Worker[];

  imageCache: { [cacheKey: string]: Promise<Image> };
  callbackMap: {
    [callbackId: string]: {
      resolve: Function,
      reject: Function,
      url: string
    }
  };

  nextWorkerId: number;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;

    this.imageCache = {};
    this.callbackMap = {};
    this.nextWorkerId = 0;
    this.loaderWorkers = [];

    this.setupWorkers();
  }

  setupWorkers() {
    const loaderWorkerBlob = new Blob([WORKER_SRC]);

    for (let i = 0; i < MAX_WORKERS; i++) {
      const loaderWorker = new Worker(URL.createObjectURL(loaderWorkerBlob));
      loaderWorker.onmessage = this.handleImageLoad;
      this.loaderWorkers.push(loaderWorker);
    }
  }

  get loaderWorker(): Worker {
    const loaderWorker = this.loaderWorkers[this.nextWorkerId];

    this.nextWorkerId++;
    if (this.nextWorkerId === MAX_WORKERS) {
      this.nextWorkerId = 0;
    }

    return loaderWorker;
  }

  handleImageLoad = ({ data: rawData }: MessageEvent) => {
    if (typeof rawData === "string") {
      const [callbackId, returnCode] = JSON.parse(rawData);

      const { resolve, reject, url } = this.callbackMap[callbackId];

      if (returnCode === 0) {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = url;
      } else {
        reject();
      }
    }
  };

  loadImage(url: string): Promise<Image> {
    const callbackId = guid();
    const loadPromise = new Promise((resolve, reject) => {
      this.callbackMap[callbackId] = { resolve, reject, url };

      this.loaderWorker.postMessage(
        JSON.stringify({
          url,
          callbackId
        })
      );
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
