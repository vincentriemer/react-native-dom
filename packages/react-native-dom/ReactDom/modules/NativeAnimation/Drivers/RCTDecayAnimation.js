/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import type { RCTAnimationDriver } from "RCTAnimationDriver";
import type RCTValueAnimatedNode from "RCTValueAnimatedNode";
import { RCTSingleFrameInterval } from "RCTAnimationDriver";

class RCTDecayAnimation implements RCTAnimationDriver {
  animationId: number;
  valueNode: RCTValueAnimatedNode;
  animationHasBegun: boolean;
  animationHasFinished: boolean;

  velocity: number;
  deceleration: number;
  frameStartTime: number;
  fromValue: number;
  lastValue: number;
  iterations: number;
  currentLoop: number;
  callback: ?Function;

  constructor(
    animationId: number,
    config: Config,
    valueNode: RCTValueAnimatedNode,
    callback: ?Function
  ) {
    this.animationId = animationId;
    this.fromValue = 0;
    this.lastValue = 0;
    this.valueNode = valueNode;
    this.callback = callback;
    this.velocity = config.velocity;
    this.deceleration = config.deceleration;
    this.iterations = config.iterations != null ? config.iterations : 1;
    this.currentLoop = 1;
    this.animationHasFinished = this.iterations === 0;
    return this;
  }

  startAnimation() {
    this.frameStartTime = -1;
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
    const valueNode = this.valueNode;

    if (
      valueNode == null ||
      !this.animationHasBegun ||
      this.animationHasFinished
    ) {
      // Animation has not begun or animation has already finished.
      return;
    }

    if (this.frameStartTime === -1) {
      // Since this is the first animation step, consider the start to be on the previous frame.
      this.frameStartTime = currentTime - RCTSingleFrameInterval;

      if (this.fromValue === this.lastValue) {
        // First iteration, assign _fromValue based on _valueNode.
        this.fromValue = valueNode.value;
      } else {
        // Not the first iteration, reset _valueNode based on _fromValue.
        this.updateValue(this.fromValue);
      }
      this.lastValue = valueNode.value;
    }

    const value =
      this.fromValue +
      (this.velocity / (1 - this.deceleration)) *
        (1 -
          Math.exp(
            -(1 - this.deceleration) * (currentTime - this.frameStartTime)
          ));

    this.updateValue(value);

    if (Math.abs(this.lastValue - value) < 0.1) {
      if (this.iterations === -1 || this.currentLoop < this.iterations) {
        this.frameStartTime = -1;
        this.currentLoop++;
      } else {
        this.animationHasFinished = true;
        return;
      }
    }

    this.lastValue = value;
  }

  updateValue(outputValue: number) {
    const valueNode = this.valueNode;
    if (valueNode) {
      valueNode.value = outputValue;
      valueNode.setNeedsUpdate();
    }
  }
}

export default RCTDecayAnimation;
