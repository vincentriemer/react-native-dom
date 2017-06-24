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
}

export default RCTRootShadowView;
