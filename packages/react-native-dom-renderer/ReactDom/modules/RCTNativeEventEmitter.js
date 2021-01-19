/** @flow */

import invariant from "invariant";

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import NotificationCenter from "NotificationCenter";

class RCTNativeEventEmitter extends RCTModule {
  _listenerCount: number = 0;

  constructor(bridge: RCTBridge) {
    super(bridge);
  }

  supportedMethods(): Array<string> {
    return [];
  }

  sendEventWithName(eventName: string, body: any) {
    invariant(
      this.bridge,
      "bridge is not set. This is probably because you've" +
        `explicitly synthesized the bridge in ${
          this.constructor.name
        }, even though it's inherited ` +
        "from RCTNativeEventEmitter."
    );

    // TODO: Add debug check for supportedEvents

    if (this._listenerCount > 0) {
      this.bridge.enqueueJSCall(
        "RCTDeviceEventEmitter",
        "emit",
        body ? [eventName, body] : [eventName]
      );
      NotificationCenter.emitEvent(eventName, [body]);
    } else {
      console.warn(`Sending ${eventName} with no listeners registered`);
    }
  }

  startObserving() {
    /* To be overriden by subclass */
  }

  stopObserving() {
    /* To be overriden by subclass */
  }

  $addListener(eventName: string) {
    this.addListener(eventName);
  }

  addListener(eventName: string, callback: ?(body: any) => void) {
    // TODO: Add debug check for supportedEvents

    if (callback != null) {
      NotificationCenter.addListener(eventName, callback);
    }

    this._listenerCount++;
    if (this._listenerCount === 1) {
      this.startObserving();
    }
  }

  removeListener(eventName: string, callback: ?Function) {
    if (callback != null) {
      NotificationCenter.removeListener(eventName, callback);
    }
    this.$removeListeners(1);
  }

  $removeListeners(count: number) {
    // TODO: Add debug check for supportedEvents

    this._listenerCount = Math.max(this._listenerCount - count, 0);
    if (this._listenerCount === 0) {
      this.stopObserving();
    }
  }
}

export default RCTNativeEventEmitter;
