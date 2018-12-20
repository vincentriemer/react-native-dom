/** @flow */

import invariant from "invariant";

import guid from "Guid";
import {
  defaults as TextDefaults,
  defaultFontSize,
  defaultFontStack
} from "RCTSharedTextValues";
import RCTShadowView from "RCTShadowView";
import RCTShadowRawText from "RCTShadowRawText";
import type RCTBridge from "RCTBridge";

import { TextMetrics } from "./Metrics/TextMetrics";
import { TextStyle } from "./Metrics/TextStyle";

TextStyle.DefaultTextStyle = {
  breakWords: false,
  fontFamily: TextDefaults.fontFamily,
  fontSize: defaultFontSize,
  fontStyle: "normal",
  fontVariant: "normal",
  fontWeight: "normal",
  lineHeight: -1,
  letterSpacing: 0,
  whiteSpace: "pre",
  wordWrap: false,
  wordWrapWidth: Infinity
};

const TEXT_SHADOW_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "lineHeight",
  "letterSpacing"
];

const TEXT_PX_PROPS = [];

const textMeasurementContainer = document.createElement("div");
textMeasurementContainer.id = "text-measurement";
// $FlowFixMe
Object.assign(textMeasurementContainer.style, {
  visibility: "hidden",
  pointerEvents: "none",
  webkitTextSizeAdjust: "100%"
});
document.body && document.body.appendChild(textMeasurementContainer);

const canvasMesurement = document.createElement("canvas");
canvasMesurement.id = "canvas-measurement";
Object.assign(canvasMesurement.style, {
  position: "absolute",
  visibility: "hidden",
  pointerEvents: "none"
});
document.body && document.body.appendChild(canvasMesurement);
const measureContext = canvasMesurement.getContext("2d");
TextMetrics._canvas = canvasMesurement;
TextMetrics._context = measureContext;

const textPropsToTextStyle = (props) => {
  const style = Object.keys(props).reduce((acc, key) => {
    if (props[key] && props[key] !== "inherit") {
      return { ...acc, [key]: props[key] };
    }
    return acc;
  }, {});

  return new TextStyle(style);
};

class RCTShadowText extends RCTShadowView {
  previousWidth: number;
  previousHeight: number;
  textChildren: Array<RCTShadowText | RCTShadowRawText>;
  textDirty: boolean;
  props: { [string]: any };

  fontFamily: ?string;
  fontSize: ?string;
  fontStyle: ?string;
  fontWeight: ?string;
  lineHeight: ?string;

  _testTree: ?HTMLElement;
  _testDOMElement: ?HTMLElement;
  _numberOfLines: number;

  constructor(bridge: RCTBridge) {
    super(bridge);

    // custom measure function for the flexbox layout
    this.yogaNode.setMeasureFunc(
      (width, widthMeasureMode, height, heightMeasureMode) =>
        this.measure(width, widthMeasureMode, height, heightMeasureMode)
    );

    this.props = {};
    this.textChildren = [];
    this.textDirty = true;

    TEXT_SHADOW_STYLE_PROPS.forEach((shadowPropName: string) => {
      Object.defineProperty(this, shadowPropName, {
        configurable: true,
        get: () => this.props[shadowPropName],
        set: (value) => {
          if (value != null) {
            if (
              shadowPropName === "fontFamily" &&
              value.indexOf("System") > -1
            ) {
              // Handle 'System' font
              const stack = value.split(/\s*,\s*/);
              stack[stack.indexOf("System")] = TextDefaults.fontFamily;
              value = stack.join(", ");
            }
            this.props[shadowPropName] = value;
          }
          this.markTextDirty();
        }
      });
      // $FlowFixMe
      this[shadowPropName] = null;
    });
  }

  isVirtual() {
    return true;
  }

  get numberOfLines(): number {
    return this._numberOfLines;
  }

  set numberOfLines(value: number) {
    this._numberOfLines = value;
    this.markTextDirty();
  }

  get testDOMElement(): HTMLElement {
    if (this._testDOMElement == null) {
      // create dom node for measuring text
      const domElement = document.createElement("div");
      domElement.id = guid();
      Object.assign(domElement.style, {
        position: "absolute",
        visibility: "hidden",
        maxHeight: "auto",
        maxWidth: "auto",
        whiteSpace: "nowrap",
        display: "inline-block",
        contain: "layout paint"
      });
      textMeasurementContainer.appendChild(domElement);
      this._testDOMElement = domElement;
    }
    return this._testDOMElement;
  }

  markTextDirty() {
    this.yogaNode.markDirty();
    this.textDirty = true;
    if (this.reactSuperview instanceof RCTShadowText) {
      this.reactSuperview.markTextDirty();
    }
  }

  clearTestDomElement() {
    const testDomElement = this.testDOMElement;
    while (testDomElement.firstChild) {
      testDomElement.removeChild(testDomElement.firstChild);
    }
  }

  measureFast(text: string, style: Object, maxWidth?: number) {
    const textStyle = textPropsToTextStyle(style);

    if (maxWidth != null) {
      textStyle.wordWrap = true;
      textStyle.wordWrapWidth = maxWidth;
    }

    const measurement = TextMetrics.measureText(
      text,
      textStyle,
      this.numberOfLines,
      maxWidth != null
    );

    return measurement;
  }

