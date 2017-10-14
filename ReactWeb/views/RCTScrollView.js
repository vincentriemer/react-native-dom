/**
 * @providesModule RCTScrollView
 * @flow
 */

import RCTView from "RCTView";
import UIView from "UIView";
import type RCTBridge from "RCTBridge";
import type RCTUIManager from "RCTUIManager";
import CustomElement from "CustomElement";
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

var isSafari =
  navigator.vendor &&
  navigator.vendor.indexOf("Apple") > -1 &&
  navigator.userAgent &&
  !navigator.userAgent.match("CriOS");

const SHOULD_CORRECT_SCROLL = !!navigator.platform.match(/iPhone|iPod|iPad/g);
const SHOULD_ADD_SCROLL_OVERFLOW =
  !!navigator.platform.match(/iPhone|iPod|iPad/g) || isSafari;

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

@CustomElement("rct-scroll-overflow-view")
class RCTScrollOverflowView extends UIView {
  constructor() {
    super();
    Object.assign(this.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "calc(100% + 2px)",
      height: "calc(100% + 2px)"
    });
  }
}

@CustomElement("rct-scroll-content-view")
export class RCTScrollContentView extends RCTView {
  constructor(bridge: RCTBridge) {
    super(bridge);

    Object.assign(this.style, {
      position: "relative",
      display: "block",
      opacity: "1",
      // vastly improves scrolling performance (especially on sfarai)
      willChange: "transform"
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

  _horizontal: boolean;
  _overflow: string;
  _scrollEnabled: boolean;

  coalescingKey: number;
  cachedChildFrames: Array<Frame>;

  contentSize: Size = { width: 0, height: 0 };
  overflowView: RCTScrollOverflowView;

  constructor(bridge: RCTBridge) {
    super(bridge);

    const manager: any = bridge.modulesByName["UIManager"];
    this.manager = manager;

    this.style.contain = "strict";

    this.isScrolling = false;
    this.scrollEventThrottle = 0;

    this.coalescingKey = 0;
    this.cachedChildFrames = [];

    this._horizontal = false;
    this._overflow = "scroll";
    this._scrollEnabled = true;

    if (SHOULD_ADD_SCROLL_OVERFLOW) {
      this.overflowView = new RCTScrollOverflowView();
      this.insertBefore(this.overflowView, this.childContainer);
    }

    this.addEventListener(
      "scroll",
      e => {
        if (detectIt.passiveEvents) {
          this.handleScroll(e);
        } else {
          setTimeout(() => this.handleScroll(e), 0);
        }
      },
      SCROLL_LISTENER_OPTIONS
    );
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

  updateScrollBehavior() {
    if (this._overflow === "scroll" && this._scrollEnabled) {
      this.style.webkitOverflowScrolling = "touch";
      this.style.scrollBehavior = "smooth";
      // TODO: Make this conditional based on screen DPI
      this.style.willChange = "transform, scroll-position";

      if (this._horizontal) {
        this.style.overflowX = "scroll";
        this.style.overflowY = "hidden";
      } else {
        this.style.overflowX = "hidden";
        this.style.overflowY = "scroll";
      }
    } else {
      this.style.webkitOverflowScrolling = "";
      this.style.willChange = "";

      this.style.overflowX = "hidden";
      this.style.overflowY = "hidden";
    }
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
    if (SHOULD_CORRECT_SCROLL) {
      if (this._horizontal) {
        this.scrollLeft = 1;
      } else {
        this.scrollTop = 1;
      }
    }
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

    const contentFrame = this.manager.measure(this.reactTag);

    this.contentSize = {
      width: contentFrame.width,
      height: contentFrame.height
    };

    this.correctScrollPosition();

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

  handleScroll = (e: Event, userData: ?Object) => {
    this.coalescingKey++;

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

    this.correctScrollPosition();
  }

  correctScrollPosition() {
    const scrollNudge = 1;

    if (SHOULD_CORRECT_SCROLL) {
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

  get touchable(): boolean {
    return super.touchable;
  }

  set touchable(value: boolean) {
    super.touchable = value;
    this.style.cursor = "auto";
  }
}

export default RCTScrollView;
