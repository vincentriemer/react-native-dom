/** @flow */

import detectIt from "detect-it";
import debounce from "debounce";
import invariant from "invariant";

import type { Frame, Inset, Size, Position } from "InternalLib";
import RCTView from "RCTView";
import UIView from "UIView";
import type RCTBridge from "RCTBridge";
import { type RCTEvent } from "RCTEventDispatcher";
import RCTScrollViewLocalData from "RCTScrollViewLocalData";
import isIOS from "isIOS";
import RCTEventDispatcher, {
  normalizeInputEventName
} from "RCTEventDispatcher";

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const SCROLL_LISTENER_OPTIONS = detectIt.passiveEvents
  ? { passive: true }
  : false;

type ScrollEventArgs = [
  number,
  Position,
  Inset,
  Size,
  Frame,
  number,
  number,
  ?Object
];

// $FlowFixMe - coalesceWithEvent should be compatible but I think flow has a bug
class RCTScrollEvent implements RCTEvent {
  // interface properties
  viewTag: number;
  eventName: string;
  coalescingKey: number;

  scrollViewContentOffset: Position;
  scrollViewContentInset: Inset;
  scrollViewContentSize: Size;
  scrollViewFrame: Frame;
  scrollViewZoomScale: number;
  userData: ?Object;

  constructor(
    eventName: string,
    reactTag: number,
    contentOffset: Position,
    contentInset: Inset,
    contentSize: Size,
    scrollFrame: Frame,
    zoomScale: number,
    coalescingKey: number,
    userData: ?Object
  ) {
    this.eventName = eventName;
    this.viewTag = reactTag;
    this.scrollViewContentOffset = contentOffset;
    this.scrollViewContentInset = contentInset;
    this.scrollViewContentSize = contentSize;
    this.scrollViewFrame = scrollFrame;
    this.scrollViewZoomScale = zoomScale;
    this.userData = userData;
    this.coalescingKey = coalescingKey;
  }

  get body() {
    let body = {
      contentOffset: {
        ...this.scrollViewContentOffset
      },
      contentInset: {
        ...this.scrollViewContentInset
      },
      contentSize: {
        ...this.scrollViewContentSize
      },
      layoutMeasurement: {
        width: this.scrollViewFrame.width,
        height: this.scrollViewFrame.height
      },
      zoomScale: this.scrollViewZoomScale
    };

    const userData = this.userData;
    if (userData) {
      body = { ...body, ...userData };
    }

    return body;
  }

  canCoalesce(): boolean {
    return true;
  }

  coalesceWithEvent(newEvent: RCTScrollEvent): RCTScrollEvent {
    let updatedChildFrames = [];
    if (this.userData && this.userData.updatedChildFrames)
      updatedChildFrames = updatedChildFrames.concat(
        this.userData.updatedChildFrames
      );
    if (newEvent.userData && newEvent.userData.updatedChildFrames)
      updatedChildFrames = updatedChildFrames.concat(
        newEvent.userData.updatedChildFrames
      );

    if (updatedChildFrames.length !== 0) {
      newEvent.userData = {
        updatedChildFrames
      };
    }

    return newEvent;
  }

  moduleDotMethod(): string {
    return "RCTEventEmitter.receiveEvent";
  }
  arguments(): Array<any> {
    const args = [
      this.viewTag,
      normalizeInputEventName(this.eventName),
      this.body
    ];
    return args;
  }
}

class RCTScrollContentView extends RCTView {
  constructor(bridge: RCTBridge) {
    super(bridge);
    this.updateHostStyle({
      position: "relative",
      display: "block",
      opacity: "1",
      contain: "layout style"
    });

    // vastly improves scrolling performance (especially on Safari)
    if (isSafari) {
      this.addWillChange("transform");
    }
  }

  set frame(value: Frame) {
    super.frame = value;

    const superView = this.reactSuperview;
    const subView = this.reactSubviews[0];

    if (
      subView &&
      subView instanceof RCTView &&
      superView &&
      superView instanceof RCTScrollView
    ) {
      superView.boundsDidChange(subView);
    }
  }

  get frame(): Frame {
    return super.frame;
  }
}

type ChildFrame = {
  index: number,
  x: number,
  y: number,
  width: number,
  height: number
};

function setScrollPadding(node: HTMLElement) {
  const { scrollTop, offsetHeight, scrollHeight } = node;

  if (scrollTop <= 0) {
    node.scrollTop = 1;
  }

  if (scrollTop + offsetHeight >= scrollHeight) {
    node.scrollTop = scrollHeight - offsetHeight - 1;
  }
}

customElements.define("rct-scroll-content-view", RCTScrollContentView);

class RCTScrollView extends RCTView {
  manager: *;

  isScrolling: boolean;
  scrollEventThrottle: number;
  _scrollLastTick: number;

