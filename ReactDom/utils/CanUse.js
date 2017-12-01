/**
 * @providesModule CanUse
 * @flow
 */

export default {
  matchMedia: typeof window.matchMedia === "function"
};
