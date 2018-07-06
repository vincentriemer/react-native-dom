/** @flow */

import type { Frame } from "InternalLib";
import RCTView from "RCTView";
import type RCTBridge from "RCTBridge";
import prefixInlineStyles from "prefixInlineStyles";

export type WebViewSource = {
  uri?: string,
  html?: string
};

class RCTWebView extends RCTView {
  iframeElement: HTMLIFrameElement;

  loadStart: ?Function;
  loadFinish: ?Function;
  loadError: ?Function;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.iframeElement = this.initializeIframe();
  }

  initializeIframe() {
    const element = document.createElement("iframe");
    Object.assign(
      element.style,
      prefixInlineStyles({
        position: "absolute",
        top: "0",
        left: "0",
        border: "none"
      })
    );
    this.childContainer.appendChild(element);

    return element;
  }

  handleLoad = () => {
    this.loadFinish && this.loadFinish({});
  };

  handleError = () => {
    this.loadError && this.loadError({});
  };

  get frame(): Frame {
    return super.frame;
  }

  set frame(value: Frame) {
    super.frame = value;

    this.iframeElement.width = `${value.width}px`;
    this.iframeElement.height = `${value.height}px`;
  }

  set source(source: WebViewSource) {
    this.iframeElement.removeAttribute("srcdoc");
    this.iframeElement.removeAttribute("src");

    if (source.uri != null) {
      this.iframeElement.setAttribute("src", source.uri);
    } else if (source.html) {
      this.iframeElement.setAttribute("srcdoc", source.html);
    }

    this.loadStart && this.loadStart();
  }

  set scrollEnabled(value: boolean) {
    if (value) {
      this.iframeElement.scrolling = "auto";
      this.iframeElement.style.overflow = "visible";
    } else {
      this.iframeElement.scrolling = "no";
      this.iframeElement.style.overflow = "hidden";
    }
  }
}

customElements.define("rct-web-view", RCTWebView);

export default RCTWebView;
