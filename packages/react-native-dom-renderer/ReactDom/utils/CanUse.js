/** @flow */

export default {
  matchMedia: typeof window.matchMedia === "function",
  performanceMeasure:
    !!window.performance && typeof window.performance.measure === "function"
};
