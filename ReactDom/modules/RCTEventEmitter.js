/**
 * @providesModule RCTNativeEventEmitter
 * @flow
 */

import invariant from "../utils/Invariant";
import RCTBridge, {
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "../bridge/RCTBridge";
import NotificationCenter from "../base/NotificationCenter";

class RCTEventEmitter {
  bridge: RCTBridge;
  listenerCount: number = 0;
  _supportedMethods: ?Array<string>;

  constructor(bridge: RCTBridge, supportedMethods: ?Array<string>) {
    this.bridge = bridge;
    this._supportedMethods = supportedMethods;
  }

  supportedMethods(): ?Array<string> {
    return this._supportedMethods;
  }

  sendEventWithName(eventName: string, body: any) {
    invariant(
      this.bridge,
      "bridge is not set. This is probably because you've" +
        `explicitly synthesized the bridge in ${
          this.constructor.name
        }, even though it's inherited ` +
        "from RCTEventEmitter."
    );

    // TODO: Add debug check for supportedEvents

    if (this.listenerCount > 0) {
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
    /* Does Nothing */
  }

  stopObserving() {
    /* Does Nothing */
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  addListener(eventName: string, callback: ?(body: any) => void) {
    // TODO: Add debug check for supportedEvents

    if (callback != null) {
      NotificationCenter.addListener(eventName, callback);
    }

    this.listenerCount++;
    if (this.listenerCount === 1) {
      this.startObserving();
    }
  }

  removeListener(eventName: string, callback: ?Function) {
    if (callback != null) {
      NotificationCenter.removeListener(eventName, callback);
    }
    this.removeListeners(1);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  removeListeners(count: number) {
    // TODO: Add debug check for supportedEvents

    this.listenerCount = Math.max(this.listenerCount - count, 0);
    if (this.listenerCount === 0) {
      this.stopObserving();
    }
  }
}

export default RCTEventEmitter;
