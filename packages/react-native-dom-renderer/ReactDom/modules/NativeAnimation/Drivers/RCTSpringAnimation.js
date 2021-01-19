/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import type { RCTAnimationDriver } from "RCTAnimationDriver";
import type RCTValueAnimatedNode from "RCTValueAnimatedNode";
import { RCTSingleFrameInterval } from "RCTAnimationDriver";

const MAX_DELTA_TIME: number = 0.064;

class RCTSpringAnimation implements RCTAnimationDriver {
  animationId: number;
  valueNode: RCTValueAnimatedNode;
  animationHasBegun: boolean;
  animationHasFinished: boolean;

  toValue: number;
  fromValue: number;
  overshootClamping: boolean;
  restDisplacementThreshold: number;
  restSpeedThreshold: number;
  stiffness: number;
  damping: number;
  mass: number;
  initialVelocity: number;
  animationStartTime: number;
  animationCurrentTime: number;
  callback: ?Function;

  lastPosition: number;
  lastVelocity: number;

  iterations: number;
  currentLoop: number;

  _t: number;

  constructor(
    animationId: number,
    config: Config,
    valueNode: RCTValueAnimatedNode,
    callback: ?Function
  ) {
    const iterations = config.iterations != null ? config.iterations : 1;

    this.animationId = animationId;
    this.toValue = config.toValue;
    this.fromValue = valueNode.value;
    this.lastPosition = 0;
    this.valueNode = valueNode;
    this.overshootClamping = config.overshootClamping;
    this.restDisplacementThreshold = config.restDisplacementThreshold;
    this.restSpeedThreshold = config.restSpeedThreshold;
    this.stiffness = config.stiffness;
    this.damping = config.damping;
    this.mass = config.mass;
    this.initialVelocity = config.initialVelocity;
    this.callback = callback;

    this.lastPosition = this.fromValue;
    this.lastVelocity = this.initialVelocity;

    this.animationHasFinished = iterations === 0;
    this.iterations = iterations;
    this.currentLoop = 1;
    return this;
  }

  startAnimation() {
    this.animationStartTime = this.animationCurrentTime = -1;
    this.animationHasBegun = true;
  }

  stopAnimation() {
    if (this.callback) {
      this.callback({ finished: this.animationHasFinished });
    }
  }

  stepAnimationWithTime(currentTime: number) {
    if (!this.animationHasBegun || this.animationHasFinished) {
      return;
    }

    let deltaTime;
    if (this.animationStartTime === -1) {
      this._t = 0.0;
      this.animationStartTime = currentTime;
      deltaTime = 0.0;
    } else {
      // need to adjust the delta time to be in seconds
      const curDeltaTime = (currentTime - this.animationCurrentTime) / 1000;
      // Handle frame drops, and only advance dt by a max of MAX_DELTA_TIME
      deltaTime = Math.min(MAX_DELTA_TIME, curDeltaTime);
      this._t += deltaTime;
    }

    // store the timestamp
    this.animationCurrentTime = currentTime;

    const c = this.damping;
    const m = this.mass;
    const k = this.stiffness;
    const v0 = -this.initialVelocity;

    const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
    const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta); // exponential decay
    const x0 = this.toValue - this.fromValue; // calculate the oscillation from x0 = 1 to x = 0

    let position;
    let velocity;

    if (zeta < 1) {
      // Under damped
      const envelope = Math.exp(-zeta * omega0 * this._t);
      position =
        this.toValue -
        envelope *
          (((v0 + zeta * omega0 * x0) / omega1) * Math.sin(omega1 * this._t) +
            x0 * Math.cos(omega1 * this._t));
      // This looks crazy -- it's actually just the derivative of the
      // oscillation function
      velocity =
        zeta *
          omega0 *
          envelope *
          ((Math.sin(omega1 * this._t) * (v0 + zeta * omega0 * x0)) / omega1 +
            x0 * Math.cos(omega1 * this._t)) -
        envelope *
          (Math.cos(omega1 * this._t) * (v0 + zeta * omega0 * x0) -
            omega1 * x0 * Math.sin(omega1 * this._t));
    } else {
      // Critically damped
      const envelope = Math.exp(-omega0 * this._t);
      position = this.toValue - envelope * (x0 + (v0 + omega0 * x0) * this._t);
      velocity =
        envelope *
        (v0 * (this._t * omega0 - 1) + this._t * x0 * (omega0 * omega0));
    }

    this.lastPosition = position;
    this.lastVelocity = velocity;

    this.onUpdate(position);

    // Conditions for stopping the spring animation
    let isOvershooting = false;
    if (this.overshootClamping && this.stiffness !== 0) {
      if (this.fromValue < this.toValue) {
        isOvershooting = position > this.toValue;
      } else {
        isOvershooting = position < this.toValue;
      }
    }

    let isVelocity = Math.abs(velocity) <= this.restSpeedThreshold;
    let isDisplacement = true;
    if (this.stiffness !== 0) {
      isDisplacement =
        Math.abs(this.toValue - position) <= this.restDisplacementThreshold;
    }

    if (isOvershooting || (isVelocity && isDisplacement)) {
      if (this.stiffness !== 0) {
        // Ensure that we end up with a round value
        if (this.animationHasFinished) {
          return;
        }
        this.onUpdate(this.toValue);
      }

      if (this.iterations === -1 || this.currentLoop < this.iterations) {
        this.lastPosition = this.fromValue;
        this.lastVelocity = this.initialVelocity;
        this.animationStartTime = -1;
        this.currentLoop++;
        this.onUpdate(this.fromValue);
      } else {
        this.animationHasFinished = true;
      }
    }
  }

  onUpdate(outputValue: number) {
    this.valueNode.value = outputValue;
    this.valueNode.setNeedsUpdate();
  }
}

export default RCTSpringAnimation;
