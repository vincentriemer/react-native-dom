/**
 * @providesModule RCTRawTextManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";
import RCTViewManager, {
  RCT_EXPORT_SHADOW_PROP,
  RCT_EXPORT_VIEW_PROP,
  RCT_EXPORT_MIRRORED_PROP
} from "RCTViewManager";
import RCTRawText from "RCTRawText";
import RCTShadowRawText from "RCTShadowRawText";

@RCT_EXPORT_MODULE("RCTRawTextManager")
class RCTRawTextManager extends RCTViewManager {
  view(): RCTRawText {
    return new RCTRawText(this.bridge);
  }

  shadowView(): RCTShadowRawText {
    return new RCTShadowRawText(this.bridge.YogaModule);
  }

  @RCT_EXPORT_MIRRORED_PROP("text", "string", false)
  setText(view: any, value: string) {
    view.text = value;
  }
}

export default RCTRawTextManager;
