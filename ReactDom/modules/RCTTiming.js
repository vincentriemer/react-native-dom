/**
 * @providesModule RCTTiming
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "../bridge/RCTBridge";

type Timer = {
  callbackId: number,
  duration: number,
  jsSchedulingTime: number,
  repeats: boolean
};

const IDLE_CALLBACK_THRESHOLD = 1; // Minimum idle execution time of 1ms

function now() {
  return window.performance ? performance.now() : Date.now();
}

@RCT_EXPORT_MODULE("RCTTiming")
class RCTTiming {
  bridge: RCTBridge;
  timers: { [callbackId: string]: Timer };
  sendIdleEvents: boolean;
  targetFrameDuration: number;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
    this.timers = {};
    this.sendIdleEvents = false;
    this.targetFrameDuration = 1000.0 / 60.0; // 60fps
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  createTimer(
    callbackId: number,
    duration: number,
    jsSchedulingTime: number,
    repeats: boolean
  ) {
    const currentTimeMillis = now();
    const currentDateNowTimeMillis = jsSchedulingTime + 1000 / 60;
    const adjustedDuration = Math.max(
      0.0,
      jsSchedulingTime - currentDateNowTimeMillis + duration
    );
    const initialTargetTime = currentTimeMillis + adjustedDuration;

    const timer = {
      callbackId,
      duration,
      jsSchedulingTime: initialTargetTime,
      repeats
    };

    if (adjustedDuration === 0) {
      if (timer.repeats) {
        timer.jsSchedulingTime += timer.duration;
        this.timers[String(callbackId)] = timer;
      }
      this.bridge.enqueueJSCall("JSTimers", "callTimers", [[callbackId]]);
    } else {
      this.timers[String(callbackId)] = timer;
    }
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  deleteTimer(callbackId: number) {
    delete this.timers[String(callbackId)];
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  setSendIdleEvents(sendIdle: boolean) {
    this.sendIdleEvents = sendIdle;
  }

  async frame() {
    const toRemove = [];
    const timers = [];
    const time = now();

    for (const timer in this.timers) {
      const t = this.timers[timer];
      if (t.jsSchedulingTime <= time) {
        timers.push(this.timers[timer].callbackId);
        if (t.repeats) {
          t.jsSchedulingTime += t.duration;
        } else {
          toRemove.push(timer);
        }
      }
    }

    // timer information is distributed in a single message with mulitiple params
    // which minimizes the bridge traffic when many timers are used
    if (timers.length) {
      this.bridge.enqueueJSCall("JSTimers", "callTimers", [timers]);
    }

    for (const timer of toRemove) {
      delete this.timers[timer];
    }
  }

  async idle(frameStart: number) {
    if (!this.sendIdleEvents) {
      return;
    }
    const frameNow = now();
    const frameElapsed = frameNow - frameStart;
    if (this.targetFrameDuration - frameElapsed >= IDLE_CALLBACK_THRESHOLD) {
      this.bridge.enqueueJSCall("JSTimers", "callIdleCallbacks", [
        Date.now() - frameElapsed
      ]);
    }
  }

  shouldContinue(): boolean {
    return Object.keys(this.timers).length !== 0;
  }
}

export default RCTTiming;
