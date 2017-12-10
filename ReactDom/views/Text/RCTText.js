/**
 * @providesModule RCTText
 * @flow
 */

import type RCTBridge from "RCTBridge";

import RCTView from "RCTView";
import {
  defaultFontStack,
  defaultFontSize,
  defaults as TextDefaults
} from "RCTSharedTextValues";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import tinycolor from "tinycolor2";

@CustomElement("rct-text")
class RCTText extends RCTView {
  _selectable: boolean;
  _disabled: boolean;
  _isHighlighted: ?boolean;
  _highlightedBackgroundColor: ?string;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.updateHostStyle({
      position: "static",
      display: "inline",
      contain: "none",
      opacity: "1.0",
      whiteSpace: "pre-wrap",
      boxDecorationBreak: "clone"
    });

    this.updateChildContainerStyle({
      display: "inline",
      position: "static"
    });

    this.isHighlighted = null;
    this.disabled = true;
    this.fontFamily = defaultFontStack;
    this.fontSize = defaultFontSize;
    this.lineHeight = null;
    this.textDecorationColor = null;
    this.textDecorationLine = null;
    this.textDecorationStyle = null;
  }

  set backgroundColor(value: number | string) {
    super.backgroundColor = value;

    const color = tinycolor(value);
    if (color.getAlpha() < 0.3) {
      color.setAlpha(0.3);
    }

    color.darken();
    this._highlightedBackgroundColor = color.toRgbString();
  }

  set color(value: number | string) {
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.style.color = stringValue;
    } else {
      this.style.color = value;
    }
  }

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    super.frame = value;

    // if text's frame is set revert back to block positioning
    this.updateHostStyle({
      position: "absolute",
      display: "inline-block"
    });

    this.updateChildContainerStyle("display", "inline-block");
  }

  set accessible(value: boolean) {
    // no-op
  }

  set fontFamily(value: ?string) {
    this.style.fontFamily = value ? value : TextDefaults.fontFamily;
  }

  set fontSize(value: ?number) {
    this.style.fontSize = value ? `${value}px` : TextDefaults.fontSize;
  }

  get selectable(): boolean {
    return this._selectable;
  }

  set textAlign(value: string) {
    this.style.textAlign = value;
  }

  updatePointerEvents() {
    this.style.pointerEvents =
      (this._selectable || this._touchable) && !this._disabled
        ? "auto"
        : "none";
  }

  set disabled(value: boolean) {
    this.updatePointerEvents();
  }

  set isHighlighted(value: ?boolean) {
    this._isHighlighted = value;
    if (value !== null) {
      this.touchable = true;
      this.updateHostStyle(
        "backgroundImage",
        value
          ? "linear-gradient(-100deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))"
          : ""
      );
    } else {
      this.touchable = false;
    }
    this.updatePointerEvents();
  }

  set selectable(value: boolean) {
    this._selectable = value;

    this.updateHostStyle("userSelect", value ? "text" : "none");
    this.updatePointerEvents();
  }

  set fontWeight(value: ?string) {
    this.style.fontWeight = value ? value : TextDefaults.fontWeight;
  }

  set fontStyle(value: ?string) {
    this.style.fontStyle = value ? value : TextDefaults.fontStyle;
  }

  set letterSpacing(value: ?number) {
    this.style.letterSpacing = value
      ? `${value}px`
      : TextDefaults.letterSpacing;
  }

  set textDecorationLine(value: ?string) {
    this.updateChildContainerStyle(
      "textDecorationLine",
      value ? value : "none"
    );
  }

  set textDecorationStyle(value: ?string) {
    this.updateChildContainerStyle(
      "textDecorationStyle",
      value ? value : "solid"
    );
  }

  set textDecorationColor(value: ?number) {
    if (value != null) {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.updateChildContainerStyle("textDecorationColor", stringValue);
    } else {
      this.updateChildContainerStyle("textDecorationColor", "currentcolor");
    }
  }

  set lineHeight(value: ?number) {
    this.updateHostStyle(
      "lineHeight",
      value ? `${value}px` : TextDefaults.lineHeight
    );
  }
}

export default RCTText;
