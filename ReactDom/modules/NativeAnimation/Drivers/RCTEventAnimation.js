/**
 * @providesModule RCTEventAnimation
 * @flow
 */

import type RCTValueAnimatedNode from "../Nodes/RCTValueAnimatedNode";
import type { RCTEvent } from "../../../bridge/RCTEventDispatcher";

class RCTEventAnimation {
  eventPath: string[];
  valueNode: RCTValueAnimatedNode;

  constructor(eventPath: string[], valueNode: RCTValueAnimatedNode) {
    this.eventPath = eventPath;
    this.valueNode = valueNode;
  }

  updateWithEvent(event: RCTEvent) {
    const args = event.arguments();
    // Supported events args are in the following order: viewTag, eventName, eventData.
    let currentValue = args[2];
    for (let key of this.eventPath) {
      currentValue = currentValue[key];
    }

    this.valueNode.value = currentValue;
    this.valueNode.setNeedsUpdate();
  }
}

export default RCTEventAnimation;
