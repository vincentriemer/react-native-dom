/** @flow */

import RCTValueAnimatedNode from "RCTValueAnimatedNode";

class RCTMultiplicationAnimatedNode extends RCTValueAnimatedNode {
  performUpdate() {
    super.performUpdate();

    const parentNodes = this.parentNodes;
    if (!parentNodes) {
      return;
    }

    const inputNodes: ?(number[]) = this.config.input;
    if (inputNodes && inputNodes.length > 1) {
      const parent1 = parentNodes[inputNodes[0]];
      const parent2 = parentNodes[inputNodes[1]];
      if (
        parent1 instanceof RCTValueAnimatedNode &&
        parent2 instanceof RCTValueAnimatedNode
      ) {
        this.value = parent1.value * parent2.value;
      }
    }
  }
}

export default RCTMultiplicationAnimatedNode;
