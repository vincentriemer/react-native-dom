/**
 * @providesModule RCTShadowRawText
 * @flow
 */

import * as YG from "yoga-dom";
import _RCTShadowText from "RCTShadowText";
import _RCTShadowView from "RCTShadowView";

export default (async () => {
  const [RCTShadowView, RCTShadowText] = await Promise.all([
    _RCTShadowView,
    _RCTShadowText
  ]);

  class RCTShadowRawText extends RCTShadowView {
    textDirty: boolean;
    _text: string;

    constructor() {
      super();

      this.textDirty = true;
      this._text = "";
    }

    markTextDirty() {
      let cur = this.reactSuperview;
      while (cur) {
        cur.isDirty = true;
        if (cur instanceof RCTShadowText) {
          cur.markTextDirty();
        }
        cur = cur.reactSuperview;
      }
    }

    get text(): string {
      return this._text;
    }

    set text(value: ?string) {
      this._text = value || "";
      this.textDirty = true;
      this.markTextDirty();
    }

    purge() {
      super.purge();
      this.markTextDirty();
    }
  }

  return RCTShadowRawText;
})();
