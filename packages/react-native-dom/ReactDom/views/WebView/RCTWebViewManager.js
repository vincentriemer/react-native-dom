/** @flow */

import type UIView from "UIView";
import type { WebViewSource } from "RCTWebView";
import type RCTBridge from "RCTBridge";
import RCTWebView from "RCTWebView";
import RCTViewManager from "RCTViewManager";

class RCTWebViewManager extends RCTViewManager {
  static moduleName = "RCTWebViewManager";

  view(): UIView {
    return new RCTWebView(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addDirectEvent("onLoadingStart")
      .addDirectEvent("onLoadingFinish")
      .addDirectEvent("onLoadingError")
      .addObjectProp("source", this.setSource)
      .addBooleanProp("scrollEnabled", this.setScrollEnabled);
  }

  setSource(view: RCTWebView, value: ?WebViewSource) {
    view.source = value ?? {};
  }

  setScrollEnabled(view: RCTWebView, value: ?boolean) {
    view.scrollEnabled = value ?? false;
  }

  $goBack(reactTag: number) {
    // NO-OP
  }

  $goForward(reactTag: number) {
    // NO-OP
  }

  $reload(reactTag: number) {
    this.bridge.uiManager.addUIBlock((_, viewRegistry) => {
      const view = viewRegistry.get(reactTag);
      if (view && view instanceof RCTWebView) {
        view.iframeElement.src += "";
      }
    });
  }

  $stopLoading(reactTag: number) {
    this.bridge.uiManager.addUIBlock((_, viewRegistry) => {
      const view = viewRegistry.get(reactTag);
      if (view && view instanceof RCTWebView) {
        view.source = {};
      }
    });
  }

  $injectJavaScript(reactTag: number, script: string) {
    // NO-OP
  }

  $postMessage(reactTag: number, message: string) {
    // NO-OP
  }
}

export default RCTWebViewManager;
