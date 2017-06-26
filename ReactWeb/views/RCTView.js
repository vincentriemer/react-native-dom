/**
 * @providesModule RCTView
 * @flow
 */
import UIView, { FrameZero } from "UIView";

let idCounter = 0;

class RCTView extends UIView {
  constructor() {
    super(FrameZero);

    this.element.id = idCounter;
    idCounter++;
  }
}

export default RCTView;
