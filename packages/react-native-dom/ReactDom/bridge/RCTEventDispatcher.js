/** @flow */

import invariant from "invariant";

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

export const RCTTextEventType = {
  RCTTextEventTypeFocus: 0,
  RCTTextEventTypeBlur: 1,
  RCTTextEventTypeChange: 2,
  RCTTextEventTypeSubmit: 3,
  RCTTextEventTypeEnd: 4,
  RCTTextEventTypeKeyPress: 5
};

export interface RCTEvent {
  viewTag: number;
  eventName: string;
  coalescingKey: number;

  canCoalesce(): boolean;
  coalesceWithEvent(event: RCTEvent): RCTEvent;

  moduleDotMethod(): string;
  arguments(): Array<any>;
}

export interface RCTEventDispatcherObserver {
  eventDispatcherWillDispatchEvent(event: RCTEvent): void;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function normalizeInputEventName(eventName: string) {
  if (eventName.startsWith("on")) {
    eventName = `top${eventName.substring(2)}`;
  } else if (!eventName.startsWith("top")) {
    eventName = `top${capitalizeFirstLetter(eventName)}`;
  }

  return eventName;
}

function stringToHash(input: string): number {
  let hash = 0,
    chr;
  if (input.length === 0) return hash;
  for (let i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

class RCTEventDispatcher extends RCTModule {
  static moduleName = "RCTEventDispatcher";

  events: { [number]: RCTEvent };
  eventQueue: Array<number>;
  // queueLock ??
  eventsDispatchScheduled: boolean;
  observers: Set<RCTEventDispatcherObserver>;
  // observersLock ??

  static RCTGetEventID(event: RCTEvent): number {
    return (
      event.viewTag |
      ((stringToHash(event.eventName) & 0xffff) << 32) |
      (event.coalescingKey << 48)
    );
  }

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.events = {};
    this.eventQueue = [];
    this.eventsDispatchScheduled = false;
    this.observers = new Set();
  }

  sendDeviceEvent(name: string, body: ?Object) {
    this.bridge.enqueueJSCall(
      "RCTDeviceEventEmitter",
      "emit",
      body ? [name, body] : [name]
    );
  }

  sendInputEvent(name: string, body: Object) {
    name = normalizeInputEventName(name);
    this.bridge.enqueueJSCall("RCTEventEmitter", "receiveEvent", [
      body.target,
      name,
      body
    ]);
  }

  /**
   * Send a text input/focus event. For internal use only.
   */
  sendTextEvent(
    type: number,
    reactTag: number,
    text: string,
    key: ?string,
    eventCount: number
  ) {
    const events = [
      "focus",
      "blur",
      "change",
      "submitEditing",
      "endEditing",
      "keyPress"
    ];

    const body: Object = {
      eventCount,
      target: reactTag
    };

    if (text) {
      body.text = text;
    }

    if (key) {
      // TODO: Key Event Handling
    }

    this.sendInputEvent(events[type], body);
  }

  /**
   * Send a pre-prepared event object.
   *
   * Events are sent to JS as soon as the thread is free to process them.
   * If an event can be coalesced and there is another compatible event waiting, the coalescing will happen immediately.
   */
  sendEvent(event: RCTEvent) {
    for (let observer of this.observers) {
      observer.eventDispatcherWillDispatchEvent(event);
    }

    const eventID = RCTEventDispatcher.RCTGetEventID(event);

    const previousEvent = this.events[eventID];
    if (previousEvent) {
      invariant(
        event.canCoalesce(),
        `Got event which cannot be coalesced, but has the same eventID ${eventID} as the previous event`
      );
      event = previousEvent.coalesceWithEvent(previousEvent);
    } else {
      this.eventQueue.push(eventID);
    }

    this.events[eventID] = event;

    let scheduleEventsDispatch = false;
    if (!this.eventsDispatchScheduled) {
      this.eventsDispatchScheduled = true;
      scheduleEventsDispatch = true;
    }

    if (scheduleEventsDispatch) {
      this.flushEventsQueue();
    }
  }

  dispatchEvent(event: RCTEvent) {
    this.bridge.enqueueJSCallWithDotMethod(
      event.moduleDotMethod(),
      event.arguments()
    );
  }

  flushEventsQueue() {
    const events = { ...this.events };
    this.events = {};

    const eventQueue = [...this.eventQueue];
    this.eventQueue = [];

    this.eventsDispatchScheduled = false;

    eventQueue.forEach((eventId) => {
      this.dispatchEvent(events[eventId]);
    });
  }

  addDispatchObserver(observer: RCTEventDispatcherObserver) {
    this.observers.add(observer);
  }

  removeDispatchObserver(observer: RCTEventDispatcherObserver) {
    this.observers.delete(observer);
  }
}

export default RCTEventDispatcher;
