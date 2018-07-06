/** @flow */

import * as Yoga from "yoga-dom";

import type RCTBridge from "RCTBridge";
import type { Size } from "InternalLib";
import type { LayoutChange } from "RCTShadowView";
import RCTShadowView from "RCTShadowView";

class RCTRootShadowView extends RCTShadowView {
  availableSize: Size;
  yogaConfig: Yoga.Config;
  // YGDirection

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.yogaConfig = new this.bridge.Yoga.Config();

    this.yogaNode.free();
    this.yogaNode = this.bridge.Yoga.Node.createWithConfig(this.yogaConfig);

    this.availableSize = { width: Infinity, height: Infinity };
  }

  updateAvailableSize(size: Size) {
    this.availableSize = size;
    this.width = size.width;
    this.height = size.height;
  }

  updatePointScaleFactor(ratio: number) {
    this.yogaConfig.setPointScaleFactor(ratio);
  }

  recalculateLayout(): Array<LayoutChange> {
    const { width, height } = this.availableSize;
    this.yogaNode.calculateLayout(width, height);

    const layoutChanges = this.getLayoutChanges({
      top: 0,
      left: 0
    });

    return layoutChanges;
  }
}

export default RCTRootShadowView;
