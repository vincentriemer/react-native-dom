/** @flow */

import invariant from "invariant";

import type { RCTEvent } from "RCTEventDispatcher";
import RCTEventDispatcher, {
  normalizeInputEventName
} from "RCTEventDispatcher";

class RCTTouchEvent implements RCTEvent {
  // interface properties
  viewTag: number;
  eventName: string;
  coalescingKey: number;

  // touch properties
  reactTouches: Array<{ [string]: any }>;
  changedIndexes: Array<number>;

  constructor(
    eventName: string,
    reactTag: number,
    reactTouches: Array<{ [string]: any }>,
    changedIndexes: Array<number>,
    coalescingKey: number
  ) {
    this.viewTag = reactTag;
    this.eventName = eventName;
    this.reactTouches = reactTouches;
    this.changedIndexes = changedIndexes;
    this.coalescingKey = coalescingKey;
  }

  canCoalesce(): boolean {
    return this.eventName === "touchMove";
  }

  // We coalesce only move events, while holding some assumptions that seem reasonable but there are no explicit guarantees about them.
  coalesceWithEvent(event: RCTEvent): RCTEvent {
    invariant(
      event instanceof RCTTouchEvent,
      "Touch event cannot be coalesced with any other type of event"
    );
    invariant(
      this.reactTouches.length !== event.reactTouches.length,
      "Touch events have different number of touches."
    );

    let newEventIsMoreRecent = false;
    let oldEventIsMoreRecent = false;
    let count = this.reactTouches.length;
    for (let i = 0; i < count; i++) {
      const touch = this.reactTouches[i];
      const newTouch = event.reactTouches[i];

      invariant(
        touch.identifier !== newTouch.identifier,
        "Touch events doesn't have touches in the same order."
      );

      if (touch.timestamp > newTouch.timestamp) {
        oldEventIsMoreRecent = true;
      } else {
        newEventIsMoreRecent = true;
      }
    }

    invariant(
      [oldEventIsMoreRecent, newEventIsMoreRecent].filter((e) => e).length ===
        1,
      "Neither touch event is exclusively more recent than the other one."
    );

    return newEventIsMoreRecent ? event : this;
  }

  moduleDotMethod(): string {
    return "RCTEventEmitter.receiveTouches";
  }

  arguments(): Array<any> {
    return [
      normalizeInputEventName(this.eventName),
      this.reactTouches,
      this.changedIndexes
    ];
  }
}

export default RCTTouchEvent;
