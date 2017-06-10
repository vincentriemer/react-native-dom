/**
 * @providesModule UIView
 * @flow
 */

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

export const FrameZero: Frame = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

class UIView {
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
  // opaque: boolean = true; TODO: this seems to be very UI specific

  // DOM-Related Properties
  tag: HTMLTag = "div";
  element: HTMLElement;

  constructor(frame: Frame, tag: ?HTMLTag) {
    if (tag != undefined) {
      this.tag = tag;
    }

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

  get frame(): Frame {
    return {
      left: this._left,
      top: this._top,
      width: this._width,
      height: this._height,
    };
  }

  set frame(value: Frame) {
    this.left = value.left;
    this.top = value.top;
    this.width = value.width;
    this.height = value.height;
  }

  // Visual Getters and Setters
  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this.element.style.backgroundColor = value;
    this._backgroundColor = value;
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
}

export default UIView;
