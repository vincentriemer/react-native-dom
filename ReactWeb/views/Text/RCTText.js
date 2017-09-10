/**
 * @providesModule RCTText
 * @flow
 */

import type { Frame } from "UIView";
import type RCTBridge from "RCTBridge";

import RCTView from "RCTView";
import {
  defaultFontStack,
  defaultFontSize,
  defaults as TextDefaults
} from "RCTSharedTextValues";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

@CustomElement("rct-text")
class RCTText extends RCTView {
  _selectable: boolean;
  _color: number;

  constructor(bridge: RCTBridge) {
    super(bridge);

    Object.assign(this.style, {
      position: "static",
      display: "inline",
      contain: "none",
      opacity: "1.0",
      whiteSpace: "pre-wrap"
    });

    this.selectable = false;
    this.fontFamily = defaultFontStack;
    this.fontSize = defaultFontSize;
    this.lineHeight = null;
  }

  get color(): number {
    return this._color;
  }

  set color(value: number) {
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
    Object.assign(this.style, {
      position: "absolute",
      display: "block"
    });
  }

  set accessible(value: boolean) {
    // no-op
  }

  get fontFamily(): string {
    return this.style.fontFamily;
  }

  set fontFamily(value: ?string) {
    this.style.fontFamily = value ? value : TextDefaults.fontFamily;
  }

  get fontSize(): string {
    return this.style.fontFamily;
  }

  set fontSize(value: ?number) {
    this.style.fontSize = value ? `${value}px` : TextDefaults.fontSize;
  }

  get selectable(): boolean {
    return this._selectable;
  }

  get textAlign(): string {
    return this.style.textAlign;
  }

  set textAlign(value: string) {
    this.style.textAlign = value;
  }

  set selectable(value: boolean) {
    this._selectable = value;

    const pointerValue = value ? "auto" : "none";
    const userSelectValue = value ? "text" : "none";

    // $FlowFixMe
    Object.assign(this.style, {
      webkitUserSelect: userSelectValue,
      MozUserSelect: userSelectValue,
      userSelect: userSelectValue,
      pointerEvents: pointerValue
    });
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
    if (value != null) {
      this.style.webkitTextDecorationLine = value;
      this.style.textDecorationLine = value;
    } else {
      this.style.webkitTextDecorationLine = "none";
      this.style.textDecorationLine = "none";
    }
  }

  set textDecorationStyle(value: ?string) {
    if (value != null) {
      this.style.webkitTextDecorationStyle = value;
      this.style.textDecorationStyle = value;
    } else {
      this.style.webkitTextDecorationStyle = "solid";
      this.style.textDecorationStyle = "solid";
    }
  }

  set textDecorationColor(value: ?number) {
    if (value != null) {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.style.webkitTextDecorationColor = stringValue;
      this.style.textDecorationColor = stringValue;
    } else {
      this.style.webkitTextDecorationColor = "currentcolor";
      this.style.textDecorationColor = "currentcolor";
    }
  }

  set lineHeight(value: ?number) {
    if (value != null) {
      this.style.lineHeight = `${value}px`;
    } else {
      this.style.lineHeight = TextDefaults.lineHeight;
    }
  }
}

export default RCTText;
