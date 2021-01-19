/** @flow */

import * as YG from "yoga-dom";

import type RCTBridge from "RCTBridge";
import RCTScrollViewLocalData from "RCTScrollViewLocalData";
import RCTShadowView from "RCTShadowView";

class RCTShadowScrollView extends RCTShadowView {
  scrollOffset: {
    top: number,
    left: number
  };

  constructor(bridge: RCTBridge) {
    super(bridge);
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

export default RCTShadowView;
