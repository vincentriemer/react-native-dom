/**
 * @providesModule RCTKeyframeGenerator
 * @flow
 */

import BezierEasing from "bezier-easing";
import Rebound from "rebound";
import memoize from "fast-memoize";

import invariant from "Invariant";

import type { LayoutAnim } from "RCTLayoutAnimationManager";

const timestepCoefficient = 1;

const staticEasingFunctions = {
  linear: x => x,
  easeIn: BezierEasing(0.42, 0, 1, 1),
  easeOut: BezierEasing(0, 0, 0.58, 1),
  easeInEaseOut: BezierEasing(0.42, 0, 0.58, 1)
};

export type KeyframeResult = {
  keyframes: number[],
  duration: number
};

const springTimestep = 16.667 * timestepCoefficient;

function generateStaticKeyframes(
  ease: (x: number) => number,
  duration: number
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

  return { keyframes, duration };
}

const looper = new Rebound.SimulationLooper(springTimestep);
const springSystem = new Rebound.SpringSystem(looper);

function generateSpringKeyframes(
  springDamping: number,
  initialVelocity: number = 0
): KeyframeResult {
  const mass = 1; /* Oragami Default */
  const tension = 40; /* Oragami Default */
  const friction = springDamping * (2 * Math.sqrt(mass * tension));

  const springConfig = Rebound.SpringConfig.fromOrigamiTensionAndFriction(
    tension,
    friction
  );
  const spring = springSystem.createSpringWithConfig(springConfig);

  const result = [];
  function readStep(spring) {
    result.push(spring.getCurrentValue());
  }

  spring.addListener({ onSpringUpdate: readStep });
  spring._endValue = 1.0;
  spring._currentState.velocity = initialVelocity;
  springSystem.activateSpring(spring.getId());
  spring.removeAllListeners();

  const springDuration = result.length * springTimestep;

  return { keyframes: result, duration: springDuration };
}

const generateKeyframes: (
  config: LayoutAnim,
  duration: number
) => KeyframeResult = memoize((config: LayoutAnim, duration: number) => {
  const { type, springDamping, initialVelocity } = config;

  if (type && type !== "spring") {
    const easingFunction = staticEasingFunctions[type];
    const resolvedDuration = config.duration ? config.duration : duration;

    return generateStaticKeyframes(easingFunction, resolvedDuration);
  }

  if (type && type === "spring" && springDamping) {
    return generateSpringKeyframes(springDamping, initialVelocity);
  }

  invariant(false, "Invalid layoutAnimation configuration provided");
});

export default generateKeyframes;
