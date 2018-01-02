/**
 * @providesModule RCTTextInputManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";
import RCTTextInput from "RCTTextInput";

import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;

  const {
    RCT_EXPORT_VIEW_PROP,
    RCT_EXPORT_MIRRORED_PROP,
    RCT_EXPORT_DIRECT_VIEW_PROPS
  } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTTextInputManager")
  class RCTTextInputManager extends RCTViewManager {
    view(): RCTTextInput {
      return new RCTTextInput(this.bridge);
    }

    @RCT_EXPORT_DIRECT_VIEW_PROPS
    getDirectViewProps() {
      return [
        ["padding", "number"],
        ["paddingLeft", "number"],
        ["paddingRight", "number"],
        ["paddingTop", "number"],
        ["paddingBottom", "number"],
        ["paddingVertical", "number"],
        ["paddingHorizontal", "number"],
        ["fontSize", "number"]
      ];
    }
  }

  return RCTTextInputManager;
})();
