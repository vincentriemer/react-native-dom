/** @flow */

import BezierEasing from "bezier-easing";
import memoize from "fast-memoize";
import invariant from "invariant";

import type { LayoutAnim } from "RCTLayoutAnimationManager";

const timestepCoefficient = 1;

const staticEasingFunctions = {
  linear: (x) => x,
  easeIn: BezierEasing(0.42, 0, 1, 1),
  easeOut: BezierEasing(0, 0, 0.58, 1),
  easeInEaseOut: BezierEasing(0.42, 0, 0.58, 1)
};

export type KeyframeResult = {
  keyframes: number[],
  duration: number,
  delay: number
};

const springFactor = 0.5;
const springTimestep = 16.667 * timestepCoefficient;

function generateStaticKeyframes(
  ease: (x: number) => number,
  duration: number,
  delay: number
): KeyframeResult {
  const numSteps = duration / springTimestep;
  const timestep = 1.0 / numSteps;

  const keyframes = [];

  let currentX = 0;
  for (let i = 0; i < numSteps; i++) {
    keyframes.push(ease(currentX));
    currentX += timestep;
  }

  keyframes.push(1);

  return { keyframes, duration, delay };
}

// Spring Curve Approximation & Generation adapted from https://github.com/koenbok/Framer

const epsilon = 0.001;
const maxDamping = 1;
const minDamping = Number.MIN_VALUE;

type ApproxFunc = (number) => number;

const approximateRoot = (
  func: ApproxFunc,
  derivative: ApproxFunc,
  initialGuess: number,
  times = 24
) => {
  let result = initialGuess;
  for (let i = 0; i < times; i++) {
    result = result = func(result) / derivative(result);
  }
  return result;
};

const angularFrequency = (undampedFrequency, dampingRatio) =>
  undampedFrequency * Math.sqrt(1 - Math.pow(dampingRatio, 2));

function computeDerivedSpringCurveOptions(
  dampingRatio: number,
  duration: number,
  velocity: number = 0,
  mass: number = 1
) {
  dampingRatio = Math.max(Math.min(dampingRatio, maxDamping), minDamping);

  let envelope: (number) => number;
  let derivative: (number) => number;
  if (dampingRatio < 1) {
    envelope = (undampedFrequency: number) => {
      const exponentialDecay = undampedFrequency * dampingRatio;
      const currentDisplacement = exponentialDecay * duration;
      const a = exponentialDecay - velocity;
      const b = angularFrequency(undampedFrequency, dampingRatio);
      const c = Math.exp(-currentDisplacement);
      return epsilon - (a / b) * c;
    };
    derivative = (undampedFrequency: number) => {
      const exponentialDecay = undampedFrequency * dampingRatio;
      const currentDisplacement = exponentialDecay * duration;
      const d = currentDisplacement * velocity + velocity;
      const e =
        Math.pow(dampingRatio, 2) * Math.pow(undampedFrequency, 2) * duration;
      const f = Math.exp(-currentDisplacement);
      const g = angularFrequency(Math.pow(undampedFrequency, 2), dampingRatio);
      const factor = -envelope(undampedFrequency) + epsilon > 0 ? -1 : 1;
      return (factor * ((d - e) * f)) / g;
    };
  } else {
    envelope = (undampedFrequency: number) => {
      const a = Math.exp(-undampedFrequency * duration);
      const b = (undampedFrequency - velocity) * duration + 1;
      return -epsilon + a * b;
    };
    derivative = (undampedFrequency: number) => {
      const a = Math.exp(-undampedFrequency * duration);
      const b = (velocity - undampedFrequency) * Math.pow(duration, 2);
      return a * b;
    };
  }

  const result = {
    tension: 100,
    friction: 10,
    velocity
  };

  const initialGuess = 5 / duration;
  const undampedFrequency = approximateRoot(envelope, derivative, initialGuess);
  if (!isNaN(undampedFrequency)) {
    result.tension = Math.pow(undampedFrequency, 2) * mass;
    result.friction = dampingRatio * 2 * Math.sqrt(mass * result.tension);
  }

  return result;
}

