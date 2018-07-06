/** @flow */

import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

const BORDER_STYLE_PROPS = ["borderStyle"];

const BORDER_WIDTH_PROPS = [
  "borderWidth",
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderStartWidth",
  "borderEndWidth"
];

const BORDER_COLOR_PROPS = [
  "borderColor",
  "borderTopColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRightColor",
  "borderEndColor",
  "borderStartColor"
];

const BORDER_RADIUS_PROPS = [
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopStartRadius",
  "borderTopEndRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomStartRadius",
  "borderBottomEndRadius"
];

export const BORDER_NUMBER_PROPS: string[] = [].concat(
  BORDER_WIDTH_PROPS,
  BORDER_RADIUS_PROPS,
  BORDER_WIDTH_PROPS
);

export { BORDER_COLOR_PROPS };

export const ALL_BORDER_PROPS: string[] = [].concat(
  BORDER_STYLE_PROPS,
  BORDER_WIDTH_PROPS,
  BORDER_COLOR_PROPS,
  BORDER_RADIUS_PROPS
);

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
      contain: "strict"
    });

    BORDER_STYLE_PROPS.forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          if (value == null) {
            // $FlowFixMe
            this.style[propName] = "solid";
          } else {
            // $FlowFixMe
            this.style[propName] = value;
          }
        }
      });
    });

    BORDER_COLOR_PROPS.forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          // $FlowFixMe
          this.style[propName] = value;
        }
      });
    });

    [].concat(BORDER_WIDTH_PROPS, BORDER_RADIUS_PROPS).forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          // $FlowFixMe
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

customElements.define("ui-border-view", UIBorderView);

export default UIBorderView;
