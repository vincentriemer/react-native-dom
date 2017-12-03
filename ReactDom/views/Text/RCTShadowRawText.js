/**
 * @providesModule RCTShadowRawText
 * @flow
 */

import RCTShadowView from "RCTShadowView";

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

export default RCTShadowRawText;
