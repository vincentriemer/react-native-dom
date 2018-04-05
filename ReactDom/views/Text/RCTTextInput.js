/**
 * @providesModule RCTTextInput
 * @flow
 */

import type RCTBridge from "../../bridge/RCTBridge";

import RCTView from "../RCTView";
import { defaultFontStack, defaultFontSize } from "./RCTSharedTextValues";
import CustomElement from "../../utils/CustomElement";

@CustomElement("rct-text-input")
class RCTTextInput extends RCTView {
  inputElement: HTMLInputElement;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";

    Object.assign(this.inputElement.style, {
      fontFamily: defaultFontStack,
      fontSize: `${defaultFontSize}px`,
      backgroundColor: "transparent",
      border: "0px solid"
    });

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(this.inputElement);
    shadowRoot.appendChild(document.createElement("slot"));
  }

  set borderRadius(value: number) {
    // $FlowFixMe
    super.borderRadius = value;
    this.inputElement.style.borderRadius = `${value}px`;
  }

  get frame(): Frame {
    return super.frame;
  }

  set padding(value: number) {
    this.inputElement.style.padding = `${value}px`;
  }

  set paddingLeft(value: number) {
    this.inputElement.style.paddingLeft = `${value}px`;
  }

  set paddingRight(value: number) {
    this.inputElement.style.paddingRight = `${value}px`;
  }

  set paddingTop(value: number) {
    this.inputElement.style.paddingTop = `${value}px`;
  }

  set paddingBottom(value: number) {
    this.inputElement.style.paddingBottom = `${value}px`;
  }

  set paddingVertical(value: number) {
    this.paddingTop = value;
    this.paddingBottom = value;
  }

  set paddingHorizontal(value: number) {
    this.paddingLeft = value;
    this.paddingRight = value;
  }

  set frame(value: Frame) {
    super.frame = value;
    Object.assign(this.inputElement.style, {
      top: `${value.top}px`,
      left: `${value.left}px`,
      width: `${value.width}px`,
      height: `${value.height}px`
    });
  }

  set fontFamily(value: string) {
    this.style.fontFamily = value;
  }

  set fontSize(value: any) {
    this.style.fontSize = value;
  }

  set textAlign(value: string) {
    this.style.textAlign = value;
  }

  set fontWeight(value: string) {
    this.style.fontWeight = value;
  }
}

export default RCTTextInput;
