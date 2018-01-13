/**
 * @providesModule RCTImageView
 * @flow
 */

import type RCTBridge from "RCTBridge";

import RCTView from "RCTView";
import RCTImageSource from "RCTImageSource";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

const tintColorSVG = (color: string, id: number) => {
  return `
    <svg>
      <defs>
        <filter id="tint-${id}">
          <feFlood flood-color="${color}"/>
          <feComposite in2="SourceAlpha" operator="atop"/>
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

@CustomElement("rct-image-view")
class RCTImageView extends RCTView {
  _imageSources: RCTImageSource[];
  imageElement: HTMLImageElement;
  imageContainer: HTMLDivElement;
  childShadowRoot: ShadowRoot;

  onLoadStart: boolean = false;
  onLoad: boolean = false;
  onLoadEnd: boolean = false;

  filterId: number;
  svgFilter: HTMLElement;
  _blurRadius: ?number;
  _tintColor: ?string;

  constructor(bridge: RCTBridge) {
    super(bridge);

    Object.assign(this.style, {
      overflow: "hidden"
    });

    this._imageSources = [];

    this.childShadowRoot = this.childContainer.attachShadow({ mode: "open" });
    this.imageElement = document.createElement("img");
    Object.assign(this.imageElement.style, {
      pointerEvents: "none"
    });
    this.childShadowRoot.appendChild(this.imageElement);
    this.childShadowRoot.appendChild(document.createElement("slot"));

    this.svgFilter = document.createElement("div");
    this.svgFilter.style.height = "0";
    this.childShadowRoot.appendChild(this.svgFilter);
    this.filterId = idCounter;
    idCounter++;
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
  }

  set imageSources(value: RCTImageSource[]) {
    this._imageSources = value;
    this.reloadImage();
  }

  set resizeMode(value: string) {
    this.imageElement.style.objectFit = value;
  }

  set blurRadius(value: ?number) {
    this._blurRadius = value;
    this.updateFilter();
  }

  set tintColor(value: ?number) {
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this._tintColor = stringValue;
    } else {
      this._tintColor = value;
    }
    this.svgFilter.style.color = this._tintColor || "";
    this.svgFilter.innerHTML = this._tintColor
      ? tintColorSVG(this._tintColor, this.filterId)
      : "";
    this.updateFilter();
  }

  get imageScale(): number {
    return this.bridge.deviceInfo.getDevicePixelRatio();
  }

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    super.frame = value;

    const { width, height } = value;
    Object.assign(this.imageElement.style, {
      width: "100%",
      height: "100%"
    });

    this.reloadImage();
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
          this.imageElement.src = image.src;

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
        });
    }
  }
}

export default RCTImageView;
