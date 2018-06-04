/**
 * @providesModule RCTSlider
 * @flow
 */

import type { Frame } from "InternalLib";
import RCTView from "RCTView";
import type RCTBridge from "RCTBridge";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import Slider from "rndom-slider";

@CustomElement("rct-slider")
class RCTSlider extends RCTView {
  bridge: RCTBridge;
  onValueChange: ?(payload: { value: boolean }) => void;
  onSlidingComplete: ?(payload: { value: boolean }) => void;
  childShadowRoot: ShadowRoot;
  platformSlider: Slider;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.style.contain = "size layout style";

    this.platformSlider = new Slider();
    this.platformSlider.addEventListener(
      "valueChange",
      this.handleValueChange.bind(this)
    );
    this.platformSlider.addEventListener(
      "slidingComplete",
      this.handleSlidingComplete.bind(this)
    );

    this.childShadowRoot = this.childContainer.attachShadow({ mode: "open" });
    this.childShadowRoot.appendChild(this.platformSlider);
  }

  handleValueChange(event: {
    preventDefault: Function,
    detail: { value: boolean }
  }) {
    const {
      detail: { value }
    } = event;
    event.preventDefault();
    if (this.onValueChange) {
      this.onValueChange({ value });
    }
  }

  handleSlidingComplete(event: {
    preventDefault: Function,
    detail: { value: boolean }
  }) {
    const {
      detail: { value }
    } = event;
    event.preventDefault();
    if (this.onSlidingComplete) {
      this.onSlidingComplete({ value });
    }
  }

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    super.frame = value;

    const { width, height } = value;
    this.platformSlider.width = width;
    this.platformSlider.height = height;
  }

  set disabled(value: boolean = false) {
    super.disabled = value;
    this.platformSlider.disabled = value;
  }

  set value(value: number = 0) {
    this.platformSlider.value = value;
  }

  set step(value: number = 0) {
    this.platformSlider.step = value;
  }

  set trackImage(value: mixed) {
    this.platformSlider.trackImage = value;
  }

  set minimumTrackImage(value: mixed) {
    this.platformSlider.minimumTrackImage = value;
  }

  set maximumTrackImage(value: mixed) {
    this.platformSlider.maximumTrackImage = value;
  }

  set minimumValue(value: number) {
    this.platformSlider.minimumValue = value;
  }

  set maximumValue(value: number) {
    this.platformSlider.maximumValue = value;
  }

  set minimumTrackTintColor(value: string) {
    this.platformSlider.minimumTrackTintColor = value;
  }

  set maximumTrackTintColor(value: string) {
    this.platformSlider.maximumTrackTintColor = value;
  }

  set thumbImage(value: mixed) {
    this.platformSlider.thumbImage = value;
  }

  set thumbTintColor(value: string) {
    this.platformSlider.thumbTintColor = value;
  }
}

export default RCTSlider;
