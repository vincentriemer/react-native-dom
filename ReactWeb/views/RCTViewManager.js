/**
 * @providesModule RCTViewManager
 * @flow
 */
import RCTBridge, { RCT_EXPORT_MODULE, RCT_EXPORT_METHOD } from "RCTBridge";
import UIView from "UIView";
import RCTShadowView from "RCTShadowView";
import RCTView from "RCTView";

@RCT_EXPORT_MODULE
class RCTViewManager {
  static __moduleName: string;
  static __isViewManager = true;

  view(): RCTView {
    return new RCTView();
  }

  propConfig() {
    return [
      ["backgroundColor", "string"],
      ["opacity", "number"],
      ["overflow", "string"],
    ];
  }

  shadowPropConfig() {
    return [
      "backgroundColor",
      "top",
      "right",
      "bottom",
      "left",
      "width",
      "height",
      "minWidth",
      "maxWidth",
      "minHeight",
      "minWidth",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderWidth",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "marginVertical",
      "marginHorizontal",
      "margin",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "paddingVertical",
      "paddingHorizontal",
      "padding",
      "flex",
      "flexGrow",
      "flexShrink",
      "flexBasis",
      "flexDirection",
      "flexWrap",
      "justifyContent",
      "alignItems",
      "alignSelf",
      "alignContent",
      "position",
      "aspectRatio",
      "overflow",
      "display",
    ];
  }
}

export default RCTViewManager;
