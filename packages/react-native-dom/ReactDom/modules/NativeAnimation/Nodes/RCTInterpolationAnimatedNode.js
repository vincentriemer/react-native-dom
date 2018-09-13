/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import type RCTAnimatedNode from "RCTAnimatedNode";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";
import { RCTInterpolateValueInRange } from "RCTAnimationUtils";

class RCTInterpolationAnimatedNode extends RCTValueAnimatedNode {
  parentNode: ?RCTValueAnimatedNode;
  inputRange: number[];
  outputRange: number[];
  extrapolateLeft: string;
  extrapolateRight: string;

  constructor(tag: number, config: Config) {
    super(tag, config);

    this.inputRange = [...config.inputRange];
    this.outputRange = [];
    for (let value of config.outputRange) {
      if (typeof value === "number") {
        this.outputRange.push(value);
      }
    }
    this.extrapolateLeft = config.extrapolateLeft;
    this.extrapolateRight = config.extrapolateRight;
  }

  onAttachedToNode(parent: RCTAnimatedNode) {
    super.onAttachedToNode(parent);
    if (parent instanceof RCTValueAnimatedNode) {
      this.parentNode = parent;
    }
  }

  onDetachedFromNode(parent: RCTAnimatedNode) {
    super.onDetachedFromNode(parent);
    if (this.parentNode === parent) {
      this.parentNode = null;
    }
  }

  performUpdate() {
    super.performUpdate();

    const parentNode = this.parentNode;
    if (!parentNode) {
      return;
    }

    const inputValue = parentNode.value;

    const outputValue = RCTInterpolateValueInRange(
      inputValue,
      this.inputRange,
      this.outputRange,
      this.extrapolateLeft,
      this.extrapolateRight
    );

    this._value = outputValue;
  }
}

export default RCTInterpolationAnimatedNode;
