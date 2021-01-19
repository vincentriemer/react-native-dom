/** @flow */

import type { Frame, Size } from "InternalLib";
import type RCTBridge from "RCTBridge";
import RCTView from "RCTView";
import RCTImageSource from "RCTImageSource";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import prefixInlineStyles from "prefixInlineStyles";
import isIOS from "isIOS";

const tintColorSVG = (color: string, id: number) => {
  return `
    <svg>
      <defs>
        <filter id="tint-${id}">
          <feFlood flood-color="${color}"></feFlood>
          <feComposite in2="SourceAlpha" operator="atop"></feComposite>
        </filter>
      </defs>
    </svg>`;
};

const onLoadParamsForSource = (source: RCTImageSource) => ({
  source: {
    width: source.size.width,
    height: source.size.height,
    url: source.request
  }
});

let idCounter = 0;

class RCTImageView extends RCTView {
  _imageSources: RCTImageSource[];
  imageElement: HTMLImageElement;
  imageElementAlt: HTMLImageElement;
  mountedImage: ?HTMLImageElement;
  imageContainer: HTMLDivElement;
  childShadowRoot: ShadowRoot;
  imgStyle: HTMLStyleElement;

  onLoadStart: boolean = false;
  onLoad: boolean = false;
  onLoadEnd: boolean = false;

  filterId: number;
  svgFilter: HTMLElement;
  _blurRadius: ?number;
  _tintColor: ?string;

  _tile: ?boolean; // resizeMode === "repeat"
  _src: ?string; // Used to set the tile image
  _imageWidth: ?number; // Used to calculate the tile image's scale factor
  _imageHeight: ?number; // Used to calculate the tile image's scale factor
  _needsReload: boolean = false; // Whether the latest change of props requires the image to be reloaded

  constructor(bridge: RCTBridge) {
    super(bridge);

    Object.assign(this.style, {
      overflow: "hidden"
    });

    this._imageSources = [];

    // TODO: Using a shadow root breaks the tintColor functionality on safari,
    //       figure out why and re-enable
    // this.childShadowRoot = this.childContainer.attachShadow({ mode: "open" });

    this.svgFilter = document.createElement("div");
    this.svgFilter.style.height = "0";
    this.childContainer.appendChild(this.svgFilter);
    this.filterId = idCounter;
    idCounter++;

    this.imageElement = new Image();
    this.imageElementAlt = new Image();
    this.imageElement.setAttribute("draggable", "false");
    this.imageElementAlt.setAttribute("draggable", "false");
    // this.imageElement.setAttribute("decoding", "async");
    // this.childContainer.appendChild(this.imageElement);

    this.resizeMode = undefined;

    this.imageElement.addEventListener("load", () => {
      this.forceRasterization();
    });
  }

  updateFilter() {
    const filterStrings: string[] = [];
    if (this._tintColor) {
      filterStrings.push(`url(#tint-${this.filterId})`);
    }
    if (this._blurRadius) {
      filterStrings.push(`blur(${this._blurRadius}px)`);
    }

    // $FlowFixMe
    this.imageElement.style.webkitFilter = filterStrings.join(" ");
    this.imageElement.style.filter = filterStrings.join(" ");

    // $FlowFixMe
    this.imageElementAlt.style.webkitFilter = filterStrings.join(" ");
    this.imageElementAlt.style.filter = filterStrings.join(" ");
  }

  updateTile() {
    let style;

    if (this._tile) {
      const {
        frameSize: { width: frameWidth, height: frameHeight },
        _src: src,
        _imageWidth: imageWidth,
        _imageHeight: imageHeight
      } = this;

      if (!frameWidth || !frameHeight || !imageWidth || !imageHeight || !src) {
        return;
      }

      const scaleDownFactor = Math.min(
        1,
        frameWidth / imageWidth,
        frameHeight / imageHeight
      );

      style = {
        backgroundImage: `url(${encodeURI(src)})`,
        backgroundSize: `
          ${scaleDownFactor * imageWidth}px
          ${scaleDownFactor * imageHeight}px
        `,
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
        objectPosition: `${-imageWidth - 1}px ${-imageHeight - 1}px`
      };
    } else {
      style = {
        backgroundImage: "",
        backgroundSize: "",
        backgroundRepeat: "",
        backgroundPosition: "",
        objectPosition: ""
      };
    }
    Object.assign(this.imageElement.style, style);
    Object.assign(this.imageElementAlt.style, style);
  }

