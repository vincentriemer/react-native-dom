/**
 * @providesModule UIView
 * @flow
 */
import type { RCTComponent } from "RCTComponent";
import { rgba } from "normalize-css-color";

type Frame = {
  top: number,
  left: number,
  width: number,
  height: number,
};

type HTMLTag = "div" | "p";

export type Size = {
  width: number,
  height: number,
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
  height: 0,
};

const ColorArrayFromHexARGB = function(hex) {
  hex = Math.floor(hex);
  return [
    ((hex >> 24) & 255) / 255, // a
    (hex >> 16) & 255, // r
    (hex >> 8) & 255, // g
    hex & 255, //b
  ];
};

class UIView implements RCTComponent {
  // Frame
  _left: number;
  _top: number;
  _width: number;
  _height: number;

  // Visual Appearance
  _backgroundColor: string;
  _hidden: boolean;
  _alpha: number;
  _clipsToBounds: boolean;
  _color: string;
  _opacity: string;
  _transform: Array<number>;

  // Debugging Properties
  _testID: string;
  // opaque: boolean = true; TODO: this seems to be very UI specific

  reactTag: number;
  reactSubviews: Array<UIView>;
  reactSuperview: ?UIView;

  // DOM-Related Properties
  tag: HTMLTag = "div";
  element: HTMLElement;

  constructor(frame: Frame, tag: ?HTMLTag) {
    if (tag != undefined) {
      this.tag = tag;
    }

    this.reactSubviews = [];
    this.initializeDOMElement(frame);
  }

  initializeDOMElement(frame: Frame) {
    this.element = document.createElement(this.tag);
    this.element.style.position = "absolute";

    this.left = frame.left;
    this.top = frame.top;
    this.width = frame.width;
    this.height = frame.height;

    this.backgroundColor = "transparent";
    this.hidden = false;
    this.alpha = 1.0;
    this.clipsToBounds = false;
    this.color = "WindowText";
  }

  // Layout Getters and Setters
  get left(): number {
    return this._left;
  }

  set left(value: number) {
    this.element.style.left = `${value}px`;
    this._left = value;
  }

  get top(): number {
    return this._top;
  }

  set top(value: number) {
    this.element.style.top = `${value}px`;
    this._top = value;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this.element.style.width = `${value}px`;
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this.element.style.height = `${value}px`;
    this._height = value;
  }

  // Visual Getters and Setters
  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: number) {
    const [a, r, g, b] = ColorArrayFromHexARGB(value);
    const stringValue = `rgba(${r},${g},${b},${a})`;
    this.element.style.backgroundColor = stringValue;
    this._backgroundColor = stringValue;
  }

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this.element.style.visibility = value ? "hidden" : "visible";
    this._hidden = value;
  }

  get alpha(): number {
    return this._alpha;
  }

  set alpha(value: number) {
    this.element.style.opacity = `${value}`;
    this._alpha = value;
  }

  get clipsToBounds(): boolean {
    return this._clipsToBounds;
  }

  set clipsToBounds(value: boolean) {
    this.element.style.overflow = value ? "hidden" : "visible";
    this._clipsToBounds = value;
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this.element.style.color = value;
    this._color = value;
  }

  get testID(): string {
    return this._testID;
  }

  set testID(value: string) {
    this.element.id = value;
    this._testID = value;
  }

  get opacity(): string {
    return this._opacity;
  }

  set opacity(value: string) {
    this.element.style.opacity = value;
    this._opacity = value;
  }

  get transform(): Array<number> {
    return this._transform;
  }

  set transform(value: Array<number>) {
    this.element.style.transform = `matrix3d(${value.join(",")})`;
    this._transform = value;
  }

  insertReactSubviewAtIndex(subview: UIView, index: number) {
    if (index === this.reactSubviews.length) {
      this.element.appendChild(subview.element);
    } else {
      const beforeElement = this.reactSubviews[index].element;
      this.element.insertBefore(subview.element, beforeElement);
    }

    this.reactSubviews.splice(index, 0, subview);
    subview.reactSuperview = this;
  }

  removeReactSubview(subview: UIView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
  }

  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point: { x: number, y: number }): number {
    return 0;
  }

  purge() {
    this.element.remove();
  }
}

export default UIView;
