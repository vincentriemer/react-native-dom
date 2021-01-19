/** @flow */

import invariant from "invariant";

import type RCTAnimatedNode from "RCTAnimatedNode";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";

class RCTDiffClampAnimatedNode extends RCTValueAnimatedNode {
  inputNodeTag: number;
  min: number;
  max: number;
  lastValue: ?number;

  constructor(tag: number, config: Object) {
    super(tag, config);
    this.inputNodeTag = config.input;
    this.min = config.min;
    this.max = config.max;
  }

  onAttachedToNode(parent: RCTAnimatedNode) {
    super.onAttachedToNode(parent);
    this.value = this.lastValue = this.inputNodeValue;
  }

  performUpdate() {
    super.performUpdate();

    const lastValue = this.lastValue ? this.lastValue : 0;
    const value = this.inputNodeValue;

    const diff = value - lastValue;
    this.lastValue = value;
    this.value = Math.min(Math.max(this.value + diff, this.min), this.max);
  }

  get inputNodeValue(): number {
    invariant(this.parentNodes, `diffClamp node has no parents`);
    const inputNode = this.parentNodes[this.inputNodeTag];
    if (!(inputNode instanceof RCTValueAnimatedNode)) {
      console.error(
        "Illegal node ID set as an input for Animated.DiffClamp node"
      );
      return 0;
    }
    return inputNode.value;
  }
}

export default RCTDiffClampAnimatedNode;
