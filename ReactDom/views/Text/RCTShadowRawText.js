/**
 * @providesModule RCTShadowRawText
 * @flow
 */

import * as YG from "yoga-dom";
import _RCTShadowView from "RCTShadowView";

export default (async () => {
  const RCTShadowView = await _RCTShadowView;

  class RCTShadowRawText extends RCTShadowView {
    textDirty: boolean;
    _text: string;

    constructor() {
      super();

      this.textDirty = true;
      this._text = "";
    }

    markTextDirty() {
      let cur = (this.reactSuperview: any);
      while (cur) {
        cur.isDirty = true;
        cur.markTextDirty && cur.markTextDirty();
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
      console.log(this);
    }
  }

  return RCTShadowRawText;
})();
