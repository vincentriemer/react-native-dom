// @flow

declare type AnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | string;

declare type AnimationFill = "none" | "backwards" | "forwards";

declare type KeyframeOptions = {
  delay?: number,
  direction?: number,
  duration?: number,
  easing?: AnimationEasing,
  endDelay?: number,
  fill?: AnimationFill,
  iterationStart?: number,
  iterations?: number
};

declare class KeyframeEffect {
  constructor(
    element: HTMLElement,
    keyframes: any[],
    config: KeyframeOptions
  ): KeyframeEffect;
}

declare class GroupEffect {
  constructor(kEffects: KeyframeEffect[]): GroupEffect;
}
