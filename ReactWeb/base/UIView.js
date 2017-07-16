/**
 * @providesModule UIView
 * @flow
 */

import type RCTTouchHandler from "RCTTouchHandler";
import type { RCTComponent } from "RCTComponent";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

export type Frame = {
  top: number,
  left: number,
  width: number,
  height: number
};

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

const baseDimension = 1000;

@CustomElement("ui-view")
class UIView extends HTMLElement implements RCTComponent {
  _top: number;
  _left: number;
  _bottom: number;
  _right: number;
  _width: number;
  _height: number;
  _borderRadius: number;
  _borderColor: number;
  _borderWidth: number;
  _touchable: boolean;
  _opacity: number;

  reactTag: number;
  reactSubviews: Array<UIView>;
  reactSuperview: ?UIView;

  hasBeenFramed: boolean;

  constructor() {
    super();

    this.reactSubviews = [];
    this.hasBeenFramed = false;
    this.opacity = 0;

    this.position = "absolute";
    this.backgroundColor = "transparent";
    this.style.overflow = "hidden";
    this.style.boxSizing = "border-box";
    this.borderRadius = 0;
  }

  get frame(): Frame {
    return {
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height
    };
  }

  set frame(value: Frame) {
    Object.assign(this, value);
    if (!this.hasBeenFramed) {
      this.hasBeenFramed = true;
      this.opacity = 1;
    }
  }

  get position(): string {
    return this.style.position;
  }

  set position(value: string) {
    this.style.position = value;
  }

  get top(): number {
    return this._top;
  }

  set top(value: number) {
    this._top = value;
    this.updatePosition();
  }

  get left(): number {
    return this._left;
  }

  set left(value: number) {
    this._left = value;
    this.updatePosition();
  }

  get bottom(): number {
    return this._bottom;
  }

  set bottom(value: number) {
    this._bottom = value;
    this.style.bottom = `${value}px`;
  }

  get right(): number {
    return this._right;
  }

  set right(value: number) {
    this._right = value;
    this.style.right = `${value}px`;
  }

  updatePosition() {
    let transformString = "";

    if (this._left) transformString += `translateX(${this._left}px)`;
    if (this._top) transformString += `translateY(${this._top}px)`;

    this.style.transform = transformString;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
    this.style.width = `${value}px`;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
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

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
    this.style.opacity = `${value}`;
  }

  // get transform(): string {
  //   return this.style.transform;
  // }

  // set transform(value: Array<number>) {
  //   this.style.transform = `matrix3d(${value.join(",")})`;
  // }

  get borderRadius(): number {
    return this._borderRadius;
  }

  set borderRadius(value: number) {
    this._borderRadius = value;
    this.style.borderRadius = `${value}px`;
  }

  get borderColor(): number {
    return this._borderColor;
  }

  set borderColor(value: number) {
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.style.borderColor = stringValue;
    } else {
      this.style.borderColor = value;
    }
  }

  get borderWidth(): number {
    return this._borderWidth;
  }

  set borderWidth(value: number) {
    this._borderWidth = value;
    this.style.borderWidth = `${value}px`;
  }

  get touchable(): boolean {
    return this._touchable;
  }

  set touchable(value: boolean) {
    this._touchable = value;
    this.style.cursor = value ? "pointer" : "auto";
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

  addGestureRecognizer(
    handler: RCTTouchHandler,
    deviceType: "mouseOnly" | "touchOnly" | "hybrid",
    touchListenerOptions: Object | boolean
  ) {
    if (deviceType !== "touchOnly") {
      this.addEventListener("mousedown", handler.mouseClickBegan);
    }

    if (deviceType !== "mouseOnly") {
      this.addEventListener(
        "touchstart",
        handler.nativeTouchBegan,
        touchListenerOptions
      );
    }
  }

  removeGestureRecognizer(handler: RCTTouchHandler) {
    // TODO: Implement
  }
}

export default UIView;
