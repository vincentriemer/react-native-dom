/**
 * @providesModule RCTRawText
 * @flow
 */
import type RCTBridge from "RCTBridge";
import RCTView from "RCTView";
import CustomElement from "CustomElement";

@CustomElement("rct-raw-text")
class RCTRawText extends RCTView {
  _text: string;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.updateHostStyle({
      position: "static",
      display: "inline",
      contain: "style"
    });

    this._text = "";
    this.hasBeenFramed = true;
    this.opacity = 1;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    this.innerText = value;
  }
}

export default RCTRawText;
