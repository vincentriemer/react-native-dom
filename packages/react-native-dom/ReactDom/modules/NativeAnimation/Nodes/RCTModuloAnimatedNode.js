/** @flow */

import invariant from "invariant";

import RCTValueAnimatedNode from "RCTValueAnimatedNode";

class RCTModuloAnimatedNode extends RCTValueAnimatedNode {
  performUpdate() {
    super.performUpdate();
    const inputNode = this.config.input;
    const modulus = this.config.modulus;
    if (this.parentNodes) {
      const parent = this.parentNodes[inputNode];
      invariant(
        parent instanceof RCTValueAnimatedNode,
        "Parent AnimatedNode must be an RCTValueAnimatedNode"
      );
      this.value = parent.value % modulus;
    }
  }
}

export default RCTModuloAnimatedNode;
