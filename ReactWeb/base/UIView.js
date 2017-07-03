/**
 * @providesModule UIView
 * @flow
 */
import type { RCTComponent } from "RCTComponent";
import CustomElement from "CustomElement";
import { rgba } from "normalize-css-color";

type Frame = {
  top: number,
  left: number,
  width: number,
  height: number
};

type HTMLTag = "div" | "p";

export type Size = {
  width: number,
  height: number
};

(function() {
  var typesToPatch = ["DocumentType", "Element", "CharacterData"],
    remove = function() {
      // The check here seems pointless, since we're not adding this
      // method to the prototypes of any any elements that CAN be the
      // root of the DOM. However, it's required by spec (see point 1 of
      // https://dom.spec.whatwg.org/#dom-childnode-remove) and would
      // theoretically make a difference if somebody .apply()ed this
      // method to the DOM's root node, so let's roll with it.
      if (this.parentNode != null) {
        this.parentNode.removeChild(this);
      }
    };

  for (var i = 0; i < typesToPatch.length; i++) {
    var type = typesToPatch[i];
    if (window[type] && !window[type].prototype.remove) {
      window[type].prototype.remove = remove;
    }
  }
})();

export const FrameZero: Frame = {
  top: 0,
  left: 0,
  width: 0,
  height: 0
};

const ColorArrayFromHexARGB = function(hex) {
  hex = Math.floor(hex);
  return [
    ((hex >> 24) & 255) / 255, // a
    (hex >> 16) & 255, // r
    (hex >> 8) & 255, // g
    hex & 255 //b
  ];
};

@CustomElement("ui-view")
class UIView extends HTMLElement implements RCTComponent {
  reactTag: number;
  reactSubviews: Array<UIView>;
  reactSuperview: ?UIView;

  constructor() {
    super();

    this.reactSubviews = [];

    this.position = "absolute";
    this.backgroundColor = "transparent";
    this.color = "WindowText";
  }

  get position(): string {
    return this.style.position;
  }

  set position(value: string) {
    this.style.position = value;
  }

  get top(): string {
    return this.style.top;
  }

  set top(value: number) {
    this.style.top = `${value}px`;
  }

  get left(): string {
    return this.style.left;
  }

  set left(value: number) {
    this.style.left = `${value}px`;
  }

  get bottom(): string {
    return this.style.bottom;
  }

  set bottom(value: number) {
    this.style.bottom = `${value}px`;
  }

  get right(): string {
    return this.style.right;
  }

  set right(value: number) {
    this.style.right = `${value}px`;
  }

  get width(): string {
    return this.style.width;
  }

  set width(value: number) {
    this.style.width = `${value}px`;
  }

  get height(): string {
    return this.style.height;
  }

  set height(value: number) {
    this.style.height = `${value}px`;
  }

  get backgroundColor(): string {
    return this.style.backgroundColor;
  }

  set backgroundColor(value: string | number) {
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.style.backgroundColor = stringValue;
    } else {
      this.style.backgroundColor = value;
    }
  }

  get opacity(): string {
    return this.style.opacity;
  }

  set opacity(value: number) {
    this.style.opacity = `${value}`;
  }

  get color(): string {
    return this.style.color;
  }

  set color(value: string | number) {
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.style.color = stringValue;
    } else {
      this.style.color = value;
    }
  }

  get transform(): string {
    return this.style.transform;
  }

  set transform(value: Array<number>) {
    this.style.transform = `matrix3d(${value.join(",")})`;
  }

  insertReactSubviewAtIndex(subview: UIView, index: number) {
    if (index === this.reactSubviews.length) {
      this.appendChild(subview);
    } else {
      const beforeElement = this.reactSubviews[index];
      this.insertBefore(subview, beforeElement);
    }

    this.reactSubviews.splice(index, 0, subview);
    subview.reactSuperview = this;
  }

  removeReactSubview(subview: UIView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
  }

  purge() {
    this.remove();
  }
}

export default UIView;
