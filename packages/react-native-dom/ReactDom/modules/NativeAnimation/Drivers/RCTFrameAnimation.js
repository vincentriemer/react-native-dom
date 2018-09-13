/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import type { RCTAnimationDriver } from "RCTAnimationDriver";
import type RCTValueAnimatedNode from "RCTValueAnimatedNode";
import { RCTSingleFrameInterval } from "RCTAnimationDriver";
import { RCTInterpolateValue } from "RCTAnimationUtils";

class RCTFrameAnimation implements RCTAnimationDriver {
  animationId: number;
  valueNode: RCTValueAnimatedNode;
  animationHasBegun: boolean;
  animationHasFinished: boolean;

  animationStartTime: number;
  animationCurrentTime: number;

  frames: number[];
  toValue: number;
  fromValue: number;
  callback: ?Function;
  iterations: number;
  currentLoop: number;

  constructor(
    animationId: number,
    config: Config,
    valueNode: RCTValueAnimatedNode,
    callback: ?Function
  ) {
    this.animationId = animationId;
    this.toValue = config.toValue != null ? config.toValue : 1;
    this.fromValue = valueNode.value;
    this.valueNode = valueNode;
    this.frames = [...config.frames];
    this.callback = callback;
    this.iterations = config.iterations != null ? config.iterations : 1;
    this.currentLoop = 1;
    this.animationHasBegun = false;
    this.animationHasFinished = this.iterations === 0;
    return this;
  }

  startAnimation() {
    this.animationStartTime = -1;
    this.animationCurrentTime = -1;
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
      this.animationStartTime = this.animationCurrentTime = currentTime;
    }

    this.animationCurrentTime = currentTime;
    const currentDuration = this.animationCurrentTime - this.animationStartTime;

    // Determine how many frames have passed since last update.
    // Get index of frames that surround the current interval
    const startIndex = Math.floor(currentDuration / RCTSingleFrameInterval);
    const nextIndex = startIndex + 1;

    if (nextIndex >= this.frames.length) {
      if (this.iterations == -1 || this.currentLoop < this.iterations) {
        // Looping, reset to the first frame value.
        this.animationStartTime = currentTime;
        this.currentLoop++;
        const firstValue = this.frames[0];
        this.updateOutputWithFrameOutput(firstValue);
      } else {
        this.animationHasFinished = true;
        // We are at the end of the animation
        // Update value and flag animation has ended.
        const finalValue = this.frames[this.frames.length - 1];
        this.updateOutputWithFrameOutput(finalValue);
      }
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
