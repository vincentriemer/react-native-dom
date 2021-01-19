/** @flow */

import invariant from "invariant";

import type { Config } from "RCTNativeAnimatedModule";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";
import RCTAnimatedNode from "RCTAnimatedNode";

class RCTTrackingAnimatedNode extends RCTAnimatedNode {
  animationId: number;
  toValueNodeTag: number;
  valueNodeTag: number;
  animationConfig: Object;

  constructor(tag: number, config: Config) {
    super(tag, config);

    this.animationId = config.animationId;
    this.toValueNodeTag = config.toValue;
    this.valueNodeTag = config.value;
    this.animationConfig = config.animationConfig;
  }

  onDetachedFromNode(parent: RCTAnimatedNode) {
    this.manager.stopAnimation(this.animationId);
    super.onDetachedFromNode(parent);
  }

  performUpdate() {
    super.performUpdate();

    const parentNodes = this.parentNodes;
    invariant(parentNodes, `No parent nodes in TrackingAnimatedNode`);

    // change animation config's "toValue" to reflect updated value of the parent node
    const node: RCTValueAnimatedNode = (parentNodes[this.toValueNodeTag]: any);
    this.animationConfig.toValue = node.value;

    this.manager.startAnimatingNode(
      this.animationId,
      this.valueNodeTag,
      this.animationConfig,
      null
    );
  }
}

export default RCTTrackingAnimatedNode;
