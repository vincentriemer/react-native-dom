/** @flow */

import * as YG from "yoga-dom";
import invariant from "invariant";

import type RCTBridge from "RCTBridge";
import type { Frame } from "InternalLib";
import type { RCTComponent } from "RCTComponent";

declare var __DEV__: boolean;

const LAYOUT_PROPS = ["top", "left", "width", "height"];

export type LayoutChange = {
  reactTag: number,
  layout: Frame,
  previousMeasurement: ?Frame,
  nextMeasurement: Frame
};

export const LAYOUT_ONLY_PROPS = [
  "alignSelf",
  "alignItems",
  "collapsable",
  "flex",
  "flexBasis",
  "flexDirection",
  "flexGrow",
  "flexShrink",
  "flexWrap",
  "justifyContent",
  "alignContent",
  "display",

  /* position */
  "right",
  "top",
  "bottom",
  "left",
  "start",
  "end",

  /* dimensions */
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",

  /* margins */
  "margin",
  "marginVertical",
  "marginHorizontal",
  "marginLeft",
  "marginRight",
  "marginTop",
  "marginBottom",
  "marginStop",
  "marginEnd",

  /* paddings */
  "padding",
  "paddingVertical",
  "paddingHorizontal",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "paddingStart",
  "paddingEnd"
];

class RCTShadowView implements RCTComponent {
  _backgroundColor: string;
  _transform: Array<number>;
  _direction: any;

  viewName: string;
  rootTag: number;
  bridge: RCTBridge;

  yogaNode: YG.Node;
  previousLayout: ?Frame;
  isNewView: boolean;
  isHidden: boolean;

  reactTag: number;
  reactSubviews: Array<RCTShadowView> = [];
  reactSuperview: ?RCTShadowView;

  // layout-only nodes
  isLayoutOnly: boolean = false;
  totalNativeChildren: number = 0;
  nativeParent: ?RCTShadowView;
  nativeChildren: ?(RCTShadowView[]);

  measurement: ?Frame;
  prevMeasurement: ?Frame;

  width: number;
  height: number;

  onLayout: ?Function;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
    this.yogaNode = new bridge.Yoga.Node();

