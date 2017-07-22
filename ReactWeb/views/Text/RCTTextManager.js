/**
 * @providesModule RCTTextManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";
import RCTViewManager, {
  RCT_EXPORT_VIEW_PROP,
  RCT_EXPORT_MIRRORED_PROP
} from "RCTViewManager";
import RCTText from "RCTText";
import RCTShadowText from "RCTShadowText";

@RCT_EXPORT_MODULE
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

  @RCT_EXPORT_VIEW_PROP("accessible", "bool")
  setAccessible(view: RCTText, value: boolean) {}

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
}

export default RCTTextManager;