  forceRasterization() {
    const mountedImage = this.mountedImage;
    if (this._tintColor != null && mountedImage != null) {
      requestAnimationFrame(() => {
        mountedImage.style.willChange = "transform";
        requestAnimationFrame(() => {
          mountedImage.style.willChange = "auto";
        });
      });
    }
  }

  set imageSources(value: RCTImageSource[]) {
    this._imageSources = value;
    this.reloadImage();
  }

  set resizeMode(value: ?string) {
    value = value || "stretch";

    let outputValue: string = "";
    switch (value) {
      case "contain":
      case "cover":
        outputValue = value;
        break;
      case "repeat":
      case "center":
        outputValue = "scale-down";
        break;
      case "stretch":
        outputValue = "fill";
        break;
      case "none":
        outputValue = `none`;
        break;
    }
    Object.assign(this.imageElement.style, {
      objectFit: outputValue
    });

    Object.assign(this.imageElementAlt.style, {
      objectFit: outputValue
    });

    this._tile = value === "repeat";
    this.updateTile();
  }

  set blurRadius(value: ?number) {
    this._blurRadius = value;
    this.updateFilter();
  }

  set tintColor(value: ?string) {
    this._tintColor = value;
    this.svgFilter.innerHTML = this._tintColor
      ? tintColorSVG(this._tintColor, this.filterId)
      : "";
    this.updateFilter();
    this.forceRasterization();
  }

  get imageScale(): number {
    return this.bridge.deviceInfo.getDevicePixelRatio();
  }

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    const prevWidth = this.width;
    const prevHeight = this.height;

    super.frame = value;

    const { width, height } = value;
    Object.assign(this.imageElement.style, {
      width: `${width}px`,
      height: `${height}px`
    });

    Object.assign(this.imageElementAlt.style, {
      width: `${width}px`,
      height: `${height}px`
    });

    if (prevWidth !== width || prevHeight !== height) {
      this.reloadImage();
    }
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

    const scale = this.imageScale;
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

  get frameSize(): Size {
    const { width, height } = this.frame;
    return { width, height };
  }

  reloadImage() {
    const source = this.imageSourceForSize(this.frameSize);
    if (source && this.frameSize.width > 0 && this.frameSize.height > 0) {
      if (this.onLoadStart) {
        this.bridge.enqueueJSCall("RCTEventEmitter", "receiveEvent", [
          this.reactTag,
          "topLoadStart",
          null
        ]);
      }

      this.bridge.imageLoader
        .loadImageWithURLRequest(source.request)
        .then((image: Image) => {
          let pendingImage =
            this.mountedImage === this.imageElement
              ? this.imageElementAlt
              : this.imageElement;
          pendingImage.src = image.src;

          this._src = pendingImage.src;
          // We call updateTile() below so can skip it here

          if (
            !pendingImage.src.startsWith("data:") &&
            // $FlowFixMe
            typeof pendingImage.decode === "function"
          ) {
            return pendingImage.decode().then(() => pendingImage);
          }
          return pendingImage;
        })
        .then((image: HTMLImageElement) => {
          this._imageWidth = image.width;
          this._imageHeight = image.height;

          this.updateTile();

          this.mountedImage && this.mountedImage.remove();

          this.childContainer.appendChild(image);
          this.mountedImage = image;

          if (this.onLoad) {
            const sourceLoaded = source.imageSourceWithSizeAndScale(
              {
                width: image.width,
                height: image.height
              },
              source.scale
            );
            this.bridge.enqueueJSCall("RCTEventEmitter", "receiveEvent", [
              this.reactTag,
              "topLoad",
              onLoadParamsForSource(sourceLoaded)
            ]);
          }
        })
        .catch((err) => {
          this.bridge.enqueueJSCall("RCTEventEmitter", "receiveEvent", [
            this.reactTag,
            "topError",
            {
              error: err
            }
          ]);
        })
        .then(() => {
          if (this.onLoadEnd) {
            this.bridge.enqueueJSCall("RCTEventEmitter", "receiveEvent", [
              this.reactTag,
              "topLoadEnd",
              null
            ]);
          }
          this.updateFilter();
        });
    }
  }
}

customElements.define("rct-image-view", RCTImageView);

export default RCTImageView;
