/**
 * @providesModule RCTView
 * @flow
 */
import UIView from "../base/UIView";
import type RCTBridge from "../bridge/RCTBridge";
import RCTEventEmitter from "../modules/RCTEventEmitter";
import CustomElement from "../utils/CustomElement";

@CustomElement("rct-view")
class RCTView extends UIView {
  bridge: RCTBridge;
  onLayout: ?Function;

  constructor(bridge: RCTBridge) {
    super();
    this.bridge = bridge;
  }

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    super.frame = value;

    if (this.onLayout) {
      this.onLayout({
        layout: {
          x: value.left,
          y: value.top,
          width: value.width,
          height: value.height
        }
      });
    }
  }

  // TODO: Renable when I have a plan for focus styling
  // set accessible(value: boolean) {
  //   this.tabIndex = 0;
  // }
}

export default RCTView;
