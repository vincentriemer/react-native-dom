/**
 * @providesModule RCTViewManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_METHOD, RCT_EXPORT_MODULE } from "RCTBridge";
import UIView from "UIView";
import { ALL_BORDER_PROPS } from "UIBorderView";
import RCTView from "RCTView";
import type { HitSlop } from "UIView";
import _RCTShadowView from "RCTShadowView";

type PropDef = {
  name: string,
  type: string,
  setter: (view: RCTView, value: any) => void,
  exported: boolean
};

module.exports = (async function() {
  const RCTShadowView = await _RCTShadowView;

  function eventSetter(view: RCTView, propName: string) {
    return (json: Object) => {
      const mutableEvent = { ...json };
      mutableEvent.target = view.reactTag;
      view.bridge.eventDispatcher.sendInputEvent(propName, mutableEvent);
    };
  }

  function RCT_EXPORT_VIEW_PROP(
    name: string,
    type: string,
    exported: boolean = true
  ) {
    return (target: RCTViewManager, key: any, descriptor: any) => {
      if (typeof descriptor.value === "function") {
        if (target.__props == null) {
          target.__props = [];
        }

        const isEvent = [
          "RCTBubblingEventBlock",
          "RCTDirectEventBlock"
        ].includes(type);

        const setter = !isEvent
          ? descriptor.value
          : (view: RCTView, value: boolean) => {
              descriptor.value(view, value ? eventSetter(view, name) : null);
            };

        target.__props = target.__props.concat([
          {
            name,
            type,
            setter,
            exported
          }
        ]);
      }

      return descriptor;
    };
  }

  function RCT_EXPORT_SHADOW_PROP(
    name: string,
    type: string,
    exported: boolean = true
  ) {
    return (target: RCTViewManager, key: any, descriptor: any) => {
      if (typeof descriptor.value === "function") {
        if (target.__shadowProps == null) {
          target.__shadowProps = [];
        }

        target.__shadowProps = target.__shadowProps.concat([
          {
            name,
            type,
            setter: descriptor.value,
            exported
          }
        ]);
      }

      return descriptor;
    };
  }

  function RCT_EXPORT_MIRRORED_PROP(...exportArgs: any[]) {
    return (...descriptorArgs: any[]) => {
      RCT_EXPORT_VIEW_PROP(...exportArgs)(...descriptorArgs);
      RCT_EXPORT_SHADOW_PROP(...exportArgs)(...descriptorArgs);
      return descriptorArgs[2];
    };
  }

  function RCT_EXPORT_DIRECT_SHADOW_PROPS(
    target: RCTViewManager,
    key: any,
    descriptor: any
  ) {
    if (typeof descriptor.value === "function") {
      if (target.__shadowProps == null) {
        target.__shadowProps = [];
      }

      const directPropConfigs = descriptor.value().map(([name, type]) => ({
        name,
        type,
        exported: false
      }));

      target.__shadowProps = target.__shadowProps.concat(directPropConfigs);
    }

    return descriptor;
  }

  function RCT_EXPORT_DIRECT_VIEW_PROPS(
    target: RCTViewManager,
    key: any,
    descriptor: any
  ) {
    if (typeof descriptor.value === "function") {
      if (target.__props == null) {
        target.__props = [];
      }

      const directPropConfigs = descriptor.value().map(([name, type]) => ({
        name,
        type,
        exported: false
      }));

      target.__props = target.__props.concat(directPropConfigs);
    }

    return descriptor;
  }

  @RCT_EXPORT_MODULE("RCTViewManager")
  class RCTViewManager {
    static RCT_EXPORT_VIEW_PROP = RCT_EXPORT_VIEW_PROP;
    static RCT_EXPORT_SHADOW_PROP = RCT_EXPORT_SHADOW_PROP;
    static RCT_EXPORT_MIRRORED_PROP = RCT_EXPORT_MIRRORED_PROP;
    static RCT_EXPORT_DIRECT_SHADOW_PROPS = RCT_EXPORT_DIRECT_SHADOW_PROPS;
    static RCT_EXPORT_DIRECT_VIEW_PROPS = RCT_EXPORT_DIRECT_VIEW_PROPS;

    static __moduleName: string;
    static __isViewManager = true;
    static __props = [];

    bridge: RCTBridge;

    __props: Array<PropDef>;
    __shadowProps: Array<PropDef>;

    constructor(bridge: RCTBridge) {
      this.bridge = bridge;
    }

    view(): UIView {
      return new RCTView(this.bridge);
    }

    shadowView(): RCTShadowView {
      return new RCTShadowView();
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

    @RCT_EXPORT_VIEW_PROP("backgroundColor", "color")
    setBackgroundColor(view: RCTView, value: number) {
      view.backgroundColor = value;
    }

    @RCT_EXPORT_VIEW_PROP("opacity", "number")
    setOpacity(view: RCTView, value: number) {
      view.opacity = value;
    }

    @RCT_EXPORT_VIEW_PROP("transform", "array")
    setTransform(view: RCTView, value: Array<number>) {
      view.transform = value;
    }

    @RCT_EXPORT_VIEW_PROP("animatedTransform", "array", false)
    setAnimatedTransform(view: RCTView, value: Array<Object>) {
      view.animatedTransform = value;
    }

    @RCT_EXPORT_VIEW_PROP("onStartShouldSetResponder", "bool")
    setOnStartShouldSetResponder(view: RCTView, value: boolean) {
      view.touchable = value;
    }

    @RCT_EXPORT_VIEW_PROP("onLayout", "RCTDirectEventBlock")
    setOnLayout(view: RCTView, value: Function) {
      view.onLayout = value;
    }

    @RCT_EXPORT_VIEW_PROP("disabled", "boolean", false)
    setDisabled(view: RCTView, value: boolean) {
      view.disabled = value;
    }

    @RCT_EXPORT_VIEW_PROP("pointerEvents", "RCTPointerEvents")
    setPointerEvents(view: RCTView, value: string) {
      view.pointerEvents = value;
    }

    @RCT_EXPORT_VIEW_PROP("hitSlop", "EdgeInsetsProp")
    setHitSlop(view: RCTView, value: HitSlop) {
      view.hitSlop = value;
    }

    @RCT_EXPORT_DIRECT_VIEW_PROPS
    getDirectViewProps() {
      const borderPropConfig = ALL_BORDER_PROPS.map((propName) => [
        propName,
        "string"
      ]);

      return [
        ...borderPropConfig,
        ["backfaceVisibility", "string"],
        ["overflow", "string"],
        ["zIndex", "number"],
        ["shadowColor", "color"],
        ["shadowOffset", "object"],
        ["shadowOpacity", "number"],
        ["shadowRadius", "number"]
      ];
    }

    @RCT_EXPORT_DIRECT_SHADOW_PROPS
    getDirectShadowViewProps() {
      return [
        ["top", "string"],
        ["right", "string"],
        ["bottom", "string"],
        ["left", "string"],
        ["start", "string"],
        ["end", "string"],
        ["width", "string"],
        ["height", "string"],
        ["minWidth", "string"],
        ["maxWidth", "string"],
        ["minHeight", "string"],
        ["minWidth", "string"],
        ["borderTopWidth", "string"],
        ["borderRightWidth", "string"],
        ["borderBottomWidth", "string"],
        ["borderLeftWidth", "string"],
        ["borderStartWidth", "string"],
        ["borderEndWidth", "string"],
        ["borderWidth", "string"],
        ["marginTop", "string"],
        ["marginRight", "string"],
        ["marginBottom", "string"],
        ["marginLeft", "string"],
        ["marginVertical", "string"],
        ["marginHorizontal", "string"],
        ["marginStart", "string"],
        ["marginEnd", "string"],
        ["margin", "string"],
        ["paddingTop", "string"],
        ["paddingRight", "string"],
        ["paddingBottom", "string"],
        ["paddingLeft", "string"],
        ["paddingVertical", "string"],
        ["paddingHorizontal", "string"],
        ["paddingStart", "string"],
        ["paddingEnd", "string"],
        ["padding", "string"],
        ["flex", "string"],
        ["flexGrow", "string"],
        ["flexShrink", "string"],
        ["flexBasis", "string"],
        ["flexDirection", "string"],
        ["flexWrap", "string"],
        ["justifyContent", "string"],
        ["alignItems", "string"],
        ["alignSelf", "string"],
        ["alignContent", "string"],
        ["position", "string"],
        ["aspectRatio", "string"],
        ["overflow", "string"],
        ["display", "string"],
        ["direction", "string"]
      ];
    }
  }

  return RCTViewManager;
})();