    this.previousLayout = undefined;
    this.measurement = undefined;
  }

  isVirtual() {
    return false;
  }

  set localData(value: any) {}

  set direction(value: string) {
    const constants = this.bridge.Yoga.Constants;

    let yogaValue;
    switch (value) {
      case "ltr":
        yogaValue = constants.direction.ltr;
        break;
      case "rtl":
        yogaValue = constants.direction.rtl;
        break;
      default:
        yogaValue = constants.direction.inherit;
        break;
    }

    this._direction = yogaValue;
    this.yogaNode["direction"] = yogaValue;
  }

  get direction() {
    return this._direction;
  }

  get hasNewLayout(): boolean {
    return this.yogaNode.hasNewLayout;
  }

  get isDirty(): boolean {
    return this.yogaNode.isDirty();
  }

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this._backgroundColor = value;
  }

  measureGlobal() {
    let globalX = 0,
      globalY = 0;

    let currentView = this;
    while (currentView) {
      const layout = currentView.previousLayout;
      if (layout) {
        globalX += layout.left;
        globalY += layout.top;

        if (currentView.hasOwnProperty("scrollOffset")) {
          globalX -= (currentView: any).scrollOffset.left;
          globalY -= (currentView: any).scrollOffset.top;
        }

        currentView = currentView.reactSuperview;
      } else {
        currentView = null;
      }
    }

    return { globalX, globalY };
  }

  getLayoutChanges(previousPosition: {
    top: number,
    left: number
  }): Array<LayoutChange> {
    if (!this.yogaNode.hasNewLayout && !!this.previousLayout) return [];
    this.yogaNode.hasNewLayout = false;

    let layoutChanges = [];

    const newLayout = this.yogaNode.getComputedLayout();

    const currentPosition = {
      top: previousPosition.top + newLayout.top,
      left: previousPosition.left + newLayout.left
    };

    const previousMeasurement = this.measurement
      ? { ...this.measurement }
      : null;

    const nextMeasurement = {
      ...currentPosition,
      width: newLayout.width,
      height: newLayout.height
    };

    if (JSON.stringify(newLayout) !== JSON.stringify(this.previousLayout)) {
      layoutChanges.push({
        reactTag: this.reactTag,
        layout: newLayout,
        previousMeasurement,
        nextMeasurement
      });

      if (this.onLayout) {
        this.onLayout({
          layout: {
            x: newLayout.left,
            y: newLayout.top,
            width: newLayout.width,
            height: newLayout.height
          }
        });
      }

      this.previousLayout = newLayout;
    }

    this.reactSubviews.forEach((subView) => {
      layoutChanges = layoutChanges.concat(
        subView.getLayoutChanges(currentPosition)
      );
    });

    this.prevMeasurement = previousMeasurement;
    this.measurement = { ...nextMeasurement };
    return layoutChanges;
  }

  insertReactSubviewAtIndex(subview: RCTShadowView, index: number) {
    subview.reactSuperview = this;
    this.reactSubviews.splice(index, 0, subview);
    this.yogaNode.insertChild(subview.yogaNode, index);

    const increase = subview.isLayoutOnly ? subview.totalNativeChildren : 1;
    this.totalNativeChildren += increase;

    this.updateNativeChildrenCountInParent(increase);
  }

  removeReactSubview(subview: RCTShadowView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter((s) => s !== subview);
    this.yogaNode.removeChild(subview.yogaNode);

    const decrease = subview.isLayoutOnly ? subview.totalNativeChildren : 1;
    this.totalNativeChildren -= decrease;
    this.updateNativeChildrenCountInParent(-decrease);
  }

  removeAllNativeChildren() {
    this.nativeChildren = null;
    this.totalNativeChildren = 0;
  }

  addNativeChildAt(child: RCTShadowView, index: number) {
    invariant(!this.isLayoutOnly, "Cannot add native child to layoutOnly node");
    invariant(
      !child.isLayoutOnly,
      "Cannot add layout only child as a native child"
    );

    if (this.nativeChildren == null) {
      this.nativeChildren = [];
    }

    this.nativeChildren.splice(index, 0, child);
    child.nativeParent = this;
  }

  removeNativeChild(child: RCTShadowView) {
    invariant(
      this.nativeChildren,
      "Cannot remove native child from node which has no native children"
    );
    this.nativeChildren = this.nativeChildren.filter((c) => c !== child);
    child.nativeParent = null;
  }

  purge() {
    this.reactSubviews.forEach((subView) => subView.purge());
    this.yogaNode.free();
  }

  // TODO: Implement ===========================================
  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}

  frameContainsPoint(frame: Frame, point: { x: number, y: number }) {
    return (
      frame.left <= point.x &&
      point.x <= frame.left + frame.width &&
      frame.top <= point.y &&
      point.y <= frame.top + frame.height
    );
  }

  reactTagAtPoint(point: { x: number, y: number }): number {
    for (const shadowView of this.reactSubviews) {
      const prevLayout = shadowView.previousLayout;
      if (prevLayout && this.frameContainsPoint(prevLayout, point)) {
        let relativePoint = { ...point };
        const origin = { x: prevLayout.left, y: prevLayout.top };
        relativePoint.x -= origin.x;
        relativePoint.y -= origin.y;
        return shadowView.reactTagAtPoint(relativePoint);
      }
    }
    return this.reactTag;
  }

  updateNativeChildrenCountInParent(delta: number) {
    if (this.isLayoutOnly) {
      let parent = this.reactSuperview;
      while (parent != null) {
        parent.totalNativeChildren += delta;
        if (!parent.isLayoutOnly) {
          break;
        }
        parent = parent.reactSuperview;
      }
    }
  }

  getNativeOffsetForChild(child: RCTShadowView): number {
    let index = 0;
    let found = false;

    for (let i = 0; i < this.reactSubviews.length; i++) {
      const current = this.reactSubviews[i];
      if (child === current) {
        found = true;
        break;
      }
      index += current.isLayoutOnly ? current.totalNativeChildren : 1;
    }
    if (!found) {
      throw new Error(
        `Child ${child.reactTag} was not a child of ${this.reactTag}`
      );
    }
    return index;
  }
}

