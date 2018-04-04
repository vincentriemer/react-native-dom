/**
 * @providesModule RCTSafeAreaShadowView
 * @flow
 */

import * as YG from "yoga-dom";
import type RCTSafeAreaViewLocalData from "./RCTSafeAreaViewLocalData";

import _RCTShadowView from "../RCTShadowView";

const PADDING_PROPS = [
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingVertical",
  "paddingHorizontal"
];

module.exports = (async () => {
  const RCTShadowView = await _RCTShadowView;

  class RCTSafeAreaShadowView extends RCTShadowView {
    constructor() {
      super();

      // PADDING_PROPS.forEach((shadowPropName) => {
      //   Object.defineProperty(this, shadowPropName, {
      //     configurable: true,
      //     get: () => this.yogaNode.style[shadowPropName],
      //     set: (value) => true
      //   });
      // });
    }

    set localData(data: RCTSafeAreaViewLocalData) {
      const insets = data.insets;
      // super.paddingLeft = insets.left;
      // super.paddingRight = insets.right;
      // super.paddingTop = insets.top;
      // super.paddingBottom = insets.bottom;
    }

    // set padding(v: any) {}
    // set paddingLeft(v: any) {}
    // set paddingRight(v: any) {}
    // set paddingTop(v: any) {}
    // set paddingBottom(v: any) {}
    // set paddingHorizontal(v: any) {}
    // set paddingVertical(v: any) {}
  }

  return RCTSafeAreaShadowView;
})();
