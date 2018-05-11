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
      this.textDirty = true;

      if (
        this.reactSuperview &&
        // $FlowFixMe
        typeof this.reactSuperview.markTextDirty === "function"
      ) {
        this.reactSuperview.markTextDirty();
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
