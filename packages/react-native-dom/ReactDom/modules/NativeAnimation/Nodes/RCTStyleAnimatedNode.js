/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import RCTTransformAnimatedNode from "RCTTransformAnimatedNode";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";
import RCTAnimatedNode from "RCTAnimatedNode";

class RCTStyleAnimatedNode extends RCTAnimatedNode {
  propsDictionary: { [propName: string]: any };

  constructor(tag: number, config: Config) {
    super(tag, config);
    this.propsDictionary = {};
  }

  performUpdate() {
    super.performUpdate();

    const style: { [propName: string]: any } = this.config.style;
    Object.entries(style).forEach(([property, nodeTag]) => {
      if (this.parentNodes) {
        // $FlowFixMe - Object.entries incorrectly sets value to mixed
        const node: RCTAnimatedNode = this.parentNodes[nodeTag];
        if (node) {
          if (node instanceof RCTValueAnimatedNode) {
            this.propsDictionary[property] = node.value;
          } else if (node instanceof RCTTransformAnimatedNode) {
            this.propsDictionary = {
              ...this.propsDictionary,
              ...node.propsDictionary
            };
          }
        }
      }
    });
  }
}

export default RCTStyleAnimatedNode;
