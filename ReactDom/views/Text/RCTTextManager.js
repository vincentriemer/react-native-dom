/**
 * @providesModule RCTTextManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "../../bridge/RCTBridge";
import RCTText from "./RCTText";

import _RCTViewManager from "../RCTViewManager";
import _RCTShadowText from "./RCTShadowText";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const RCTShadowText = await _RCTShadowText;

  const {
    RCT_EXPORT_VIEW_PROP,
    RCT_EXPORT_MIRRORED_PROP,
    RCT_EXPORT_DIRECT_VIEW_PROPS
  } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTTextManager")
  class RCTTextManager extends RCTViewManager {
    view(): RCTText {
      return new RCTText(this.bridge);
    }

    shadowView(): RCTShadowText {
      return new RCTShadowText();
    }

    @RCT_EXPORT_MIRRORED_PROP("fontFamily", "string")
    setFontFamily(view: any, value: string) {
      view.fontFamily = value;
    }

    @RCT_EXPORT_MIRRORED_PROP("fontSize", "number")
    setFontSize(view: any, value: number) {
      view.fontSize = value;
    }

    @RCT_EXPORT_VIEW_PROP("selectable", "bool")
    setSelectable(view: RCTText, value: boolean) {
      view.selectable = value;
    }

    @RCT_EXPORT_VIEW_PROP("color", "number")
    setColor(view: RCTText, value: number) {
      view.color = value;
    }

    @RCT_EXPORT_MIRRORED_PROP("textAlign", "string")
    setTextAlign(view: RCTText, value: string) {
      view.textAlign = value;
    }

    @RCT_EXPORT_VIEW_PROP("padding", "number")
    setPadding(view: RCTText, value: number) {
      view.style.padding = `${value}px`;
    }

    @RCT_EXPORT_VIEW_PROP("paddingHorizontal", "number")
    setPaddingHorizontal(view: RCTText, value: number) {
      const stringValue = `${value}px`;
      view.style.paddingLeft = stringValue;
      view.style.paddingRight = stringValue;
    }

    @RCT_EXPORT_VIEW_PROP("paddingVertical", "number")
    setPaddingVertical(view: RCTText, value: number) {
      const stringValue = `${value}px`;
      view.style.paddingTop = stringValue;
      view.style.paddingBottom = stringValue;
    }

    @RCT_EXPORT_MIRRORED_PROP("fontWeight", "string")
    setFontWeight(view: RCTText, value: string) {
      view.fontWeight = value;
    }

    @RCT_EXPORT_MIRRORED_PROP("fontStyle", "string")
    setFontStyle(view: RCTText, value: string) {
      view.fontStyle = value;
    }

    @RCT_EXPORT_MIRRORED_PROP("letterSpacing", "number")
    setLetterSpacing(view: RCTText, value: number) {
      view.letterSpacing = value;
    }

    @RCT_EXPORT_VIEW_PROP("textDecorationLine", "string")
    setTextDecorationLine(view: RCTText, value: string) {
      view.textDecorationLine = value;
    }

    @RCT_EXPORT_VIEW_PROP("textDecorationStyle", "string")
    setTextDecorationStyle(view: RCTText, value: string) {
      view.textDecorationStyle = value;
    }

    @RCT_EXPORT_VIEW_PROP("textDecorationColor", "color")
    setTextDecorationColor(view: RCTText, value: number) {
      view.textDecorationColor = value;
    }

    @RCT_EXPORT_MIRRORED_PROP("lineHeight", "number")
    setLineHeight(view: RCTText, value: number) {
      view.lineHeight = value;
    }

    @RCT_EXPORT_VIEW_PROP("isHighlighted", "boolean")
    setIsHighlighted(view: RCTText, value: ?boolean) {
      view.isHighlighted = value;
    }
  }

  return RCTTextManager;
})();
