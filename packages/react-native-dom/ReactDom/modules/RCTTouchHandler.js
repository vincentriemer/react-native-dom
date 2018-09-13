/** @flow */

import detectIt from "detect-it";
import invariant from "invariant";

import type RCTBridge from "RCTBridge";
import UIView from "UIView";
import UIChildContainerView from "UIChildContainerView";
import RCTEventDispatcher from "RCTEventDispatcher";
import RCTTouchEvent from "RCTTouchEvent";
import isIOS from "isIOS";
import guid from "Guid";

type UITouch = {
  view: UIView | UIChildContainerView,
  identifier: number,
  pageX: number,
  pageY: number,
  locationX: number,
  locationY: number,
  timestamp: number
};

type ReactTouch = {
  target: number,
  identifier: number,
  pageX?: number,
  pageY?: number,
  locationX?: number,
  locationY?: number,
  timestamp?: number
};

let mouseTouchCounter = 1;

const TOUCH_LISTENER_OPTIONS = detectIt.passiveEvents
  ? { passive: true, capture: false }
  : false;

function getFirstParentUIView(target: any) {
  while (target.parentElement) {
    if (target instanceof UIView || target instanceof UIChildContainerView) {
      return target;
    }
    target = target.parentElement;
  }
  return target;
}

class RCTTouchHandler {
  eventDispatcher: RCTEventDispatcher;

  nativeTouchesByIdentifier: { [number]: UITouch };
  nativeTouches: Array<UITouch>;
  reactTouches: Array<ReactTouch>;
  touchViews: Array<UIView>;
  coalescingKey: number;

  view: ?UIView;

  constructor(bridge: RCTBridge) {
    this.eventDispatcher = (bridge.moduleForClass(
      (RCTEventDispatcher: any)
    ): any);

    this.nativeTouches = [];
    this.nativeTouchesByIdentifier = {};
    this.reactTouches = [];
    this.touchViews = [];
  }

  static RCTNormalizeInteractionEvent(rawEvent: PointerEvent): ?Array<UITouch> {
    rawEvent.stopPropagation();

    const target: UIView = getFirstParentUIView(rawEvent.target);

    if ("which" in rawEvent && rawEvent.which === 3) {
      return null;
    } else if ("button" in rawEvent && rawEvent.button === 2) {
      return null;
    }

    return [
      {
        view: target,
        identifier: 0,
        pageX: rawEvent.pageX,
        pageY: rawEvent.pageY,
        locationX: rawEvent.clientX,
        locationY: rawEvent.clientY,
        timestamp: performance.now()
      }
    ];
  }

  stopPropagation = (e: TouchEvent) => e.stopPropagation();
  preventDefault = (e: TouchEvent) => e.preventDefault();

  attachToView(view: UIView) {
    this.view = view;
    view.addGestureRecognizer(
      this,
      detectIt.deviceType,
      TOUCH_LISTENER_OPTIONS
    );

    if (isIOS) {
      view.addEventListener(
        "touchmove",
        this.stopPropagation,
        TOUCH_LISTENER_OPTIONS
      );

      view.parentElement &&
        view.parentElement.addEventListener(
          "touchmove",
          this.preventDefault,
          TOUCH_LISTENER_OPTIONS
        );
    }
  }

  detachFromView(view: UIView) {
    this.view = undefined;
    view.removeGestureRecognizer(this, TOUCH_LISTENER_OPTIONS);

    if (isIOS) {
      view.removeEventListener(
        "touchmove",
        this.stopPropagation,
        TOUCH_LISTENER_OPTIONS
      );

      view.parentElement &&
        view.parentElement.removeEventListener(
          "touchmove",
          this.preventDefault,
          TOUCH_LISTENER_OPTIONS
        );
    }
  }

  recordNewTouches(touches: Array<UITouch>) {
    touches.forEach((touch) => {
      invariant(
        !this.nativeTouchesByIdentifier.hasOwnProperty(touch.identifier),
        "Touch is already recorded. This is a critical bug"
      );

      // Find closest React-managed touchable element
      let targetView = (touch.view: any);
      while (targetView) {
        if (targetView === this.view) break;
        if (targetView.reactTag && targetView.touchable) break;
        targetView = targetView.parentElement;
      }

      const reactTag = targetView.reactTag;
      const touchID = touch.identifier;

      // Create touch
      const reactTouch = {
        target: reactTag,
        identifier: touchID
      };

      // Add to arrays
      this.touchViews.push(targetView);
      this.nativeTouches.push(touch);
      this.nativeTouchesByIdentifier[touchID] = touch;
      this.reactTouches.push(reactTouch);
    });
  }

