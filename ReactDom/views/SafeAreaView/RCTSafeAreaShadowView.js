/**
 * @providesModule RCTSafeAreaShadowView
 * @flow
 */

import RCTShadowView from "RCTShadowView";

import type RCTSafeAreaViewLocalData from "RCTSafeAreaViewLocalData";

const PADDING_PROPS = [
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingVertical",
  "paddingHorizontal"
];

class RCTSafeAreaShadowView extends RCTShadowView {
  constructor() {
    super();

    PADDING_PROPS.forEach((shadowPropName) => {
      Object.defineProperty(this, shadowPropName, {
        configurable: true,
        get: () => this.yogaNode.style[shadowPropName],
        set: (value) => true
      });
    });
  }

  set localData(data: RCTSafeAreaViewLocalData) {
    const insets = data.insets;
    super.paddingLeft = insets.left;
    super.paddingRight = insets.right;
    super.paddingTop = insets.top;
    super.paddingBottom = insets.bottom;
  }

  set padding(v: any) {}
  set paddingLeft(v: any) {}
  set paddingRight(v: any) {}
  set paddingTop(v: any) {}
  set paddingBottom(v: any) {}
  set paddingHorizontal(v: any) {}
  set paddingVertical(v: any) {}
}

export default RCTSafeAreaShadowView;
