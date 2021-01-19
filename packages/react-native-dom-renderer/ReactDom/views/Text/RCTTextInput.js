/** @flow */

import type { Frame } from "InternalLib";
import type RCTBridge from "RCTBridge";
import type RCTEventDispatcher from "RCTEventDispatcher";
import { RCTTextEventType } from "RCTEventDispatcher";
import RCTView from "RCTView";
import { defaultFontSize, defaultFontStack } from "RCTSharedTextValues";

class RCTTextInput extends RCTView {
  inputElement: HTMLInputElement;
  eventDispatcher: RCTEventDispatcher;

  nativeEventCount: number = 0;

  onChange: ?Function;
  isFocused: boolean = false;
  blurOnSubmit: boolean = true;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.eventDispatcher = bridge.getModuleByName("EventDispatcher");

    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";

    this.inputElement.addEventListener("focus", this.handleFocus);
    this.inputElement.addEventListener("blur", this.handleBlur);
    this.inputElement.addEventListener("input", this.handleChange);

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

  handleFocus = () => {
    this.eventDispatcher.sendTextEvent(
      RCTTextEventType.RCTTextEventTypeFocus,
      this.reactTag,
      this.inputElement.value,
      null,
      this.nativeEventCount
    );
  };

  handleBlur = () => {
    this.eventDispatcher.sendTextEvent(
      RCTTextEventType.RCTTextEventTypeEnd,
      this.reactTag,
      this.inputElement.value,
      null,
      this.nativeEventCount
    );

    this.eventDispatcher.sendTextEvent(
      RCTTextEventType.RCTTextEventTypeBlur,
      this.reactTag,
      this.inputElement.value,
      null,
      this.nativeEventCount
    );
  };

  handleChange = () => {
    this.nativeEventCount++;

    if (this.onChange) {
      this.onChange({
        text: this.inputElement.value,
        target: this.reactTag,
        eventCount: this.nativeEventCount
      });
    }
  };

  focus() {
    this.inputElement.addEventListener("keyup", this.handleSubmit);
    this.inputElement.focus();
  }

  blur() {
    this.inputElement.removeEventListener("keyup", this.handleSubmit);
    this.inputElement.blur();
  }

  handleSubmit = (event: KeyboardEvent) => {
    event.preventDefault();
    if (event.keyCode === 13) {
      this.eventDispatcher.sendTextEvent(
        RCTTextEventType.RCTTextEventTypeSubmit,
        this.reactTag,
        this.inputElement.value,
        null,
        this.nativeEventCount
      );

      if (this.blurOnSubmit) {
        this.blur();
      }
    }
  };

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

customElements.define("rct-text-input", RCTTextInput);

export default RCTTextInput;
