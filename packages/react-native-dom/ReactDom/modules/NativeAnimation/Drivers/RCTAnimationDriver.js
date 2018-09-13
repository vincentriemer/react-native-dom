/** @flow */

import type RCTValueAnimatedNode from "RCTValueAnimatedNode";
import type RCTNativeAnimatedNodesManager from "RCTNativeAnimatedNodesManager";
import type { Config } from "RCTNativeAnimatedModule";

export interface RCTAnimationDriver {
  animationId: number;
  valueNode: RCTValueAnimatedNode;
  animationHasBegun: boolean;
  animationHasFinished: boolean;

  constructor(
    animationId: number,
    config: Config,
    valueNode: RCTValueAnimatedNode,
    callback: ?Function
  ): RCTAnimationDriver;

  startAnimation(): void;
  stepAnimationWithTime(currentTime: number): void;
  stopAnimation(): void;
}

export const RCTSingleFrameInterval = 16.667;
