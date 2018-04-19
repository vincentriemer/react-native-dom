/**
 * @providesModule RCTWebViewManager
 * @flow
 */

import type UIView from "UIView";
import type { WebViewSource } from "RCTWebView";

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";
import RCTWebView from "RCTWebView";

import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const { RCT_EXPORT_VIEW_PROP } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTWebViewManager")
  class RCTWebViewManager extends RCTViewManager {
    view(): UIView {
      return new RCTWebView(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("onLoadingStart", "RCTDirectEventBlock")
    bindLoadingStart(view: RCTWebView, value: Function) {
      view.loadStart = value;
    }

    @RCT_EXPORT_VIEW_PROP("onLoadingFinish", "RCTDirectEventBlock")
    bindLoadingFinish(view: RCTWebView, value: Function) {
      view.loadFinish = value;
    }

    @RCT_EXPORT_VIEW_PROP("onLoadingError", "RCTDirectEventBlock")
    bindLoadingError(view: RCTWebView, value: Function) {
      view.loadError = value;
    }

    @RCT_EXPORT_VIEW_PROP("source", "object")
    setSource(view: RCTWebView, value: WebViewSource = {}) {
      view.source = value;
    }

    @RCT_EXPORT_VIEW_PROP("scrollEnabled", "bool")
    setScrollEnabled(view: RCTWebView, value: boolean = true) {
      view.scrollEnabled = value;
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    goBack(reactTag: number) {
      // NO-OP
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    goForward(reactTag: number) {
      // NO-OP
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    reload(reactTag: number) {
      this.bridge.uiManager.addUIBlock((_, viewRegistry) => {
        const view: ?RCTWebView = viewRegistry.get(reactTag);
        if (view && view instanceof RCTWebView) {
          view.iframeElement.src += "";
        }
      });
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    stopLoading(reactTag: number) {
      this.bridge.uiManager.addUIBlock((_, viewRegistry) => {
        const view: ?RCTWebView = viewRegistry.get(reactTag);
        if (view && view instanceof RCTWebView) {
          view.source = {};
        }
      });
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    injectJavaScript(reactTag: number, script: string) {
      // NO-OP
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    postMessage(reactTag: number, message: string) {
      // NO-OP
    }
  }

  return RCTWebViewManager;
})();
