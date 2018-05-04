/**
 * @providesModule RCTShadowScrollView
 * @flow
 */

import * as YG from "yoga-dom";
import RCTScrollViewLocalData from "RCTScrollViewLocalData";

import _RCTShadowView from "RCTShadowView";

module.exports = (async () => {
  const RCTShadowView = await _RCTShadowView;

  class RCTShadowScrollView extends RCTShadowView {
    scrollOffset: {
      top: number,
      left: number
    };

    constructor() {
      super();
      this.scrollOffset = {
        top: 0,
        left: 0
      };
    }

    set localData(data: RCTScrollViewLocalData) {
      this.scrollOffset = {
        top: data.scrollOffsetY,
        left: data.scrollOffsetX
      };
    }
  }

  return RCTShadowScrollView;
})();
