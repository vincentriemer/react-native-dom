/** @flow */

import type RCTBridge from "RCTBridge";
import RCTModule from "RCTModule";
import NotificationCenter from "NotificationCenter";
import { defaultFontStack } from "RCTSharedTextValues";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

class RCTDevLoadingView extends RCTModule {
  static moduleName = "RCTDevLoadingView";

  hidden: boolean;
  color: string;
  backgroundColor: string;
  message: string;
  view: HTMLDivElement;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.initView();

    NotificationCenter.addListener(
      "RCTJavaScriptDidLoadNotification",
      this.$hide.bind(this)
    );

    if (this.bridge.loading) {
      this.showWithURL(new URL(bridge.bundleLocation));
    }
  }

  initView() {
    this.view = document.createElement("div");
    Object.assign(this.view.style, {
      width: "100%",
      height: "22px",
      fontFamily: defaultFontStack,
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      zIndex: "99999",
      top: "0",
      left: "0",
      transition: "transform 0.1s",
      transform: "translateY(-22px)",
      overflow: "hidden"
    });
    this.bridge.parent.appendChild(this.view);
  }

  updateView() {
    this.view.innerText = this.message;
    Object.assign(this.view.style, {
      color: this.color,
      backgroundColor: this.backgroundColor,
      transform: this.hidden ? "translateY(-22px)" : "translateY(0px)"
    });
  }

  $showMessage(
    message: string,
    color: string | number,
    backgroundColor: string | number
  ) {
    this.message = message;

    if (typeof color === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(color);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.color = stringValue;
    } else {
      this.color = color;
    }

    if (typeof backgroundColor === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(backgroundColor);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.backgroundColor = stringValue;
    } else {
      this.backgroundColor = backgroundColor;
    }

    this.hidden = false;
    this.updateView();
  }

  $hide() {
    this.hidden = true;
    this.updateView();
  }

  updateProgress({ done, total }: { done: number, total: number }) {
    const color = "white";
    const backgroundColor = "#005900";
    const message = `Loading ${((done / total) * 100).toFixed(
      0
    )}% (${done}/${total})`;
    this.$showMessage(message, color, backgroundColor);
  }

  showWithURL(url: URL) {
    const color = "white";
    const backgroundColor = "#005900";
    const message = `Loading from ${url.href}...`;
    this.$showMessage(message, color, backgroundColor);
  }
}

export default RCTDevLoadingView;
