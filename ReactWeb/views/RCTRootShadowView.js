/**
 * @providesModule RCTRootShadowView
 * @flow
 */

import type { Size } from "UIView";
import type { LayoutChange } from "RCTShadowView";
import RCTShadowView from "RCTShadowView";

class RCTRootShadowView extends RCTShadowView {
  availableSize: Size;
  // YGDirection

  constructor() {
    super();
    this.availableSize = { width: Infinity, height: Infinity };
  }

  updateAvailableSize(size: Size) {
    this.availableSize = size;
    this.makeDirtyRecursive();
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
