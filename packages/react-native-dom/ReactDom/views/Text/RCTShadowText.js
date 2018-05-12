/**
 * @providesModule RCTShadowText
 * @flow
 */

import invariant from "invariant";
import _Yoga from "yoga-dom";

import guid from "Guid";
import {
  defaults as TextDefaults,
  defaultFontSize,
  defaultFontStack
} from "RCTSharedTextValues";
import _RCTShadowView from "RCTShadowView";
import _RCTShadowRawText from "RCTShadowRawText";

const TEXT_SHADOW_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "lineHeight",
  "letterSpacing"
];

const TEXT_PX_PROPS = ["lineHeight"];

const textMeasurementContainer = document.createElement("div");
textMeasurementContainer.id = "text-measurement";
// $FlowFixMe
Object.assign(textMeasurementContainer.style, {
  visibility: "hidden",
  pointerEvents: "none",
  webkitTextSizeAdjust: "100%"
});
document.body && document.body.appendChild(textMeasurementContainer);

module.exports = (async () => {
  const { Constants } = await _Yoga;
  const RCTShadowView = await _RCTShadowView;
  const RCTShadowRawText = await _RCTShadowRawText;

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

    constructor() {
      super();

      // custom measure function for the flexbox layout
      this.yogaNode.setMeasureFunc(
        (width, widthMeasureMode, height, heightMeasureMode) =>
          this.measure(width, widthMeasureMode, height, heightMeasureMode)
      );

      this.props = {};
      this.textChildren = [];
      this.textDirty = true;
      this.numberOfLines = 0;

      TEXT_SHADOW_STYLE_PROPS.forEach((shadowPropName: string) => {
        Object.defineProperty(this, shadowPropName, {
          configurable: true,
          get: () => this.props[shadowPropName],
          set: (value) => {
            if (value != null) {
              this.props[shadowPropName] = TEXT_PX_PROPS.includes(
                shadowPropName
              )
                ? `${value}px`
                : value;
            } else {
              this.props[shadowPropName] = "inherit";
            }
            this.markTextDirty();
          }
        });
        // $FlowFixMe
        this[shadowPropName] = null;
      });
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
      Object.assign(spanWrapper.style, this.props);

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

    insertReactSubviewAtIndex(
      subview: RCTShadowText | RCTShadowRawText,
      index: number
    ) {
      subview.reactSuperview = this;
      this.textChildren.splice(index, 0, subview);
      this.markTextDirty();
    }

    removeReactSubview(subview: RCTShadowText | RCTShadowRawText) {
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

  return RCTShadowText;
})();
