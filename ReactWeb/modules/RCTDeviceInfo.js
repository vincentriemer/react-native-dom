/**
 * @providesModule RCTDeviceInfo
 * @flow
 */
import RCTBridge, { RCT_EXPORT_MODULE, RCT_EXPORT_METHOD } from "RCTBridge";
import RCTEventEmitter from "RCTNativeEventEmitter";

// Optimized Resize Event
// https://developer.mozilla.org/en-US/docs/Web/Events/resize
(function() {
  const throttle = function(type, name) {
    var running = false;
    var func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        window.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    window.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle("resize", "optimizedResize");
})();

@RCT_EXPORT_MODULE
class RCTDeviceInfo extends RCTEventEmitter {
  constructor(bridge: RCTBridge) {
    super(bridge);

    window.addEventListener(
      "optimizedResize",
      this.didUpdateDimensions.bind(this),
      false
    );

    this.listenerCount = 1;
  }

  constantsToExport() {
    return {
      Dimensions: this.exportedDimensions(),
    };
  }

  supportedEvents() {
    return ["didUpdateDimensions"];
  }

  exportedDimensions() {
    const dims = {
      width: window.innerWidth,
      height: window.innerHeight,
      scale: this.getDevicePixelRatio(),
      fontScale: 1,
    };

    return {
      window: dims,
      screen: dims,
    };
  }

  getDevicePixelRatio() {
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
    return ratio;
  }

  didUpdateDimensions() {
    this.sendEventWithName("didUpdateDimensions", this.exportedDimensions());
  }
}

export default RCTDeviceInfo;
