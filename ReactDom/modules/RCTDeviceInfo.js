/**
 * @providesModule RCTDeviceInfo
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE, RCT_EXPORT_METHOD } from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

@RCT_EXPORT_MODULE("RCTDeviceInfo")
class RCTDeviceInfo extends RCTEventEmitter {
  constructor(bridge: RCTBridge) {
    super(bridge);

    window.addEventListener(
      "resize",
      this.didUpdateDimensions.bind(this),
      false
    );

    this.listenerCount = 1;
  }

  constantsToExport() {
    return {
      Dimensions: this.exportedDimensions()
    };
  }

  supportedEvents() {
    return ["didUpdateDimensions"];
  }

  exportedDimensions() {
    const dims = {
      width: Math.ceil(window.innerWidth),
      height: Math.ceil(window.innerHeight),
      scale: this.getDevicePixelRatio(),
      fontScale: 1
    };

    return {
      window: dims,
      screen: dims
    };
  }

  getDevicePixelRatio(): number {
    let ratio = 1;
    // To account for zoom, change to use deviceXDPI instead of systemXDPI
    if (
      window.screen.systemXDPI !== undefined &&
      window.screen.logicalXDPI !== undefined &&
      window.screen.systemXDPI > window.screen.logicalXDPI
    ) {
      // Only allow for values > 1
      ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    } else if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    }

    // iOS displays with 3x ratio don't properly display hairlines
    // so set max ratio to 2
    return Math.min(ratio, 2);
  }

  didUpdateDimensions() {
    this.sendEventWithName("didUpdateDimensions", this.exportedDimensions());
  }
}

export default RCTDeviceInfo;
