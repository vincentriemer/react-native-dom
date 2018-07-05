/** @flow */

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";

@RCT_EXPORT_MODULE("RCTVibration")
class RCTVibration {
  _intervalHandle: IntervalID;

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  vibrateByPattern(pattern: Array<number>, repeat: boolean = false) {
    if (!navigator.vibrate) {
      return;
    }
    // Keep flow happy re: possible mutations of navigator
    const vibrate = navigator.vibrate.bind(navigator);
    vibrate(pattern);
    clearInterval(this._intervalHandle);
    if (repeat) {
      const patternDuration = pattern.reduce((a, b) => a + b, 0);
      this._intervalHandle = setInterval(
        () => vibrate(pattern),
        patternDuration
      );
    }
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  vibrate(duration: number) {
    if (!navigator.vibrate) {
      return;
    }
    navigator.vibrate(duration);
    clearInterval(this._intervalHandle);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  cancel() {
    this.vibrate(0);
  }
}

export default RCTVibration;
