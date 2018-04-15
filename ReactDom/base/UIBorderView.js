/**
 * @providesModule UIBorderView
 * @flow
 */

import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import CustomElement from "CustomElement";

const BORDER_STYLE_PROPS = [
  "borderStyle",
  "borderTopStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderRightStyle"
];

const BORDER_WIDTH_PROPS = [
  "borderWidth",
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth"
];

const BORDER_COLOR_PROPS = [
  "borderColor",
  "borderTopColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRightColor"
];

const BORDER_RADIUS_PROPS = [
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius"
];

export const ALL_BORDER_PROPS = [].concat(
  BORDER_STYLE_PROPS,
  BORDER_WIDTH_PROPS,
  BORDER_COLOR_PROPS,
  BORDER_RADIUS_PROPS
);

@CustomElement("ui-border-view")
class UIBorderView extends HTMLElement {
  constructor() {
    super();

    Object.assign(this.style, {
      position: "absolute",
      top: "0",
      left: "0",
      boxSizing: "border-box",
      transformOrigin: "top left",
      pointerEvents: "none",
      borderStyle: "solid",
      borderWidth: "0",
      overflow: "hidden",
      contain: "strict",
      touchAction: "manipulation"
    });

    BORDER_STYLE_PROPS.forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          if (value == null) {
            this.style[propName] = "solid";
          } else {
            this.style[propName] = value;
          }
        }
      });
    });

    BORDER_COLOR_PROPS.forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          const [a, r, g, b] = ColorArrayFromHexARGB(value);
          const stringValue = `rgba(${r},${g},${b},${a})`;
          this.style[propName] = stringValue;
        }
      });
    });

    [].concat(BORDER_WIDTH_PROPS, BORDER_RADIUS_PROPS).forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          this.style[propName] = `${value}px`;
        }
      });
    });
  }

  updateDimensions(width: number, height: number) {
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
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
    if (value == null) {
      this.style.borderStyle = "solid";
    } else {
      this.style.borderStyle = value;
    }
  }
}

export default UIBorderView;
