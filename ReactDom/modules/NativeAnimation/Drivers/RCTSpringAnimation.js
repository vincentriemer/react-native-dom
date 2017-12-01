/**
 * @providesModule RCTSpringAnimation
 * @flow
 */

import type { Config } from "RCTNativeAnimatedModule";
import type { RCTAnimationDriver } from "RCTAnimationDriver";
import type RCTValueAnimatedNode from "RCTValueAnimatedNode";

import { RCTSingleFrameInterval } from "RCTAnimationDriver";

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
  tension: number;
  friction: number;
  initialVelocity: number;
  animationStartTime: number;
  animationCurrentTime: number;
  callback: Function;

  lastPosition: number;
  lastVelocity: number;

  iterations: number;
  currentLoop: number;

  constructor(
    animationId: number,
    config: Config,
    valueNode: RCTValueAnimatedNode,
    callback: Function
  ) {
    const iterations = config.iterations != null ? config.iterations : 1;

    this.animationId = animationId;
    this.toValue = config.toValue;
    this.fromValue = valueNode.value;
    this.valueNode = valueNode;
    this.overshootClamping = config.overshootClamping;
    this.restDisplacementThreshold = config.restDisplacementThreshold;
    this.restSpeedThreshold = config.restSpeedThreshold;
    this.tension = config.tension;
    this.friction = config.friction;
    this.initialVelocity = config.initialVelocity;
    this.callback = callback;

    this.lastPosition = this.fromValue;
    this.lastVelocity = this.initialVelocity;

    this.animationHasFinished = iterations === 0;
    this.iterations = iterations;
    this.currentLoop = 1;
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

    if (this.animationStartTime == -1) {
      this.animationStartTime = this.animationCurrentTime = currentTime;
    }

    // We are using a fixed time step and a maximum number of iterations.
    // The following post provides a lot of thoughts into how to build this
    // loop: http://gafferongames.com/game-physics/fix-your-timestep/
    const TIMESTEP_MSEC = 1;
    // Velocity is based on seconds instead of milliseconds
    const step = TIMESTEP_MSEC / 1000;

    const numSteps = Math.floor(
      (currentTime - this.animationCurrentTime) / TIMESTEP_MSEC
    );
    this.animationCurrentTime = currentTime;
    if (numSteps === 0) {
      return;
    }

    let position = this.lastPosition;
    let velocity = this.lastVelocity;

    var tempPosition = this.lastPosition;
    var tempVelocity = this.lastVelocity;

    for (let i = 0; i < numSteps; ++i) {
      // This is using RK4. A good blog post to understand how it works:
      // http://gafferongames.com/game-physics/integration-basics/
      var aVelocity = velocity;
      var aAcceleration =
        this.tension * (this.toValue - tempPosition) -
        this.friction * tempVelocity;
      var tempPosition = position + aVelocity * step / 2;
      var tempVelocity = velocity + aAcceleration * step / 2;

      var bVelocity = tempVelocity;
      var bAcceleration =
        this.tension * (this.toValue - tempPosition) -
        this.friction * tempVelocity;
      tempPosition = position + bVelocity * step / 2;
      tempVelocity = velocity + bAcceleration * step / 2;

      var cVelocity = tempVelocity;
      var cAcceleration =
        this.tension * (this.toValue - tempPosition) -
        this.friction * tempVelocity;
      tempPosition = position + cVelocity * step / 2;
      tempVelocity = velocity + cAcceleration * step / 2;

      var dVelocity = tempVelocity;
      var dAcceleration =
        this.tension * (this.toValue - tempPosition) -
        this.friction * tempVelocity;
      tempPosition = position + cVelocity * step / 2;
      tempVelocity = velocity + cAcceleration * step / 2;

      var dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6;
      var dvdt =
        (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) /
        6;

      position += dxdt * step;
      velocity += dvdt * step;
    }

    this.lastPosition = position;
    this.lastVelocity = velocity;

    this.onUpdate(position);

    if (this.animationHasFinished) {
      return;
    }

    // Conditions for stopping the spring animation
    let isOvershooting = false;
    if (this.overshootClamping && this.tension !== 0) {
      if (this.fromValue < this.toValue) {
        isOvershooting = position > this.toValue;
      } else {
        isOvershooting = position < this.toValue;
      }
    }

    let isVelocity = Math.abs(velocity) <= this.restSpeedThreshold;
    let isDisplacement = true;
    if (this.tension !== 0) {
      isDisplacement =
        Math.abs(this.toValue - position) <= this.restDisplacementThreshold;
    }

    if (isOvershooting || (isVelocity && isDisplacement)) {
      if (this.tension !== 0) {
        // Ensure that we end up with a round value
        if (this.animationHasFinished) {
          return;
        }
        this.onUpdate(this.toValue);
      }

      if (this.iterations === -1 || this.currentLoop < this.iterations) {
        this.lastPosition = this.fromValue;
        this.lastVelocity = this.initialVelocity;
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
