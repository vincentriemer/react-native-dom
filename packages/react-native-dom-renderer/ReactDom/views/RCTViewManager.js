/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import UIView from "UIView";
import RCTPropTypes from "RCTPropTypes";
import RCTPropDescription from "RCTPropDescription";
import MatrixMath from "NativeMatrixMath";
import {
  BORDER_NUMBER_PROPS,
  BORDER_COLOR_PROPS,
  BORDER_STYLE_PROPS
} from "UIBorderView";
import RCTView from "RCTView";
import type { HitSlop } from "UIHitSlopView";
import RCTShadowView from "RCTShadowView";

type PropDef = {
  name: string,
  type: string,
  setter: (view: RCTView, value: any) => void,
  exported: boolean
};

const SHADOW_PROP_NAMES = [
  "top",
  "right",
  "bottom",
  "left",
  "start",
  "end",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "minWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStartWidth",
  "borderEndWidth",
  "borderWidth",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginVertical",
  "marginHorizontal",
  "marginStart",
  "marginEnd",
  "margin",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingVertical",
  "paddingHorizontal",
  "paddingStart",
  "paddingEnd",
  "padding",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "alignContent",
  "position",
  "aspectRatio",
  "overflow",
  "display",
  "direction"
];

function eventSetter(view: RCTView, propName: string) {
  return (json: Object) => {
    const mutableEvent = { ...json };
    mutableEvent.target = view.reactTag;
    view.bridge.eventDispatcher.sendInputEvent(propName, mutableEvent);
  };
}

class RCTViewManager extends RCTModule {
  static moduleName = "RCTViewManager";
  static __isViewManager = true;

  view(): UIView {
    return new RCTView(this.bridge);
  }

  shadowView(): RCTShadowView {
    return new RCTShadowView(this.bridge);
  }

  describeProps(): RCTPropDescription {
    let propDescription = new RCTPropDescription();

    // Add Shadow Props
    propDescription = SHADOW_PROP_NAMES.reduce(
      (desc, name) => desc.addShadowProp(name),
      propDescription
    );

    // Add Border View Props
    propDescription = propDescription.addStringProp(
      "borderStyle",
      (view: any, value) => {
        view.borderStyle = value;
      }
    );

    propDescription = BORDER_NUMBER_PROPS.reduce(
      (desc, name) =>
        desc.addNumberProp(name, (view: any, value) => {
          view[name] = value;
        }),
      propDescription
    );

    propDescription = BORDER_COLOR_PROPS.reduce(
      (desc, name) =>
        desc.addColorProp(name, (view: any, value) => {
          view[name] = value;
        }),
      propDescription
    );

    return propDescription
      .addColorProp("backgroundColor", this.setBackgroundColor)
      .addNumberProp("opacity", this.setOpacity)
      .addArrayProp("transform", this.setTransform)
      .addArrayProp("animatedTransform", this.setAnimatedTransform, true)
      .addBooleanProp("onStartShouldSetResponder", this.setTouchable)
      .addBooleanProp("disabled", this.setDisabled, true)
      .addStringProp("pointerEvents", this.setPointerEvents)
      .addStringProp("backfaceVisibility", this.setBackfaceVisibility)
      .addStringProp("overflow", this.setOverflow)
      .addNumberProp("zIndex", this.setZIndex)
      .addNumberProp("shadowColor", this.setShadowColor)
      .addObjectProp("shadowOffset", this.setShadowOffset)
      .addNumberProp("shadowOpacity", this.setShadowOpacity)
      .addNumberProp("shadowRadius", this.setShadowRadius)
      .addProp("hitSlop", "EdgeInsetsProp", this.setHitSlop, false)
      .addStringProp("direction", this.setDirection)
      .addMirroredProp("collapsable", RCTPropTypes.bool, () => {})
      .addDirectShadowEvent("onLayout");
  }

  customBubblingEventTypes(): Array<string> {
    return [
      // Generic events
      "press",
      "change",
      "focus",
      "blur",
      "submitEditing",
      "endEditing",
      "keyPress",

      // Touch events
      "touchStart",
      "touchMove",
      "touchCancel",
      "touchEnd"
    ];
  }

  setBackgroundColor(view: RCTView, value: ?string) {
    view.backgroundColor = value ?? "transparent";
  }

  setOpacity(view: RCTView, value: ?number) {
    view.opacity = value ?? 1;
  }

  setTransform(view: RCTView, value: ?Array<number>) {
    view.transform = value;
  }

  setAnimatedTransform(view: RCTView, value: ?Array<Object>) {
    view.animatedTransform = value;
  }

  setTouchable(view: RCTView, value: ?boolean) {
    view.touchable = value ?? false;
  }

  setDisabled(view: RCTView, value: ?boolean) {
    view.disabled = value ?? false;
  }

  setPointerEvents(view: RCTView, value: ?string) {
    view.pointerEvents = value ?? "auto";
  }

  setHitSlop(view: RCTView, value: ?HitSlop) {
    view.hitSlop = value ?? undefined;
  }

  setBackfaceVisibility(view: RCTView, value: ?string) {
    view.backfaceVisibility = value ?? "visible";
  }

  setOverflow(view: RCTView, value: ?string) {
    view.overflow = value ?? "visible";
  }

  setZIndex(view: RCTView, value: ?number) {
    view.zIndex = value ?? 0;
  }

  setShadowColor(view: RCTView, value: ?number) {
    view.shadowColor = value ?? 0;
  }

  setShadowOffset(view: RCTView, value: ?Object) {
    view.shadowOffset = value ?? { height: 0, width: 0 };
  }

  setShadowOpacity(view: RCTView, value: ?number) {
    view.shadowOpacity = value ?? 0;
  }

  setShadowRadius(view: RCTView, radius: ?number) {
    view.shadowRadius = radius ?? 1;
  }

  setDirection(view: RCTView, direction: ?string) {
    view.direction = direction ?? "auto";
  }
}

export default RCTViewManager;
