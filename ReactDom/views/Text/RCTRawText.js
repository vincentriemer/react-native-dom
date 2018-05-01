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

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    this.innerText = value;
  }
}

export default RCTRawText;
