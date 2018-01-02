/**
 * @providesModule RCTShadowScrollView
 * @flow
 */

import * as YG from "yoga-dom";
import RCTShadowView from "RCTShadowView";
import RCTScrollViewLocalData from "RCTScrollViewLocalData";

class RCTShadowScrollView extends RCTShadowView {
  scrollOffset: {
    top: number,
    left: number
  };

  constructor(YogaModule: YG.Module) {
    super(YogaModule);
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

export default RCTShadowScrollView;
