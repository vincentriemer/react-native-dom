/**
 * @providesModule RCTShadowScrollView
 * @flow
 */

import RCTShadowView from "RCTShadowView";
import RCTScrollViewLocalData from "RCTScrollViewLocalData";

class RCTShadowScrollView extends RCTShadowView {
  scrollOffset: {
    top: number,
    left: number
  } = { top: 0, left: 0 };

  set localData(data: RCTScrollViewLocalData) {
    this.scrollOffset = {
      top: data.scrollOffsetY,
      left: data.scrollOffsetX
    };
  }
}