// this is SUUUUPER hacky but I'm faily confident that this
// should be run before any shadow views are created/used
(async () => {
  const Yoga: YG.Module = (await require("yoga-dom"): any);

  function propAlias(
    target: typeof RCTShadowView.prototype,
    targetProp: string,
    sourceProp: string
  ) {
    Object.defineProperty(target, targetProp, {
      configurable: true,
      get() {
        return this[sourceProp];
      },
      set(value: any) {
        this[sourceProp] = value;
      }
    });
  }

  function convertToYogaValue(
    input: ?(number | string),
    units: $PropertyType<YG.Constants, "unit">
  ): YG.Value {
    if (typeof input === "number") {
      return { value: input, unit: units.point };
    } else if (input == null) {
      return { value: Yoga.Constants.undefinedValue, unit: units.point };
    }
    if (input === "auto") {
      return { value: Yoga.Constants.undefinedValue, unit: units.auto };
    }
    return {
      value: parseFloat(input),
      unit: input.endsWith("%") ? units.percent : units.point
    };
  }

  function setEnumProp<T: YG.PropEnumMap>(
    yogaNode: YG.Node,
    propName: string,
    enumMap: T,
    value: ?string
  ) {
    if (value == null) {
      yogaNode[propName] = Yoga.Constants.undefinedValue;
    } else {
      const enumValue = enumMap[value];
      if (enumValue != null) {
        yogaNode[propName] = enumValue;
      } else if (__DEV__) {
        console.warn(`No such value '${value}' found for prop '${propName}'`);
      }
    }
  }

  function bindEnumProps(
    instance: typeof RCTShadowView.prototype,
    propDefs: [string, YG.PropEnumMap][]
  ) {
    propDefs.forEach(([propName, enumMap]) => {
      Object.defineProperty(instance, propName, {
        configurable: true,
        get: function() {
          return this.yogaNode[propName];
        },
        set: function(value: string) {
          setEnumProp(this.yogaNode, propName, enumMap, value);
        }
      });
    });
  }

  function bindUnitProps(
    instance: typeof RCTShadowView.prototype,
    propDefs: string[]
  ) {
    propDefs.forEach((propName) => {
      Object.defineProperty(instance, propName, {
        configurable: true,
        get() {
          return this.yogaNode[propName];
        },
        set(value: string | number) {
          this.yogaNode[propName] = convertToYogaValue(
            value,
            Yoga.Constants.unit
          );
        }
      });
    });
  }

  function bindNumberProps(
    instance: typeof RCTShadowView.prototype,
    propDefs: string[]
  ) {
    propDefs.forEach((propName) => {
      Object.defineProperty(instance, propName, {
        configurable: true,
        get: function() {
          return this.yogaNode[propName];
        },
        set: function(value: ?number) {
          if (value == null) value = Yoga.Constants.undefinedValue;
          this.yogaNode[propName] = value;
        }
      });
    });
  }

  const EDGES = [
    "Left",
    "Right",
    "Top",
    "Bottom",
    "Start",
    "End",
    "Horizontal",
    "Vertical"
  ];

  function bindEdgeProps(
    instance: typeof RCTShadowView.prototype,
    propDefs: string[],
    bindingFunc: (
      instance: typeof RCTShadowView.prototype,
      propDefs: string[]
    ) => void
  ) {
    propDefs.forEach((propName) => {
      bindingFunc.call(
        null,
        instance,
        EDGES.map((edge) => `${propName}${edge}`).concat([propName])
      );
    });
  }

  bindEnumProps(RCTShadowView.prototype, [
    ["direction", Yoga.Constants.direction],
    ["flexDirection", Yoga.Constants.flexDirection],
    ["justifyContent", Yoga.Constants.justify],
    ["alignContent", Yoga.Constants.align],
    ["alignItems", Yoga.Constants.align],
    ["alignSelf", Yoga.Constants.align],
    ["position", Yoga.Constants.position],
    ["flexWrap", Yoga.Constants.wrap],
    ["overflow", Yoga.Constants.overflow],
    ["display", Yoga.Constants.display]
  ]);
  bindUnitProps(RCTShadowView.prototype, [
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
    "left",
    "right",
    "top",
    "bottom",
    "start",
    "end",
    "horizontal",
    "vertical",
    "flexBasis"
  ]);
  bindNumberProps(RCTShadowView.prototype, [
    "flex",
    "flexGrow",
    "flexShrink",
    "aspectRatio"
  ]);
  bindEdgeProps(RCTShadowView.prototype, ["margin", "padding"], bindUnitProps);
  bindEdgeProps(RCTShadowView.prototype, ["border"], bindNumberProps);

  [
    "borderTop",
    "borderLeft",
    "borderRight",
    "borderBottom",
    "borderStart",
    "borderEnd"
  ].forEach((propName) => {
    propAlias(RCTShadowView.prototype, propName + "Width", propName);
  });
})();

export default RCTShadowView;