  _horizontal: boolean;
  _overflow: string;
  _scrollEnabled: boolean;

  coalescingKey: number;
  cachedChildFrames: Array<Frame>;

  contentSize: Size = { width: 0, height: 0 };

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.manager = bridge.uiManager;

    this.updateHostStyle("contain", "strict");
    this.updateChildContainerStyle("contain", "style size");

    if (!this.hasScrollParent()) {
      this.updateHostStyle("overscrollBehavior", "contain");
    }

    this.isScrolling = false;
    this.scrollEventThrottle = 0;

    this.coalescingKey = 0;
    this.cachedChildFrames = [];

    this._horizontal = false;
    this._overflow = "scroll";
    this._scrollEnabled = true;

    if (isSafari) {
      this.addWillChange("transform");
    }

    this.addEventListener("scroll", this.handleScroll, SCROLL_LISTENER_OPTIONS);

    if (isIOS) {
      this.addEventListener(
        "touchstart",
        this.onTouchStart,
        detectIt.passiveEvents ? { passive: true } : false
      );
    }
  }

  onTouchStart = () => {
    setScrollPadding(this);
  };

  hasScrollParent() {
    let currentView = this;
    while (currentView.reactSuperview) {
      if (currentView instanceof RCTScrollView) {
        return true;
      }
      currentView = currentView.reactSuperView;
    }
    return false;
  }

  set scrollEnabled(value: ?boolean) {
    this._scrollEnabled = !!value;
    this.updateScrollBehavior();
  }

  set horizontal(value: ?boolean) {
    this._horizontal = !!value;
    this.updateScrollBehavior();
  }

  set overflow(value: ?string) {
    if (value != null) {
      this._overflow = value;
    } else {
      this._overflow = "hidden";
    }
    this.updateScrollBehavior();
  }

  set scrollBehavior(value: "auto" | "smooth") {
    this.updateHostStyle({
      scrollBehavior: value
    });
  }

  updateScrollBehavior() {
    const styleUpdate = {};
    if (this._overflow === "scroll" && this._scrollEnabled) {
      styleUpdate.msOverflowStyle = "-ms-autohiding-scrollbar";
      styleUpdate.webkitOverflowScrolling = "touch";

      if (this._horizontal) {
        styleUpdate.overflowX = "auto";
        styleUpdate.overflowY = "hidden";
        styleUpdate.touchAction = "pan-x";
        this.setAttribute("touch-action", "pan-x");
      } else {
        styleUpdate.overflowX = "hidden";
        styleUpdate.overflowY = "auto";
        styleUpdate.touchAction = "pan-y";
        this.setAttribute("touch-action", "pan-y");
      }
    } else {
      styleUpdate.touchAction = undefined;
      this.removeAttribute("touch-action");

      styleUpdate.msOverflowStyle = "auto";
      styleUpdate.webkitOverflowScrolling = "";

      styleUpdate.overflowX = "hidden";
      styleUpdate.overflowY = "hidden";
    }

    this.updateHostStyle(styleUpdate);
  }

  calculateChildFramesData() {
    const updatedChildFrames = [];

    const contentView = this.reactSubviews[0];
    invariant(
      contentView && contentView instanceof RCTScrollContentView,
      `RCTScrollView (of ID ${this.reactTag}) has no contentView`
    );

    contentView.reactSubviews.forEach((subview, idx) => {
      const newFrame = subview.frame;

      let frameChanged = false;
      if (this.cachedChildFrames.length <= idx) {
        frameChanged = true;
        // this.cachedChildFrames.push(newFrame);
      } else if (
        JSON.stringify(newFrame) !== JSON.stringify(this.cachedChildFrames[idx])
      ) {
        frameChanged = true;
        // this.cachedChildFrames[idx] = newFrame;
      }

      if (frameChanged) {
        updatedChildFrames.push({
          index: idx,
          x: newFrame.left,
          y: newFrame.top,
          width: newFrame.width,
          height: newFrame.height
        });
      }
    });

    return updatedChildFrames;
  }

  connectedCallback() {
    this.correctScrollPosition();
  }

  boundsDidChange(contentView: RCTView) {
    this.coalescingKey++;
    const childFrames = this.calculateChildFramesData();

    const contentOffset: Position = {
      x: this.scrollLeft,
      y: this.scrollTop
    };

    const contentInset: Inset = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };

    const contentSize = {
      width: this.scrollWidth,
      height: this.scrollHeight
    };

    // const contentFrame = this.manager.measure(this.reactTag);
    const shadowView = this.manager.shadowViewRegistry.get(this.reactTag);
    invariant(shadowView, `No ShadowView for tag ${this.reactTag}`);
    const contentFrame = shadowView.previousLayout;
    invariant(
      contentFrame,
      `ShadowView with tag ${this.reactTag} has not been layed out`
    );

    this.contentSize = {
      width: contentFrame.width,
      height: contentFrame.height
    };

    const args = [
      this.reactTag,
      contentOffset,
      contentInset,
      contentSize,
      contentFrame,
      1,
      this.coalescingKey
    ];

    this.bridge.eventDispatcher.sendEvent(
      new RCTScrollEvent("onScroll", ...args, {
        updatedChildFrames: childFrames
      })
    );
  }

  scrollDidChange(x: number, y: number) {
    setTimeout(() => {
      const localData = new RCTScrollViewLocalData(x, y);
      this.bridge.uiManager.setLocalDataForView(localData, this);
    }, 0);
  }

  handleScroll = async (e: Event, userData: ?Object) => {
    this.coalescingKey++;

    const scrollLeft = this.scrollLeft;
    const scrollTop = this.scrollTop;

    const contentOffset: Position = {
      x: scrollLeft,
      y: scrollTop
    };

    this.scrollDidChange(scrollLeft, scrollTop);

    const contentInset: Inset = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };

    const contentSize = {
      width: this.scrollWidth,
      height: this.scrollHeight
    };

    const shadowView = this.manager.shadowViewRegistry.get(this.reactTag);
    invariant(shadowView, `No ShadowView for tag ${this.reactTag}`);
    const contentFrame = shadowView.previousLayout;
    invariant(
      contentFrame,
      `ShadowView with tag ${this.reactTag} has not been layed out`
    );

    const args = [
      this.reactTag,
      contentOffset,
      contentInset,
      contentSize,
      contentFrame,
      1,
      this.coalescingKey,
      userData
    ];

    this.debouncedOnScrollEnd(...args);

    if (this.isScrolling) {
      this.handleScrollTick(...args);
    } else {
      this.handleScrollStart(...args);
    }
  };

  debouncedOnScrollEnd = debounce(this.handleScrollEnd, 100);

  handleScrollStart(...eventArgs: ScrollEventArgs) {
    this.isScrolling = true;
    this._scrollLastTick = Date.now();

    const scrollEvent = new RCTScrollEvent("onScrollBeginDrag", ...eventArgs);
    this.bridge.eventDispatcher.sendEvent(scrollEvent);
  }

  handleScrollEnd(...eventArgs: ScrollEventArgs) {
    this.isScrolling = false;

    const scrollEvent = new RCTScrollEvent("onScrollEndDrag", ...eventArgs);
    this.bridge.eventDispatcher.sendEvent(scrollEvent);

    const momentumScrollEvent = new RCTScrollEvent(
      "onMomentumScrollEnd",
      ...eventArgs
    );
    this.bridge.eventDispatcher.sendEvent(momentumScrollEvent);
    this.correctScrollPosition();
  }

  correctScrollPosition() {
    const scrollNudge = 1;

    if (isIOS) {
      if (!this._horizontal) {
        const endTopPosition = this.scrollTop + this.contentSize.height;
        if (this.scrollTop <= 0 && this.scrollTop >= -0.1) {
          this.scrollTop = scrollNudge;
        } else if (
          endTopPosition >= this.scrollHeight &&
          endTopPosition <= this.scrollHeight + 0.1
        ) {
          this.scrollTop = this.scrollTop - scrollNudge;
        }
      } else {
        const endLeftPosition = this.scrollLeft + this.contentSize.width;
        if (this.scrollLeft <= 0 && this.scrollLeft >= -0.1) {
          this.scrollLeft = scrollNudge;
        } else if (
          endLeftPosition >= this.scrollWidth &&
          endLeftPosition <= this.scrollWidth + 0.1
        ) {
          this.scrollLeft = this.scrollLeft - scrollNudge;
        }
      }
    }
  }

  handleScrollTick(...eventArgs: ScrollEventArgs) {
    const shouldEmitScrollEvent = this.shouldEmitScrollEvent(
      this._scrollLastTick,
      this.scrollEventThrottle
    );

    if (shouldEmitScrollEvent) {
      this._scrollLastTick = Date.now();
      const scrollEvent = new RCTScrollEvent("onScroll", ...eventArgs);
      this.bridge.eventDispatcher.sendEvent(scrollEvent);
    }
  }

  shouldEmitScrollEvent(lastTick: number, eventThrottle: number): boolean {
    const timeSinceLastTick = Date.now() - lastTick;
    return eventThrottle > 0 && timeSinceLastTick >= eventThrottle;
  }

  get touchable(): boolean {
    return super.touchable;
  }

  set touchable(value: boolean) {
    // super.touchable = value;
    this._touchable = value;
    this.updateDerivedPointerEvents();
    this.updateHostStyle("cursor", "auto");
  }
}

customElements.define("rct-scroll-view", RCTScrollView);

export default RCTScrollView;
export { RCTScrollContentView };
