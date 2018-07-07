/** @flow */

import invariant from "invariant";

import type RCTBridge from "RCTBridge";
import RCTScrollView, { RCTScrollContentView } from "RCTScrollView";
import type UIView from "UIView";
import RCTViewManager from "RCTViewManager";

class RCTScrollViewManager extends RCTViewManager {
  static moduleName = "RCTScrollViewManager";

  view(): UIView {
    return new RCTScrollView(this.bridge);
  }

  describeProps() {
    return super
      .describeProps()
      .addNumberProp("scrollEventThrottle", this.setScrollEventThrottle)
      .addBooleanProp("horizontal", this.setHorizontal)
      .addBooleanProp("scrollEnabled", this.setScrollEnabled)
      .addDirectEvent("onScroll")
      .addDirectEvent("onScrollBeginDrag")
      .addDirectEvent("onScrollEndDrag")
      .addDirectEvent("onMomentumScrollBegin")
      .addDirectEvent("onMomentumScrollEnd");
  }

  setScrollEventThrottle(view: RCTScrollView, value: ?number) {
    view.scrollEventThrottle = value != null ? value : 0;
  }

  $getContentSize(reactTag: number, callbackId: number) {
    this.bridge.uiManager.addUIBlock((_, viewRegistry: Map<number, UIView>) => {
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

      this.bridge.callbackFromId(callbackId)({
        width: contentView.width,
        height: contentView.height
      });
    });
  }

  $scrollTo(
    reactTag: number,
    offsetX: number,
    offsetY: number,
    animated: boolean
  ) {
    this.bridge.uiManager.addUIBlock((_, viewRegistry: Map<number, UIView>) => {
      const view = viewRegistry.get(reactTag);
      invariant(
        view && view instanceof RCTScrollView,
        `Cannot find RCTScrollView with tag ${reactTag}`
      );

      view.scrollBehavior = animated ? "smooth" : "auto";
      view.scrollLeft = offsetX;
      view.scrollTop = offsetY;
    });
  }

  $scrollToEnd(reactTag: number, animated: boolean) {
    this.bridge.uiManager.addUIBlock((_, viewRegistry: Map<number, UIView>) => {
      const view = viewRegistry.get(reactTag);
      invariant(
        view && view instanceof RCTScrollView,
        `Cannot find RCTScrollView with tag ${reactTag}`
      );

      view.scrollBehavior = animated ? "smooth" : "auto";
      view.scrollLeft = view.scrollWidth;
      view.scrollTop = view.scrollHeight;
    });
  }

  $flashScrollIndicators(reactTag: number) {
    // no-op
  }

  setHorizontal(view: RCTScrollView, value: ?boolean) {
    view.horizontal = value;
  }

  setScrollEnabled(view: RCTScrollView, value: ?boolean) {
    view.scrollEnabled = value;
  }
}

export default RCTScrollViewManager;
