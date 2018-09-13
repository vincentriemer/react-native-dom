/** @flow */

import type RCTBridge from "RCTBridge";
import RCTPropTypes from "RCTPropTypes";
import RCTText from "RCTText";
import RCTViewManager from "RCTViewManager";
import RCTShadowText from "RCTShadowText";
import { defaults } from "RCTSharedTextValues";

class RCTTextManager extends RCTViewManager {
  static moduleName = "RCTTextManager";

  view(): RCTText {
    return new RCTText(this.bridge);
  }

  shadowView(): RCTShadowText {
    return new RCTShadowText(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addMirroredProp("fontFamily", RCTPropTypes.string, this.setFontFamily)
      .addMirroredProp("fontSize", RCTPropTypes.number, this.setFontSize)
      .addBooleanProp("selectable", this.setSelectable)
      .addColorProp("color", this.setColor)
      .addMirroredProp("textAlign", RCTPropTypes.string, this.setTextAlign)
      .addNumberProp("padding", this.setPadding)
      .addNumberProp("paddingHorizontal", this.setPaddingHorizontal)
      .addNumberProp("paddingVertical", this.setPaddingVertical)
      .addMirroredProp("fontWeight", RCTPropTypes.number, this.setFontWeight)
      .addMirroredProp("fontStyle", RCTPropTypes.string, this.setFontStyle)
      .addMirroredProp(
        "letterSpacing",
        RCTPropTypes.number,
        this.setLetterSpacing
      )
      .addStringProp("textDecorationLine", this.setTextDecorationLine)
      .addStringProp("textDecorationStyle", this.setTextDecorationStyle)
      .addColorProp("textDecorationColor", this.setTextDecorationColor)
      .addMirroredProp("lineHeight", RCTPropTypes.number, this.setLineHeight)
      .addBooleanProp("isHighlighted", this.setIsHighlighted)
      .addMirroredProp(
        "numberOfLines",
        RCTPropTypes.number,
        this.setNumberOfLines
      );
  }

  setFontFamily(view: RCTText, value: ?string) {
    view.fontFamily = value;
  }

  setFontSize(view: any, value: ?number) {
    view.fontSize = value;
  }

  setSelectable(view: RCTText, value: ?boolean) {
    view.selectable = value ?? false;
  }

  setColor(view: RCTText, value: ?string) {
    view.color = value ?? "black";
  }

  setTextAlign(view: RCTText, value: ?string) {
    view.textAlign = value;
  }

  setPadding(view: RCTText, value: ?number) {
    view.style.padding = value != null ? `${value}px` : `0`;
  }

  setPaddingHorizontal(view: RCTText, value: ?number) {
    const stringValue = value != null ? `${value}px` : `0`;
    view.style.paddingLeft = stringValue;
    view.style.paddingRight = stringValue;
  }

  setPaddingVertical(view: RCTText, value: ?number) {
    const stringValue = value != null ? `${value}px` : `0`;
    view.style.paddingTop = stringValue;
    view.style.paddingBottom = stringValue;
  }

  setFontWeight(view: RCTText, value: ?string) {
    view.fontWeight = value;
  }

  setFontStyle(view: RCTText, value: ?string) {
    view.fontStyle = value;
  }

  setLetterSpacing(view: RCTText, value: ?number) {
    view.letterSpacing = value;
  }

  setTextDecorationLine(view: RCTText, value: ?string) {
    view.textDecorationLine = value;
  }

  setTextDecorationStyle(view: RCTText, value: ?string) {
    view.textDecorationStyle = value;
  }

  setTextDecorationColor(view: RCTText, value: ?string) {
    view.textDecorationColor = value;
  }

  setLineHeight(view: RCTText, value: ?number) {
    view.lineHeight = value;
  }

  setIsHighlighted(view: RCTText, value: ?boolean) {
    view.isHighlighted = value;
  }

  setNumberOfLines(view: RCTText, value: ?number) {
    view.numberOfLines = value;
  }
}

export default RCTTextManager;
