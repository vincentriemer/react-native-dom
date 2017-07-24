/**
 * @providesModule RCTFrameAnimation
 * @flow
 */

import type { Config } from "RCTNativeAnimatedModule";
import type { RCTAnimationDriver } from "RCTAnimationDriver";
import type RCTValueAnimatedNode from "RCTValueAnimatedNode";

import { RCTInterpolateValue } from "RCTAnimationUtils";

const RCTSingleFrameInterval = 16.667;

class RCTFrameAnimation implements RCTAnimationDriver {
  animationId: number;
  valueNode: ?RCTValueAnimatedNode;
  animationHasBegun: boolean;
  animationHasFinished: boolean;

  animationStartTime: number;
  animationCurrentTIme: number;

  frames: number[];
  toValue: number;
  fromValue: number;
  callback: Function;

  constructor(
    animationId: number,
    config: Config,
    valueNode: RCTValueAnimatedNode,
    callback: Function
  ) {
    this.animationId = animationId;
    this.toValue = config.toValue != null ? config.toValue : 1;
    this.fromValue = valueNode.value;
    this.valueNode = valueNode;
    this.frames = [...config.frames];
    this.callback = callback;
    this.animationHasBegun = false;
    this.animationHasBegun = false;
  }

  startAnimation() {
    this.animationStartTime = this.animationCurrentTIme = -1;
    this.animationHasBegun = true;
  }

  stopAnimation() {
    // this.valueNode = null;
    if (this.callback) {
      this.callback({
        finished: this.animationHasFinished
      });
    }
  }

  stepAnimationWithTime(currentTime: number) {
    if (
      !this.animationHasBegun ||
      this.animationHasFinished ||
      this.frames.length === 0
    ) {
      // Animation has not begun or animation has already finished.
      return;
    }

    if (this.animationStartTime === -1) {
      this.animationStartTime = this.animationCurrentTIme = currentTime;
    }

    this.animationCurrentTIme = currentTime;
    const currentDuration = this.animationCurrentTIme - this.animationStartTime;

    // Determine how many frames have passed since last update.
    // Get index of frames that surround the current interval
    const startIndex = Math.floor(currentDuration / RCTSingleFrameInterval);
    const nextIndex = startIndex + 1;

    if (nextIndex >= this.frames.length) {
      // We are at the end of the animation
      // Update value and flag animation has ended.
      const finalValue = this.frames[this.frames.length - 1];
      this.updateOutputWithFrameOutput(finalValue);
      this.animationHasFinished = true;
      return;
    }

    // Do a linear remap of the two frames to safegaurd against variable framerates
    const fromFrameValue = this.frames[startIndex];
    const toFrameValue = this.frames[nextIndex];
    const fromInterval = startIndex * RCTSingleFrameInterval;
    const toInterval = nextIndex * RCTSingleFrameInterval;

    // Interpolate between the individual frames to ensure the animations are
    //smooth and of the proper duration regardless of the framerate.
    const frameOutput = RCTInterpolateValue(
      currentDuration,
      fromInterval,
      toInterval,
      fromFrameValue,
      toFrameValue,
      "extend",
      "extend"
    );

    this.updateOutputWithFrameOutput(frameOutput);
  }

  updateOutputWithFrameOutput(frameOutput: number) {
    const outputValue = RCTInterpolateValue(
      frameOutput,
      0,
      1,
      this.fromValue,
      this.toValue,
      "extend",
      "extend"
    );

    const valueNode = this.valueNode;
    if (valueNode) {
      valueNode.value = outputValue;
      valueNode.setNeedsUpdate();
    }
  }
}

export default RCTFrameAnimation;