class Integrator {
  accelerationForState: ({ x: number, v: number }) => number;

  constructor(accelerationForState: *) {
    this.accelerationForState = accelerationForState;
  }

  integrateState(state: { x: number, v: number }, dt: number) {
    const a = this.evaluateState(state);
    const b = this.evaluateStateWithDerivative(state, dt * 0.5, a);
    const c = this.evaluateStateWithDerivative(state, dt * 0.5, b);
    const d = this.evaluateStateWithDerivative(state, dt, c);

    const dxdt = (1.0 / 6.0) * (a.dx + 2.0 * (b.dx + c.dx) + d.dx);
    const dvdt = (1.0 / 6.0) * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);

    state.x = state.x + dxdt * dt;
    state.v = state.v + dvdt * dt;

    return state;
  }

  evaluateState(initialState: { x: number, v: number }) {
    return {
      dx: initialState.v,
      dv: this.accelerationForState(initialState)
    };
  }

  evaluateStateWithDerivative(initialState, dt, derivative) {
    const state = {};
    state.x = initialState.x + derivative.dx * dt;
    state.v = initialState.v + derivative.dv * dt;

    const output = {};
    output.dx = state.v;
    output.dv = this.accelerationForState(state);

    return output;
  }
}

function createSpringInterpolator(
  tension: number,
  friction: number,
  velocity: number,
  tolerance: number = 1 / 1000
) {
  let stopSpring = false;
  let time = 0;
  let value = 0;
  const integrator = new Integrator(
    (state: *) => -tension * state.x - friction * state.v
  );

  const finished = () => stopSpring;

  return {
    finished,
    next: (delta: number) => {
      if (finished()) {
        return 1;
      }

      time += delta;

      const stateBefore = {
        x: value - 1,
        v: velocity
      };

      const stateAfter = integrator.integrateState(stateBefore, delta);
      value = 1 + stateAfter.x;
      const finalVelocity = stateAfter.v;
      const netFloat = stateAfter.x;
      const net1DVelocity = stateAfter.v;

      // See if we reached the end state
      const netValueIsLow = Math.abs(netFloat) < tolerance;
      const netVelocityIsLow = Math.abs(net1DVelocity) < tolerance;

      stopSpring = netValueIsLow && netValueIsLow;
      velocity = finalVelocity;

      return value;
    }
  };
}

function generateSpringKeyframes(
  springDamping: number = springFactor,
  initialVelocity: number = 0,
  duration: number,
  delay: number
): KeyframeResult {
  const numSteps = duration / springTimestep;

  const { friction, tension, velocity } = computeDerivedSpringCurveOptions(
    springDamping,
    duration / 6000,
    initialVelocity
  );

  const interpolator = createSpringInterpolator(tension, friction, velocity);

  const keyframes = [];
  while (!interpolator.finished()) {
    keyframes.push(interpolator.next(1 / 60));
  }

  keyframes.push(1);

  return { keyframes, duration: keyframes.length * springTimestep, delay };
}

const generateKeyframes: (
  config: LayoutAnim,
  duration: number
) => ?KeyframeResult = memoize((config: LayoutAnim = {}, duration: number) => {
  const {
    type = "easeInEaseOut",
    springDamping,
    initialVelocity,
    delay
  } = config;

  const resolvedDelay = delay != null ? delay : 0;

  const resolvedDuration = config.duration != null ? config.duration : duration;

  if (resolvedDuration === 0) {
    return null;
  }

  if (type && type !== "spring") {
    const easingFunction = staticEasingFunctions[type];

    return generateStaticKeyframes(
      easingFunction,
      resolvedDuration,
      resolvedDelay
    );
  }

  if (type && type === "spring" && springDamping) {
    return generateSpringKeyframes(
      springDamping,
      initialVelocity,
      resolvedDuration,
      resolvedDelay
    );
  }

  invariant(false, "Invalid layoutAnimation configuration provided");
});

export default generateKeyframes;
