/**
 * @providesModule RCTRawTextManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";
import RCTRawText from "RCTRawText";

import _RCTViewManager from "RCTViewManager";
import _RCTShadowRawText from "RCTShadowRawText";

module.exports = (async () => {
  const [RCTViewManager, RCTShadowRawText] = await Promise.all([
    _RCTViewManager,
    _RCTShadowRawText
  ]);

  const {
    RCT_EXPORT_SHADOW_PROP,
    RCT_EXPORT_VIEW_PROP,
    RCT_EXPORT_MIRRORED_PROP
  } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTRawTextManager")
  class RCTRawTextManager extends RCTViewManager {
    view(): RCTRawText {
      return new RCTRawText(this.bridge);
    }

    shadowView(): RCTShadowRawText {
      return new RCTShadowRawText();
    }

    @RCT_EXPORT_MIRRORED_PROP("text", "string", false)
    setText(view: any, value: string) {
      view.text = value;
    }
  }

  return RCTRawTextManager;
})();
