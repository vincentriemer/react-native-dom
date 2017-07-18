/**
 * @providesModule UIBorderView
 * @flow
 */

import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import CustomElement from "CustomElement";

@CustomElement("ui-border-view")
class UIBorderView extends HTMLElement {
  constructor() {
    super();

    Object.assign(this.style, {
      position: "absolute",
      top: "0",
      left: "0",
      bottom: "0",
      right: "0",
      boxSizing: "border-box",
      transformOrigin: "top left"
    });
  }

  // property shorthands
  set borderColor(value: number) {
    const [a, r, g, b] = ColorArrayFromHexARGB(value);
    const stringValue = `rgba(${r},${g},${b},${a})`;
    this.style.borderColor = stringValue;
  }

  set borderRadius(value: number) {
    this.style.borderRadius = `${value}px`;
  }

  set borderWidth(value: number) {
    this.style.borderWidth = `${value}px`;
  }

  set borderStyle(value: string) {
    this.style.borderStyle = value;
  }
}

export default UIBorderView;
