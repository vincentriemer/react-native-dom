/**
 * @providesModule RCTSwitch
 * @flow
 */

import RCTView from "RCTView";
import type RCTBridge from "RCTBridge";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import PlatformSwitch from "PlatformSwitch";

@CustomElement("rct-switch")
class RCTSwitch extends RCTView {
  bridge: RCTBridge;
  onChange: ?(payload: { value: boolean }) => void;
  childShadowRoot: ShadowRoot;
  platformSwitch: PlatformSwitch;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.style.contain = "strict";

    this.platformSwitch = new PlatformSwitch();
    this.platformSwitch.addEventListener(
      "onchange",
      this.handleChange.bind(this)
    );

    this.childShadowRoot = this.childContainer.attachShadow({ mode: "open" });
    this.childShadowRoot.appendChild(this.platformSwitch);
  }

  handleChange({ detail: { value } }: { detail: { value: boolean } }) {
    if (this.onChange) {
      this.onChange({ value });
    }
  }

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    super.frame = value;

    const { width, height } = value;
    this.platformSwitch.width = width;
    this.platformSwitch.height = height;
  }

  set disabled(value: boolean = false) {
    super.disabled = value;
    this.platformSwitch.disabled = value;
  }

  set value(value: boolean = false) {
    this.platformSwitch.value = value;
  }

  set tintColor(value: string) {
    this.platformSwitch.tintColor = value;
  }

  set onTintColor(value: string) {
    this.platformSwitch.onTintColor = value;
  }

  set thumbTintColor(value: string) {
    this.platformSwitch.thumbTintColor = value;
  }
}

export default RCTSwitch;
