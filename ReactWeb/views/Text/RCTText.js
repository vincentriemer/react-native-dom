/**
 * @providesModule RCTText
 * @flow
 */

import type { Frame } from "UIView";
import type RCTBridge from "RCTBridge";

import RCTView from "RCTView";
import { defaultFontStack, defaultFontSize } from "RCTSharedTextValues";
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

  set fontFamily(value: string) {
    this.style.fontFamily = value;
  }

  get fontSize(): string {
    return this.style.fontFamily;
  }

  set fontSize(value: any) {
    this.style.fontSize = value;
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
    const valueResult = value ? "text" : "none";
    // $FlowFixMe
    Object.assign(this.style, {
      webkitUserSelect: valueResult,
      MozUserSelect: valueResult,
      userSelect: valueResult
    });
  }

  set fontWeight(value: string) {
    this.style.fontWeight = value;
  }
}

export default RCTText;
