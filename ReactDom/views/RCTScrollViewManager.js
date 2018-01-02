/**
 * @providesModule RCTScrollViewManager
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";
import invariant from "Invariant";
import RCTScrollView, { RCTScrollContentView } from "RCTScrollView";
import type UIView from "UIView";

import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;

  const { RCT_EXPORT_VIEW_PROP, RCT_EXPORT_MIRRORED_PROP } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTScrollViewManager")
  class RCTScrollViewManager extends RCTViewManager {
    view(): UIView {
      return new RCTScrollView(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("overflow", "string")
    setOverflow(view: RCTScrollView, value: string) {
      view.overflow = value;
    }

    @RCT_EXPORT_VIEW_PROP("onScroll", "RCTDirectEventBlock")
    setOnScroll() {}

    @RCT_EXPORT_VIEW_PROP("onScrollBeginDrag", "RCTDirectEventBlock")
    setOnScrollBeginDrag() {}

    @RCT_EXPORT_VIEW_PROP("onScrollEndDrag", "RCTDirectEventBlock")
    setOnScrollEndDrag() {}

    @RCT_EXPORT_VIEW_PROP("onMomentumScrollBegin", "RCTDirectEventBlock")
    setOnMomentumScrollBegin() {}

    @RCT_EXPORT_VIEW_PROP("onMomentumScrollEnd", "RCTDirectEventBlock")
    setOnMomentumScrollEnd() {}

    @RCT_EXPORT_VIEW_PROP("scrollEventThrottle", "number")
    setScrollEventThrottle(view: RCTScrollView, value: number) {
      view.scrollEventThrottle = value;
    }

    @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
    getContentSize(reactTag: number, callbackId: number) {
      const cb = this.bridge.callbackFromId(callbackId);
      this.bridge.uiManager.addUIBlock(
        (_, viewRegistry: Map<number, UIView>) => {
          const view = viewRegistry.get(reactTag);
          invariant(
            view && view instanceof RCTScrollView,
            `Cannot find RCTScrollView with tag ${reactTag}`
          );

          const contentView = view.reactSubviews[0];
          invariant(
            contentView && contentView instanceof RCTScrollContentView,
            `Cannot find coresponding RCTScrollContentView for RCTScrollView with tag ${reactTag}`
          );

          cb({
            width: contentView.width,
            height: contentView.height
          });
        }
      );
    }

    @RCT_EXPORT_VIEW_PROP("horizontal", "boolean")
    setHorizontal(view: RCTScrollView, value: ?boolean) {
      view.horizontal = value;
    }

    @RCT_EXPORT_VIEW_PROP("scrollEnabled", "boolean")
    setScrollEnabled(view: RCTScrollView, value: ?boolean) {
      view.scrollEnabled = value;
    }
  }

  return RCTScrollViewManager;
})();
