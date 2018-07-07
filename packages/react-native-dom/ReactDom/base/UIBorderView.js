/** @flow */

import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

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

export const BORDER_STYLE_PROPS = ["borderStyle"];

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

const DEFAULT_PROPS = {
  borderStyle: "solid",
  borderWidth: 0,
  borderColor: "black",
  borderRadius: 0
};

class UIBorderView extends HTMLElement {
  rawProps = {
    // style
    borderStyle: undefined,

    // width
    borderWidth: undefined,
    borderTopWidth: undefined,
    borderBottomWidth: undefined,
    borderLeftWidth: undefined,
    borderRightWidth: undefined,
    borderStartWidth: undefined,
    borderEndWidth: undefined,

    // color
    borderColor: undefined,
    borderTopColor: undefined,
    borderBottomColor: undefined,
    borderLeftColor: undefined,
    borderRightColor: undefined,
    borderEndColor: undefined,
    borderStartColor: undefined,

    // radius
    borderRadius: undefined,
    borderTopLeftRadius: undefined,
    borderTopRightRadius: undefined,
    borderTopStartRadius: undefined,
    borderTopEndRadius: undefined,
    borderBottomLeftRadius: undefined,
    borderBottomRightRadius: undefined,
    borderBottomStartRadius: undefined,
    borderBottomEndRadius: undefined
  };

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
  }

  updateDimensions(width: number, height: number) {
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
  }

  render() {
    // TODO: start & end props

    const rp = this.rawProps;

    const borderStyle = rp.borderStyle ?? DEFAULT_PROPS.borderStyle;

    const borderTopWidth =
      rp.borderWidth ?? rp.borderTopWidth ?? DEFAULT_PROPS.borderWidth;
    const borderBottomWidth =
      rp.borderWidth ?? rp.borderBottomWidth ?? DEFAULT_PROPS.borderWidth;
    const borderLeftWidth =
      rp.borderWidth ?? rp.borderLeftWidth ?? DEFAULT_PROPS.borderWidth;
    const borderRightWidth =
      rp.borderWidth ?? rp.borderRightWidth ?? DEFAULT_PROPS.borderWidth;

    const borderTopColor =
      rp.borderColor ?? rp.borderTopColor ?? DEFAULT_PROPS.borderColor;
    const borderBottomColor =
      rp.borderColor ?? rp.borderBottomColor ?? DEFAULT_PROPS.borderColor;
    const borderLeftColor =
      rp.borderColor ?? rp.borderLeftColor ?? DEFAULT_PROPS.borderColor;
    const borderRightColor =
      rp.borderColor ?? rp.borderRightColor ?? DEFAULT_PROPS.borderColor;

    const borderTopLeftRadius =
      rp.borderRadius ?? rp.borderTopLeftRadius ?? DEFAULT_PROPS.borderRadius;
    const borderTopRightRadius =
      rp.borderRadius ?? rp.borderTopRightRadius ?? DEFAULT_PROPS.borderRadius;
    const borderBottomLeftRadius =
      rp.borderRadius ??
      rp.borderBottomLeftRadius ??
      DEFAULT_PROPS.borderRadius;
    const borderBottomRightRadius =
      rp.borderRadius ??
      rp.borderBottomRightRadius ??
      DEFAULT_PROPS.borderRadius;

    const newStyle = {
      borderStyle,
      borderTopWidth: `${borderTopWidth}px`,
      borderBottomWidth: `${borderBottomWidth}px`,
      borderLeftWidth: `${borderLeftWidth}px`,
      borderRightWidth: `${borderRightWidth}px`,
      borderTopColor,
      borderBottomColor,
      borderLeftColor,
      borderRightColor,
      borderTopLeftRadius: `${borderTopLeftRadius}px`,
      borderTopRightRadius: `${borderTopRightRadius}px`,
      borderBottomLeftRadius: `${borderBottomLeftRadius}px`,
      borderBottomRightRadius: `${borderBottomRightRadius}px`
    };

    Object.assign(this.style, newStyle);
  }
}

ALL_BORDER_PROPS.forEach((propName) => {
  Object.defineProperty(UIBorderView.prototype, propName, {
    confugurable: true,
    set(value) {
      this.rawProps[propName] = value;
      this.render();
    }
  });
});

customElements.define("ui-border-view", UIBorderView);

export default UIBorderView;
