/**
 * @providesModule UIView
 * @flow
 */

import type RCTTouchHandler from "../modules/RCTTouchHandler";
import type { RCTComponent } from "../views/RCTComponent";
import UIBorderView, { ALL_BORDER_PROPS } from "./UIBorderView";
import CustomElement from "../utils/CustomElement";
import ColorArrayFromHexARGB from "../utils/ColorArrayFromHexARGB";
import * as MatrixMath from "MatrixMath";
import prefixInlineStyles from "../utils/prefixInlineStyles";

export const FrameZero: Frame = {
  top: 0,
  left: 0,
  width: 0,
  height: 0
};

const baseDimension = 1000;

@CustomElement("ui-child-container-view")
export class UIChildContainerView extends HTMLElement {
  constructor() {
    super();
    Object.assign(
      this.style,
      prefixInlineStyles({
        contain: "layout style",
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        userSelect: "inherit",
        transformOrigin: "top left",
        touchAction: "manipulation"
      })
    );
  }
}

export type HitSlop = {
  top?: number,
  bottom?: number,
  left?: number,
  right?: number
};

@CustomElement("ui-hit-slop-view")
export class UIHitSlopView extends HTMLElement {
  static defaultHitSlop: HitSlop = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  viewOwner: UIView;

  constructor(viewOwner: UIView, touchable: boolean) {
    super();

    this.viewOwner = viewOwner;
    this.touchable = touchable;

    Object.assign(
      this.style,
      prefixInlineStyles({
        contain: "strict",
        position: "absolute",
        touchAction: "manipulation"
      })
    );
  }

  set slop(value: HitSlop) {
    const resolvedValue = Object.entries({
      ...UIHitSlopView.defaultHitSlop,
      ...value
    }).reduce(
      (acc, cur: any) => ({
        ...acc,
        [cur[0]]: `${-1 * cur[1]}px`
      }),
      {}
    );

    Object.assign(this.style, resolvedValue);
  }

  set touchable(value: boolean) {
    this.style.cursor = value ? "pointer" : "auto";
  }
}

@CustomElement("ui-view")
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
  _pointerEvents: string = "auto";

  _shadowColor: [number, number, number, number] = [1, 0, 0, 0];
  _shadowOffset: { width: number, height: number } = { width: 0, height: 0 };
  _shadowOpacity: number = 0;
  _shadowRadius: number = 0;

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
    this.opacity = 1;

    this.position = "absolute";
    this.backgroundColor = "rgba(0,0,0,0)";

    Object.assign(
      this.style,
      prefixInlineStyles({
        contain: "size layout style",
        boxSizing: "border-box",
        opacity: "0",
        touchAction: "manipulation",
        userSelect: "inherit",
        isolation: "isolate",
        overflow: "visible"
        // overflow: "hidden"
      })
    );

    ALL_BORDER_PROPS.forEach((propName) => {
      Object.defineProperty(this, propName, {
        configurable: true,
        set: (value) => {
          if (propName.startsWith("border") && propName.endsWith("Radius")) {
            this.style[propName] = `${value}px`;
          }
          // $FlowFixMe
          this.borderChild[propName] = value;
        }
      });
    });
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
      this.updateHostStyle("opacity", `${this._opacity}`);
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
      this.updateTransform();
    }
  }

  get left(): number {
    return this._left;
  }

  set left(value: number) {
    if (value !== this._left) {
      this._left = value;
      this.updateTransform();
    }
  }

  updateTransform() {
    const transforms = [`translate(${this._left}px, ${this._top}px)`];

    if (this._animatedTransform) {
      transforms.push(this._animatedTransform);
    } else if (this._transform) {
      transforms.push(`matrix3d(${this._transform.join(", ")})`);
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

  set pointerEvents(value: string) {
    this._pointerEvents = value;
    switch (value) {
      case "box-none": {
        this.updateHostStyle("pointerEvents", "none");
        this.updateChildContainerStyle("pointerEvents", "all");
        break;
      }
      case "box-only": {
        this.updateHostStyle("pointerEvents", "all");
        this.updateChildContainerStyle("pointerEvents", "none");
        break;
      }
      default: {
        this.updateHostStyle("pointerEvents", value);
        this.updateChildContainerStyle("pointerEvents", value);
      }
    }
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
    this.updateHostStyle("opacity", `${value}`);
  }

  get transform(): number[] {
    return this._transform;
  }

  set transform(value: ?Array<number>) {
    if (value) {
      this._transform = value;
    } else {
      this._transform = MatrixMath.createIdentityMatrix();
    }
    this.updateTransform();
  }

  get animatedTransform(): string {
    return this._animatedTransform;
  }

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

    this._animatedTransform = transformString + " translateZ(0px)";
    this.updateTransform();
  }

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
    console.log(value);
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
    if (deviceType !== "touchOnly") {
      this.addEventListener("mousedown", handler.mouseClickBegan, false);
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
