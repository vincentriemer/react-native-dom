/** @flow */

import ResizeObserver from "resize-observer-polyfill";

import type RCTBridge from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

class RCTDeviceInfo extends RCTEventEmitter {
  static moduleName = "RCTDeviceInfo";

  didUpdateDimensions = () => {
    this.sendEventWithName("didUpdateDimensions", this.exportedDimensions());
  };

  resizeObserver = new ResizeObserver(this.didUpdateDimensions);

  startObserving() {
    this.resizeObserver.observe(this.bridge.parent);
    window
      .matchMedia("screen and (min-resolution: 2dppx)")
      .addListener(this.didUpdateDimensions);
  }

  stopObserving() {
    this.resizeObserver.unobserve(this.bridge.parent);
    window
      .matchMedia("screen and (min-resolution: 2dppx)")
      .removeEventListener(this.didUpdateDimensions);
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
      width: Math.ceil(this.bridge.parent.offsetWidth),
      height: Math.ceil(this.bridge.parent.offsetHeight),
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
}

export default RCTDeviceInfo;
