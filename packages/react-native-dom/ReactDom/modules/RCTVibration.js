/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

class RCTVibration extends RCTModule {
  static moduleName = "RCTVibration";

  _intervalHandle: IntervalID;

  $vibrateByPattern(pattern: Array<number>, repeat: boolean = false) {
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

  $vibrate(duration: number) {
    if (!navigator.vibrate) {
      return;
    }
    navigator.vibrate(duration);
    clearInterval(this._intervalHandle);
  }

  $cancel() {
    this.$vibrate(0);
  }
}

export default RCTVibration;
