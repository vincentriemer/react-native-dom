/** @flow */
import type RCTBridge from "RCTBridge";
import RCTView from "RCTView";

class RCTRawText extends RCTView {
  _text: string;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.pointerEvents = "box-none";

    this.updateHostStyle({
      position: "static",
      display: "inline",
      contain: "style",
      textRendering: "optimizeLegibility",
      fontSmoothing: "antialiased"
    });

    // $FlowFixMe
    this.style.WebkitFontSmoothing = "antialiased";
    // $FlowFixMe
    this.style.MozOsxFontSmoothing = "grayscale";

    this._text = "";
  }

  isVirtual() {
    return true;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    this.innerText = value;
  }
}

customElements.define("rct-raw-text", RCTRawText);

export default RCTRawText;
