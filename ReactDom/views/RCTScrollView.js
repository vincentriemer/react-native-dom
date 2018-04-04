/**
 * @providesModule RCTScrollView
 * @flow
 */

import RCTView from "./RCTView";
import UIView from "../base/UIView";
import type RCTBridge from "../bridge/RCTBridge";
import CustomElement from "../utils/CustomElement";
import type { RCTEvent } from "../bridge/RCTEventDispatcher";
import detectIt from "detect-it";
import RCTScrollViewLocalData from "./RCTScrollViewLocalData";

import invariant from "../utils/Invariant";
import debounce from "debounce";
import RCTEventDispatcher, {
  normalizeInputEventName
} from "../bridge/RCTEventDispatcher";

const SCROLL_LISTENER_OPTIONS = detectIt.passiveEvents
  ? { passive: true }
  : false;

const SHOULD_CORRECT_SCROLL = !!navigator.platform.match(/iPhone|iPod|iPad/g);

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

@CustomElement("rct-scroll-content-view")
export class RCTScrollContentView extends RCTView {
  constructor(bridge: RCTBridge) {
    super(bridge);
    this.updateHostStyle({
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

    if (!this.hasScrollParent()) {
      this.updateHostStyle("overscrollBehavior", "contain");
      this.addEventListener(
        "touchstart",
        () => {
          const top = this.scrollTop;
          const totalScroll = this.scrollHeight;
          const currentScroll = top + this.offsetHeight;

          if (top === 0) {
            this.scrollTop = 1;
          } else if (currentScroll === totalScroll) {
            this.scrollTop = top - 1;
          }
        },
        false
      );
    }

    this.isScrolling = false;
    this.scrollEventThrottle = 0;

    this.coalescingKey = 0;
    this.cachedChildFrames = [];

    this._horizontal = false;
    this._overflow = "scroll";
    this._scrollEnabled = true;

    this.updateTransform();

    this.addEventListener("scroll", this.handleScroll, SCROLL_LISTENER_OPTIONS);
  }

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
      // TODO: Make this conditional based on screen DPI
      styleUpdate.willChange = "transform";

      if (this._horizontal) {
        styleUpdate.overflowX = "auto";
        styleUpdate.overflowY = "hidden";
      } else {
        styleUpdate.overflowX = "hidden";
        styleUpdate.overflowY = "auto";
      }
    } else {
      styleUpdate.msOverflowStyle = "auto";
      styleUpdate.webkitOverflowScrolling = "";
      styleUpdate.willChange = "";

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

    const contentFrame = await this.manager.measure(this.reactTag);

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
    super.touchable = value;
    this.updateHostStyle("cursor", "auto");
  }
}

export default RCTScrollView;
