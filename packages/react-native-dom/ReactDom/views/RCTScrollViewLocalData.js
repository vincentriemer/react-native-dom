/** @flow */

export default class RCTScrollViewLocalData {
  scrollOffsetX: number;
  scrollOffsetY: number;

  constructor(x: number, y: number) {
    this.scrollOffsetX = x;
    this.scrollOffsetY = y;
  }
}
