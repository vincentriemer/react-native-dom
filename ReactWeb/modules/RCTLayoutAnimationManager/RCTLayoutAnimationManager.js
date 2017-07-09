/**
 * @providesModule RCTLayoutAnimationManager
 * @flow
 */

import type { Frame } from "UIView";

const PropertiesEnum = {
  opacity: true,
  scaleXY: true
};

const TypesEnum = {
  spring: true,
  linear: true,
  easeInEaseOut: true,
  easeIn: true,
  easeOut: true,
  keyboard: true
};

type LayoutAnim = {
  duration?: number,
  delay?: number,
  springDamping?: number,
  initialVelocity?: number,
  type?: $Enum<typeof TypesEnum>,
  property?: $Enum<typeof PropertiesEnum>
};

export type LayoutAnimationConfig = {
  duration: number,
  create: LayoutAnim,
  update: LayoutAnim,
  delete: LayoutAnim
};

export type PendingLayoutAnimations = {
  config: LayoutAnimationConfig,
  callbackId: number,
  addedNodes: { [reactTag: number]: ?Frame },
  updatedNodes: { [reactTag: number]: ?Frame },
  removedNodes: number[]
};

class RCTLayoutAnimationManager {
  addLayoutAnimation(
    reactTag: number,
    type: $Enum<typeof TypesEnum>,
    config: LayoutAnimationConfig
  ) {}
}

export default RCTLayoutAnimationManager;
