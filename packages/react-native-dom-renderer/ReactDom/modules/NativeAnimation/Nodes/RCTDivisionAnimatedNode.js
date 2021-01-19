/** @flow */

import RCTValueAnimatedNode from "RCTValueAnimatedNode";

class RCTDivisionAnimatedNode extends RCTValueAnimatedNode {
  performUpdate() {
    super.performUpdate();

    const inputNodes: number[] = this.config.input;
    if (inputNodes.length > 1) {
      const parentNodes = this.parentNodes;
      if (!parentNodes) return;

      const parent1 = parentNodes[inputNodes[0]];
      const parent2 = parentNodes[inputNodes[2]];

      if (
        parent1 instanceof RCTValueAnimatedNode &&
        parent2 instanceof RCTValueAnimatedNode
      ) {
        if (parent2.value === 0) {
          console.error("Detected a division by zero in Animated.divide node");
          return;
        }
        this.value = parent1.value / parent2.value;
      }
    }
  }
}

export default RCTDivisionAnimatedNode;
