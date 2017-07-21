/**
 * @providesModule RCTRawText
 * @flow
 */
import type RCTBridge from "RCTBridge";
import RCTView from "RCTView";
import CustomElement from "CustomElement";

@CustomElement("rct-raw-text")
class RCTRawText extends RCTView {
  constructor(bridge: RCTBridge) {
    super(bridge);

    Object.assign(this.style, {
      position: "static",
      display: "inline",
      contain: "content"
    });

    this.hasBeenFramed = true;
    this.opacity = 1;
  }

  get text(): string {
    return this.innerHTML;
  }

  set text(value: string) {
    this.innerHTML = value;
  }
}

export default RCTRawText;
