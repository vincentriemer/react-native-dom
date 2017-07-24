/**
 * @providesModule RCTViewManager
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE, RCT_EXPORT_METHOD } from "RCTBridge";
import UIView from "UIView";
import RCTShadowView from "RCTShadowView";
import RCTView from "RCTView";

import type { Frame } from "UIView";

type PropDef = {
  name: string,
  type: string,
  setter: (view: UIView, value: any) => void,
  exported: boolean
};

export function RCT_EXPORT_VIEW_PROP(
  name: string,
  type: string,
  exported: boolean = true
) {
  return (target: RCTViewManager, key: any, descriptor: any) => {
    if (typeof descriptor.value === "function") {
      if (target.__props == null) {
        target.__props = [];
      }

      target.__props = target.__props.concat([
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

export function RCT_EXPORT_SHADOW_PROP(
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

export function RCT_EXPORT_MIRRORED_PROP(...exportArgs: any[]) {
  return (...descriptorArgs: any[]) => {
    RCT_EXPORT_VIEW_PROP(...exportArgs)(...descriptorArgs);
    RCT_EXPORT_SHADOW_PROP(...exportArgs)(...descriptorArgs);
    return descriptorArgs[2];
  };
}

export function RCT_EXPORT_DIRECT_SHADOW_PROPS(
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

@RCT_EXPORT_MODULE
class RCTViewManager {
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

  @RCT_EXPORT_VIEW_PROP("backgroundColor", "Color")
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

  @RCT_EXPORT_VIEW_PROP("borderRadius", "number")
  setBorderRadius(view: RCTView, value: number) {
    view.borderRadius = value;
  }

  @RCT_EXPORT_VIEW_PROP("onStartShouldSetResponder", "bool")
  setOnStartShouldSetResponder(view: RCTView, value: boolean) {
    view.touchable = value;
  }

  @RCT_EXPORT_VIEW_PROP("borderWidth", "number")
  setBorderWidth(view: RCTView, value: number) {
    view.borderWidth = value;
  }

  @RCT_EXPORT_VIEW_PROP("borderColor", "number")
  setBorderColor(view: RCTView, value: number) {
    view.borderColor = value;
  }

  @RCT_EXPORT_VIEW_PROP("borderStyle", "string")
  setBorderStyle(view: RCTView, value: string) {
    view.borderStyle = value;
  }

  @RCT_EXPORT_VIEW_PROP("onLayout", "RCTDirectEventBlock")
  setOnLayout(view: RCTView, value: boolean) {
    view.onLayout = value;
  }

  @RCT_EXPORT_DIRECT_SHADOW_PROPS
  getDirectShadowViewProps() {
    return [
      ["top", "string"],
      ["right", "string"],
      ["bottom", "string"],
      ["left", "string"],
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
      ["borderWidth", "string"],
      ["marginTop", "string"],
      ["marginRight", "string"],
      ["marginBottom", "string"],
      ["marginLeft", "string"],
      ["marginVertical", "string"],
      ["marginHorizontal", "string"],
      ["margin", "string"],
      ["paddingTop", "string"],
      ["paddingRight", "string"],
      ["paddingBottom", "string"],
      ["paddingLeft", "string"],
      ["paddingVertical", "string"],
      ["paddingHorizontal", "string"],
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
      ["display", "string"]
    ];
  }
}

export default RCTViewManager;
