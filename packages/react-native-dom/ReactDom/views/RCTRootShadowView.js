/**
 * @providesModule RCTRootShadowView
 * @flow
 */

import _Yoga from "yoga-dom";

import type { Size } from "InternalLib";
import type { LayoutChange } from "RCTShadowView";
import _RCTShadowView from "RCTShadowView";

export default (async () => {
  const RCTShadowView = await _RCTShadowView;
  const Yoga = await _Yoga;

  class RCTRootShadowView extends RCTShadowView {
    availableSize: Size;
    yogaConfig: Yoga.Config;
    // YGDirection

    constructor() {
      super();

      this.yogaConfig = new Yoga.Config();

      this.yogaNode.free();
      this.yogaNode = Yoga.Node.createWithConfig(this.yogaConfig);

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

  return RCTRootShadowView;
})();