  /**
   * Measure the dimensions of the text associated
   * callback for css-layout
   * @param: width - input width extents
   * @param: widthMeasureMode - mode to constrain width CSS_MEASURE_MODE_EXACTLY, CSS_MEASURE_MODE_UNDEFINED
   * @param: height - input height extents
   * @param: heightMeasureMode - mode to constrain height CSS_MEASURE_MODE_EXACTLY, CSS_MEASURE_MODE_UNDEFINED
   * @return: object containing measured width and height
   */
  measure(
    width: number,
    widthMeasureMode: *,
    height: number,
    heightMeasureMode: *
  ): { width: number, height: number } {
    this.clearTestDomElement();

    const { Constants } = this.bridge.Yoga;

    const canBeFast =
      this.textChildren.length === 1 &&
      this.textChildren[0] instanceof RCTShadowRawText;

    if (canBeFast) {
      if (
        widthMeasureMode !== Constants.measureMode.exactly ||
        heightMeasureMode !== Constants.measureMode.exactly
      ) {
        let maxWidth;
        if (widthMeasureMode !== Constants.measureMode.undefined) {
          maxWidth = width;
        }

        const textChild = this.textChildren[0];
        invariant(
          textChild instanceof RCTShadowRawText,
          `Simple text must have a raw text child`
        );
        const measurement = this.measureFast(
          textChild.text,
          this.props,
          maxWidth
        );

        return {
          width: measurement.width,
          height: measurement.height
        };
      }
      return {
        width: width || 0,
        height: height || 0
      };
    }

    const whiteSpace = this.numberOfLines === 1 ? "nowrap" : "pre-wrap";

    if (
      widthMeasureMode !== Constants.measureMode.exactly ||
      heightMeasureMode !== Constants.measureMode.exactly
    ) {
      if (widthMeasureMode !== Constants.measureMode.undefined) {
        Object.assign(this.testDOMElement.style, {
          maxWidth: `${width}px`,
          maxHeight: "auto",
          whiteSpace
        });
      } else {
        Object.assign(this.testDOMElement.style, {
          maxWidth: "auto",
          maxHeight: `${height}px`,
          whiteSpace
        });
      }
    } else {
      return {
        width: width || 0,
        height: height || 0
      };
    }

    this.testDOMElement.appendChild(this.getTestTree());

    const {
      width: measuredWidth,
      height: measuredHeight
    } = this.testDOMElement.getBoundingClientRect();

    this.testDOMElement.remove();
    this._testDOMElement = null;

    return {
      width: Math.ceil(measuredWidth),
      height: Math.ceil(measuredHeight)
    };
  }

  getTestTree(): HTMLElement {
    if (!this.textDirty) {
      invariant(
        this._testTree,
        "ShadowText is not marked as dirty but there is no cached testTree"
      );
      return this._testTree;
    }

    const spanWrapper = document.createElement("span");

    // Line height is stored as a number (assumed px units)
    // so we need to explicitly set it to its string equivalent value
    const resolvedProps = {
      ...this.props,
      lineHeight: `${this.props.lineHeight}px`
    };

    Object.assign(spanWrapper.style, resolvedProps);

    this.textChildren.forEach((child) => {
      if (child instanceof RCTShadowRawText && child.text.length) {
        // Split text by newline and insert breaks manually as insertAdjacentText does not respect newlines
        const textLines = child.text.split(/\r?\n/);
        for (let i = 0; i < textLines.length; i++) {
          const currentLine = textLines[i];
          spanWrapper.insertAdjacentText("beforeend", currentLine);

          if (i < textLines.length - 1) {
            spanWrapper.insertAdjacentElement(
              "beforeend",
              document.createElement("br")
            );
          }
        }
      } else if (child instanceof RCTShadowText) {
        spanWrapper.insertAdjacentElement("beforeend", child.getTestTree());
      }
    });

    this._testTree = spanWrapper;
    this.textDirty = false;

    return this._testTree;
  }

  insertReactSubviewAtIndex(subview: RCTShadowView, index: number) {
    invariant(
      subview instanceof RCTShadowText || subview instanceof RCTShadowRawText,
      "Cannot insert subview to ShadowText that isn't of type RCTShadowText or RCTShadowRawText"
    );
    subview.reactSuperview = this;
    this.textChildren.splice(index, 0, subview);
    this.markTextDirty();
  }

  removeReactSubview(subview: RCTShadowView) {
    invariant(
      subview instanceof RCTShadowText || subview instanceof RCTShadowRawText,
      "Cannot remove a subview that isn't of type RCTShadowText or RCTShadowRawText"
    );
    subview.reactSuperview = undefined;
    this.textChildren = this.textChildren.filter((s) => s !== subview);
    this.markTextDirty();
  }

  purge() {
    super.purge();
    if (this._testDOMElement) {
      this._testDOMElement.parentNode &&
        this._testDOMElement.parentNode.removeChild(this._testDOMElement);
    }
  }
}

export default RCTShadowText;
