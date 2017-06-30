/**
 * @providesModule RCTRootShadowView
 * @flow
 */

import type { Size } from "UIView";
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

  recalculateLayout() {
    const { width, height } = this.availableSize;
    this.yogaNode.calculateLayout(width, height);
    const layoutChanges = this.getLayoutChanges();
    return layoutChanges;
  }
}

export default RCTRootShadowView;
