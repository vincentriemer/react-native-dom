/**
 * @providesModule RCTView
 * @flow
 */
import UIView, { FrameZero } from "UIView";
import CustomElement from "CustomElement";

@CustomElement("rct-view")
class RCTView extends UIView {
  constructor() {
    super(FrameZero);
  }
}

export default RCTView;
