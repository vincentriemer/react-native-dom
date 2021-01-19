/** @flow */

import type RCTBridge from "RCTBridge";
import RCTTextInput from "RCTTextInput";
import RCTViewManager from "RCTViewManager";

class RCTTextInputManager extends RCTViewManager {
  static moduleName = "RCTTextInputManager";

  view(): RCTTextInput {
    return new RCTTextInput(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addNumberProp("padding", this.setPadding)
      .addNumberProp("paddingLeft", this.setPaddingLeft)
      .addNumberProp("paddingRight", this.setPaddingRight)
      .addNumberProp("paddingTop", this.setPaddingTop)
      .addNumberProp("paddingBottom", this.setPaddingBottom)
      .addNumberProp("paddingHorizontal", this.setPaddingHorizontal)
      .addNumberProp("paddingVertical", this.setPaddingVertical)
      .addNumberProp("fontSize", this.setFontSize)
      .addBooleanProp("blurOnSubmit", this.setBlurOnSubmit)
      .addBubblingEvent("onChange");
  }

  setBlurOnSubmit(view: RCTTextInput, value: ?boolean) {
    view.blurOnSubmit = value ?? true;
  }

  setPadding(view: RCTTextInput, value: ?number) {
    view.padding = value ?? 0;
  }

  setPaddingLeft(view: RCTTextInput, value: ?number) {
    view.paddingLeft = value ?? 0;
  }

  setPaddingRight(view: RCTTextInput, value: ?number) {
    view.paddingRight = value ?? 0;
  }

  setPaddingTop(view: RCTTextInput, value: ?number) {
    view.paddingTop = value ?? 0;
  }

  setPaddingBottom(view: RCTTextInput, value: ?number) {
    view.paddingBottom = value ?? 0;
  }

  setPaddingHorizontal(view: RCTTextInput, value: ?number) {
    view.paddingHorizontal = value ?? 0;
  }

  setPaddingVertical(view: RCTTextInput, value: ?number) {
    view.paddingVertical = value ?? 0;
  }

  setFontSize(view: RCTTextInput, value: ?number) {
    view.fontSize = value ?? 0;
  }
}

export default RCTTextInputManager;