  recordRemovedTouches(touches: Array<UITouch>) {
    for (let touch of touches) {
      const nativeTouch = this.nativeTouchesByIdentifier[touch.identifier];

      if (!nativeTouch) {
        continue;
      }

      const index = this.nativeTouches.indexOf(nativeTouch);

      this.touchViews.splice(index, 1);
      this.nativeTouches.splice(index, 1);
      delete this.nativeTouchesByIdentifier[touch.identifier];
      this.reactTouches.splice(index, 1);
    }
  }

  updateReactTouch(touchIndex: number, newTouch: UITouch) {
    const reactTouch = this.reactTouches[touchIndex];

    const updatedReactTouch = {
      ...reactTouch,
      pageX: newTouch.pageX,
      pageY: newTouch.pageY,
      locationX: newTouch.locationX,
      locationY: newTouch.locationY,
      timestamp: newTouch.timestamp
    };

    // TODO: force touch

    this.reactTouches[touchIndex] = updatedReactTouch;
  }

  updateAndDispatchTouches(touches: Array<UITouch>, eventName: string) {
    const changedIndexes = [];
    for (let touch of touches) {
      const nativeTouch = this.nativeTouchesByIdentifier[touch.identifier];
      if (!nativeTouch) {
        console.log("updateAndDispatch failed");
        continue;
      }

      const index = this.nativeTouches.indexOf(nativeTouch);

      if (index === -1) continue;

      this.updateReactTouch(index, touch);
      changedIndexes.push(index);
    }

    if (changedIndexes.length === 0) {
      console.log("no changed Indexes");
      return;
    }

    const reactTouches = this.reactTouches.map((reactTouch) => ({
      ...reactTouch
    }));

    const canBeCoalesced = eventName === "touchMove";

    if (!canBeCoalesced) {
      this.coalescingKey++;
    }

    invariant(this.view, "attempting to send event to unknown view");

    const event = new RCTTouchEvent(
      eventName,
      this.view.reactTag,
      reactTouches,
      changedIndexes,
      this.coalescingKey
    );

    if (!canBeCoalesced) {
      this.coalescingKey++;
    }

    this.eventDispatcher.sendEvent(event);
  }

  pointerBegan = (event: PointerEvent) => {
    const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
    if (!touches) return;

    this.touchesBegan(touches);

    const view = this.view;
    if (view) {
      // $FlowFixMe
      view.addEventListener(
        "pointerup",
        this.pointerEnded,
        TOUCH_LISTENER_OPTIONS
      );
      // $FlowFixMe
      view.addEventListener(
        "pointermove",
        this.pointerMoved,
        TOUCH_LISTENER_OPTIONS
      );
      // $FlowFixMe
      view.addEventListener(
        "pointercancel",
        this.pointerCancelled,
        TOUCH_LISTENER_OPTIONS
      );
    }
  };

  pointerMoved = (event: PointerEvent) => {
    const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
    if (!touches) return;

    this.touchesMoved(touches);
  };

  pointerEnded = (event: PointerEvent) => {
    const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
    if (!touches) return;

    this.touchesEnded(touches);

    const view = this.view;
    if (view) {
      this.removePointerEvents(view);
    }
  };

  pointerCancelled = (event: PointerEvent) => {
    const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
    if (!touches) return;

    this.touchesCanceled(touches);

    const view = this.view;
    if (view) {
      this.removePointerEvents(view);
    }
  };

  removePointerEvents(view: UIView) {
    // $FlowFixMe
    view.removeEventListener(
      "pointerup",
      this.pointerEnded,
      TOUCH_LISTENER_OPTIONS
    );
    // $FlowFixMe
    view.removeEventListener(
      "pointermove",
      this.pointerMoved,
      TOUCH_LISTENER_OPTIONS
    );
    // $FlowFixMe
    view.removeEventListener(
      "pointercancel",
      this.pointerCancelled,
      TOUCH_LISTENER_OPTIONS
    );
  }

  touchesBegan(touches: Array<UITouch>) {
    this.recordNewTouches(touches);
    this.updateAndDispatchTouches(touches, "touchStart");
  }

  touchesMoved(touches: Array<UITouch>) {
    this.updateAndDispatchTouches(touches, "touchMove");
  }

  touchesEnded(touches: Array<UITouch>) {
    this.updateAndDispatchTouches(touches, "touchEnd");
    this.recordRemovedTouches(touches);
  }

  touchesCanceled(touches: Array<UITouch>) {
    this.updateAndDispatchTouches(touches, "touchCancel");
    this.recordRemovedTouches(touches);
  }
}

export default RCTTouchHandler;
