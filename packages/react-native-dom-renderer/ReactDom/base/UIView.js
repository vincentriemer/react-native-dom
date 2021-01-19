/** @flow */

import debounce from "debounce";

import * as MatrixMath from "NativeMatrixMath";
import UIHitSlopView, { type HitSlop } from "UIHitSlopView";
import UIChildContainerView from "UIChildContainerView";
import type { Frame } from "InternalLib";
import type RCTTouchHandler from "RCTTouchHandler";
import type { RCTComponent } from "RCTComponent";
import UIBorderView, { ALL_BORDER_PROPS } from "UIBorderView";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import prefixInlineStyles from "prefixInlineStyles";
import isIOS from "isIOS";

type WillChangeRegistry = {
  [key: string]: number
};

declare var __DEV__: boolean;

(() => {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
    .pe-auto, .pe-box-only {
      pointer-events: auto;
    }
    .pe-box-only > * {
      pointer-events: none;
    }
    .pe-none, .pe-box-none, .pe-none * {
      pointer-events: none !important;
    }
    .pe-box-none > * {
      pointer-events: auto;
    }
  `;
  document.head && document.head.appendChild(styleElement);
})();

class UIView extends HTMLElement implements RCTComponent {
  _top: number = 0;
  _left: number = 0;
  _bottom: number = 0;
  _right: number = 0;
  _width: number = 0;
  _height: number = 0;
  _touchable: boolean = false;
  _opacity: number;
  _transform: number[];
  _animatedTransform: string;
  _backgroundColor: string;
  _disabled: boolean = false;
  _pointerEvents: ?string;

  _shadowColor: [number, number, number, number] = [1, 0, 0, 0];
  _shadowOffset: { width: number, height: number } = { width: 0, height: 0 };
  _shadowOpacity: number = 0;
  _shadowRadius: number = 0;

  _willChangeRegistry: WillChangeRegistry;

  childContainer: UIChildContainerView;
  borderView: ?UIBorderView;
  hitSlopView: ?UIHitSlopView;

  _reactTag: number;
  reactSubviews: Array<UIView>;
  reactSuperview: ?UIView;
  hasBeenFramed: boolean;

  constructor() {
    super();

    this.childContainer = new UIChildContainerView();
    this.appendChild(this.childContainer);

    this.reactSubviews = [];
    this.hasBeenFramed = false;

    this.position = "absolute";
    this.backgroundColor = "rgba(0,0,0,0)";

    this._willChangeRegistry = {};

    this.pointerEvents = "auto";

    Object.assign(
      this.style,
      prefixInlineStyles({
        contain: "size layout style",
        boxSizing: "border-box",
        userSelect: "inherit",
        overflow: "visible",
        touchAction: "manipulation",
        unicodeBidi: "embed",
        top: "0",
        left: "0"
      })
    );

    ALL_BORDER_PROPS.forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          if (propName.startsWith("border") && propName.endsWith("Radius")) {
            // $FlowFixMe
            this.style[propName] = `${value}px`;
          }
          // $FlowFixMe
          this.borderChild[propName] = value;
        }
      });
    });
  }

  addWillChange(key: string) {
    if (this._willChangeRegistry.hasOwnProperty(key)) {
      this._willChangeRegistry[key] += 1;
    } else {
      this._willChangeRegistry[key] = 1;
    }
    this.updateWillChange();
  }

  removeWillChange(key: string) {
    if (this._willChangeRegistry.hasOwnProperty(key)) {
      if (this._willChangeRegistry[key] === 1) {
        delete this._willChangeRegistry[key];
      } else {
        this._willChangeRegistry[key] -= 1;
      }
      this.updateWillChange();
    }
  }

  updateWillChange() {
    this.style.willChange = Object.keys(this._willChangeRegistry).join(", ");
  }

  prefixStyle(propName: string | Object, propValue?: string) {
    let styleObject = {};
    if (typeof propName === "string") {
      styleObject[propName] = propValue;
    } else {
      styleObject = propName;
    }
    return prefixInlineStyles(styleObject);
  }

  updateHostStyle(propName: string | Object, propValue?: string) {
    Object.assign(this.style, this.prefixStyle(propName, propValue));
  }

  updateChildContainerStyle(propName: string | Object, propValue?: string) {
    Object.assign(
      this.childContainer.style,
      this.prefixStyle(propName, propValue)
    );
  }

  get reactTag(): number {
    return this._reactTag;
  }

  set reactTag(value: number) {
    this._reactTag = value;
    if (__DEV__) {
      this.setAttribute("rct-tag", `${value}`);
    }
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

    this.childContainer.updateDimensions(value.width, value.height);
    if (this.borderView) {
      this.borderView.updateDimensions(value.width, value.height);
    }
    if (!this.hasBeenFramed) {
      this.hasBeenFramed = true;
    }
  }

  set position(value: string) {
    this.updateHostStyle("position", value);
  }

  get top(): number {
    return this._top;
  }

  set top(value: number) {
    if (value !== this._top) {
      this._top = value;
      this.updateHostStyle("top", `${value}px`);
    }
  }

  get left(): number {
    return this._left;
  }

  set left(value: number) {
    if (value !== this._left) {
      this._left = value;
      this.updateHostStyle("left", `${value}px`);
    }
  }

  updateTransform() {
    const transforms = [];

    if (this._animatedTransform) {
      transforms.push(this._animatedTransform);
    } else if (this._transform) {
      transforms.push(
        this._transform.length === 6
          ? `matrix(${this._transform.join(", ")}`
          : `matrix3d(${this._transform.join(", ")})`
      );
    }

    const transformString = transforms.join(" ");

    this.updateHostStyle("transform", transformString);
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    if (value !== this._width) {
      this._width = value;
      this.updateHostStyle("width", `${value}px`);
    }
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    if (value !== this._height) {
      this._height = value;
      this.updateHostStyle("height", `${value}px`);
    }
  }

  set backgroundColor(value: string | number) {
    let resolvedValue = value;
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this._backgroundColor = stringValue;
      this.updateHostStyle("backgroundColor", stringValue);
    } else {
      this._backgroundColor = value;
      this.updateHostStyle("backgroundColor", value);
    }
  }

  _prevPointerEvents: ?string;
  updateDerivedPointerEvents() {
    if (this._prevPointerEvents != null) {
      this.classList.remove(this._prevPointerEvents);
    }

    const nextValue = (() => {
      if (this._touchable) {
        if (
          this._pointerEvents != null &&
          ["none", "box-none", "box-only"].includes(this._pointerEvents)
        ) {
          return `pe-${this._pointerEvents}`;
        }
        return `pe-auto`;
      }
      return `pe-box-none`;
    })();

    this.classList.add(nextValue);
    this._prevPointerEvents = nextValue;
  }

  set pointerEvents(value: string) {
    this._pointerEvents = value;
    this.updateDerivedPointerEvents();
  }

  isAnimatingOpacity = false;

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    if (this._opacity === value) return;

    if (!this.isAnimatingOpacity && this._opacity != null) {
      this.addWillChange("opacity");
      this.isAnimatingOpacity = true;
    }

    this.handleEndedAnimatedOpacity();

    this._opacity = value;
    this.updateHostStyle("opacity", `${value}`);
  }

  handleEndedAnimatedOpacity = debounce(() => {
    if (this.isAnimatingOpacity) {
      this.removeWillChange("opacity");
      this.isAnimatingOpacity = false;
    }
  }, 200);

  get transform(): number[] {
    return this._transform;
  }

  attempt2d(v: Array<number>) {
    if (
      v[2] === 0 &&
      v[3] === 0 &&
      v[6] === 0 &&
      v[7] === 0 &&
      v[8] === 0 &&
      v[9] === 0 &&
      v[10] === 1 &&
      v[11] === 0 &&
      v[14] === 0 &&
      v[15] === 1
    ) {
      return [v[0], v[1], v[4], v[5], v[12], v[13]];
    }
  }

  set transform(value: ?Array<number>) {
    if (value) {
      const maybe2d = this.attempt2d(value);
      this._transform = maybe2d ? maybe2d : value;
    } else {
      this._transform = [1, 0, 0, 1, 0, 0];
    }
    this.updateTransform();
  }

  get animatedTransform(): string {
    return this._animatedTransform;
  }

  isAnimatingTransform = false;

  set animatedTransform(value: ?Array<Object>) {
    if (!value) {
      this._animatedTransform = "";
      this.updateTransform();
      return;
    }

    let transformString = "";
    value.forEach((transformObject) => {
      Object.keys(transformObject).forEach((property) => {
        const value = transformObject[property];
        if (["translateX", "translateY", "translateZ"].includes(property)) {
          transformString += `${property}(${value}px)`;
        } else if (
          ["rotate", "rotateX", "rotateY", "rotateZ"].includes(property)
        ) {
          transformString += `${property}(${value}rad)`;
        } else {
          transformString += `${property}(${value})`;
        }
      });
    });

    if (transformString === this._animatedTransform) return;

    if (!this.isAnimatingTransform) {
      this.addWillChange("transform");
      this.isAnimatingTransform = true;
    }

    this.handleEndedAnimatedTransform();

    this._animatedTransform = transformString;
    this.updateTransform();
  }

  handleEndedAnimatedTransform = debounce(() => {
    if (this.isAnimatingTransform) {
      this.removeWillChange("transform");
      this.isAnimatingTransform = false;
    }
  }, 200);

  get borderChild(): UIBorderView {
    if (!this.borderView) {
      const borderView = new UIBorderView();

      this.appendChild(borderView);
      this.borderView = borderView;
      return borderView;
    }

    return this.borderView;
  }

  get touchable(): boolean {
    return this._touchable;
  }

  updateCursor() {
    const cursorValue = this._touchable && !this._disabled ? "pointer" : "auto";
    this.updateHostStyle("cursor", cursorValue);
  }

  set touchable(value: boolean) {
    this._touchable = value;
    if (this.hitSlopView) {
      this.hitSlopView.touchable = value;
    }
    this.updateDerivedPointerEvents();
    this.updateCursor();
  }

  set disabled(value: boolean) {
    this._disabled = value;
    this.updateCursor();
  }

  set zIndex(value: number) {
    this.updateHostStyle("zIndex", `${value}`);
  }

  set overflow(value: string) {
    if (value === "scroll") value = "auto";
    this.updateHostStyle("overflow", value);
  }

  set backfaceVisibility(value: string) {
    this.updateHostStyle("backfaceVisibility", value);
  }

  // SHADOW PROPS ================================================

  updateShadow() {
    const [, r, g, b] = this._shadowColor;
    const resolvedColor = `rgba(${r}, ${g}, ${b}, ${this._shadowOpacity})`;

    this.updateHostStyle(
      "boxShadow",
      `${this._shadowOffset.width}px ${this._shadowOffset.height}px ${
        this._shadowRadius
      }px ${resolvedColor}`
    );
  }

  set shadowColor(value: number) {
    const color = ColorArrayFromHexARGB(value);
    this._shadowColor = color;
    this.updateShadow();
  }

  set shadowOffset(value: { width: number, height: number }) {
    this._shadowOffset = value;
    this.updateShadow();
  }

  set shadowOpacity(value: number) {
    this._shadowOpacity = value;
    this.updateShadow();
  }

  set shadowRadius(value: number) {
    this._shadowRadius = value;
    this.updateShadow();
  }

  // HITSLOP PROPS ================================================

  set hitSlop(value?: HitSlop) {
    if (value != null) {
      let hitSlopView = this.hitSlopView;
      if (hitSlopView == null) {
        hitSlopView = new UIHitSlopView(this, this._touchable);
        this.insertBefore(hitSlopView, this.childContainer);
        this.hitSlopView = hitSlopView;
      }
      hitSlopView.slop = value;
    } else if (this.hitSlopView != null) {
      this.removeChild(this.hitSlopView);
      this.hitSlopView = undefined;
    }
  }

  // Direction ================================================

  set direction(value: ?string) {
    let resolvedValue;
    switch (value) {
      case "ltr":
      case "rtl":
        resolvedValue = value;
        break;
      default:
        resolvedValue = "auto";
        break;
    }
    this.style.direction = resolvedValue;
  }

  insertReactSubviewAtIndex(subview: UIView, index: number) {
    if (index === this.reactSubviews.length) {
      this.childContainer.appendChild(subview);
    } else {
      const beforeElement = this.reactSubviews[index];
      this.childContainer.insertBefore(subview, beforeElement);
    }

    this.reactSubviews.splice(index, 0, subview);
    subview.reactSuperview = this;
  }

  removeReactSubview(subview: UIView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter((s) => s !== subview);
  }

  purge() {
    if (this.reactSuperview) {
      this.reactSuperview.removeReactSubview(this);
    }
    this.remove();
  }

  addGestureRecognizer(
    handler: RCTTouchHandler,
    deviceType: "mouseOnly" | "touchOnly" | "hybrid",
    touchListenerOptions: Object | boolean
  ) {
    // $FlowFixMe
    this.addEventListener(
      "pointerdown",
      handler.pointerBegan,
      touchListenerOptions
    );
  }

  removeGestureRecognizer(
    handler: RCTTouchHandler,
    touchListenerOptions: Object | boolean
  ) {
    // $FlowFixMe
    this.addEventListener(
      "pointerdown",
      handler.pointerBegan,
      touchListenerOptions
    );
  }
}

customElements.define("ui-view", UIView);

export default UIView;
