/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";
import RCTAnimatedNode from "RCTAnimatedNode";

class RCTTransformAnimatedNode extends RCTAnimatedNode {
  propsDictionary: { [propName: string]: any };

  constructor(tag: number, config: Config) {
    super(tag, config);
    this.propsDictionary = {};
  }

  performUpdate() {
    super.performUpdate();

    const transformConfigs = this.config.transforms;
    const transform = [];

    for (let transformConfig of transformConfigs) {
      const type = transformConfig.type;
      const property = transformConfig.property;

      let value;
      if (type === "animated") {
        const nodeTag = transformConfig.nodeTag;
        const node = this.parentNodes ? this.parentNodes[nodeTag] : null;
        if (!(node instanceof RCTValueAnimatedNode)) {
          continue;
        }
        value = node.value;
      } else {
        value = transformConfig.value;
      }
      transform.push({ [property]: value });
    }

    this.propsDictionary.animatedTransform = transform;
  }
}

export default RCTTransformAnimatedNode;
