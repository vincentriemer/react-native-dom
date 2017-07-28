/**
 * @providesModule RCTScrollView
 * @flow
 */

import RCTView from "RCTView";
import type RCTBridge from "RCTBridge";
import type RCTUIManager from "RCTUIManager";
import CustomElement from "CustomElement";
import mixin from "mixin";
import type { RCTEvent } from "RCTEventDispatcher";
import detectIt from "detect-it";

import invariant from "Invariant";
import debounce from "debounce";
import RCTEventDispatcher, {
  normalizeInputEventName
} from "RCTEventDispatcher";

const SCROLL_LISTENER_OPTIONS = detectIt.passiveEvents
  ? { passive: true }
  : false;

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
    return false;
  }

  coalesceWithEvent(event: RCTEvent): RCTEvent {
    return this;
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

@CustomElement("rct-scroll-content-view")
export class RCTScrollContentView extends RCTView {
  constructor(bridge: RCTBridge) {
    super(bridge);

    Object.assign(this.style, {
      position: "relative",
      display: "block",
      opacity: "1"
    });
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

@CustomElement("rct-scroll-view")
class RCTScrollView extends RCTView {
  bridge: RCTBridge;
  manager: RCTUIManager;

  isScrolling: boolean;
  scrollEventThrottle: number;
  _scrollLastTick: number;

  cachedChildFrames: Array<Frame>;

  constructor(bridge: RCTBridge) {
    super(bridge);

    const manager: any = bridge.modulesByName["UIManager"];
    this.manager = manager;

    this.style.webkitOverflowScrolling = "touch";
    this.style.contain = "strict";

    this.isScrolling = false;
    this.scrollEventThrottle = 0;

    this.cachedChildFrames = [];

    this.addEventListener("scroll", this.handleScroll, SCROLL_LISTENER_OPTIONS);
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

  boundsDidChange(contentView: RCTView) {
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

    const contentFrame = this.manager.measure(this.reactTag);

    const args = [
      this.reactTag,
      contentOffset,
      contentInset,
      contentSize,
      contentFrame,
      1
    ];

    this.bridge.eventDispatcher.sendEvent(
      new RCTScrollEvent("onScroll", ...args, {
        updatedChildFrames: childFrames
      })
    );
  }

  handleScroll = (e: Event, userData: ?Object) => {
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

    const contentFrame = this.manager.measure(this.reactTag);

    const args = [
      this.reactTag,
      contentOffset,
      contentInset,
      contentSize,
      contentFrame,
      1,
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

  handleScrollStart(...eventArgs) {
    this.isScrolling = true;
    this._scrollLastTick = Date.now();

    const scrollEvent = new RCTScrollEvent("onScrollBeginDrag", ...eventArgs);
    this.bridge.eventDispatcher.sendEvent(scrollEvent);
  }

  handleScrollEnd(...eventArgs) {
    this.isScrolling = false;

    const scrollEvent = new RCTScrollEvent("onScrollEndDrag", ...eventArgs);
    this.bridge.eventDispatcher.sendEvent(scrollEvent);

    const momentumScrollEvent = new RCTScrollEvent(
      "onMomentumScrollEnd",
      ...eventArgs
    );
    this.bridge.eventDispatcher.sendEvent(momentumScrollEvent);
  }

  handleScrollTick(...eventArgs) {
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

  set overflow(value: string) {
    this.style.overflow = value;
  }

  get touchable(): boolean {
    return super.touchable;
  }

  set touchable(value: boolean) {
    super.touchable = value;
    this.style.cursor = "auto";
  }
}

export default RCTScrollView;
