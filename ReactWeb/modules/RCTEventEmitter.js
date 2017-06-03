// @flow
import invariant from "invariant";
import RCTBridge, { RCT_EXPORT_METHOD, RCTFunctionTypeNormal } from "RCTBridge";

class RCTEventEmitter {
  bridge: ?RCTBridge;
  listenerCount: number = 0;

  setBridge(bridge: RCTBridge) {
    this.bridge = bridge;
  }

  supportedMethods(): ?Array<string> {
    return undefined;
  }

  sendEventWithName(eventName: string, body: any) {
    invariant(
      this.bridge,
      "bridge is not set. This is probably because you've" +
        `explicitly synthesized the bridge in ${this.constructor.name}, even though it's inherited ` +
        "from RCTEventEmitter."
    );

    // TODO: Add debug check for supportedEvents

    if (this.listenerCount > 0) {
      this.bridge.enqueueJSCall(
        "RCTDeviceEventEmitter",
        "emit",
        body ? [eventName, body] : [eventName],
        null
      );
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
  addListener(eventName: string) {
    // TODO: Add debug check for supportedEvents

    this.listenerCount++;
    if (this.listenerCount === 1) {
      this.startObserving();
    }
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
