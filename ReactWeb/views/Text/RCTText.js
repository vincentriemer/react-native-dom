/**
 * @providesModule RCTText
 * @flow
 */

import type { Frame } from "UIView";

import RCTView from "RCTView";
import CustomElement from "CustomElement";

@CustomElement("rct-text")
class RCTText extends RCTView {
  _selectable: boolean;

  constructor() {
    super();

    Object.assign(this.style, {
      position: "static",
      display: "inline"
    });

    this.selectable = false;
    this.fontFamily = "sans-serif";
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

  set selectable(value: boolean) {
    this._selectable = value;
    const valueResult = value ? "text" : "none";
    Object.assign(this.style, {
      webkitUserSelect: valueResult,
      MozUserSelect: valueResult,
      userSelect: valueResult
    });
  }
}

export default RCTText;
