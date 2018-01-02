/**
 * @providesModule RCTShadowView
 * @flow
 */

import * as YG from "yoga-dom";
import invariant from "Invariant";

import type { RCTComponent } from "RCTComponent";

const LAYOUT_PROPS = ["top", "left", "width", "height"];

export type LayoutChange = {
  reactTag: number,
  layout: Frame,
  previousMeasurement: ?Frame,
  nextMeasurement: Frame
};

function convertToYogaValue(
  input: number | string,
  units: $PropertyType<YG.Constants, "unit">
): YG.Value {
  if (typeof input === "number") {
    return { value: input, unit: units.point };
  } else {
    if (input === "auto") {
      return { value: NaN, unit: units.auto };
    } else {
      return {
        value: parseFloat(input),
        unit: input.endsWith("%") ? units.percent : units.point
      };
    }
  }
}

function setEnumProp<T: YG.PropEnumMap>(
  yogaNode: YG.Node,
  propName: string,
  enumMap: T,
  value: string
) {
  const enumValue = enumMap[value];
  if (enumValue != null) {
    yogaNode[propName] = enumValue;
  } else if (__DEV__) {
    console.warn(`No such value '${value}' found for prop '${propName}'`);
  }
}

function bindEnumProps(
  instance: RCTShadowView,
  propDefs: [string, YG.PropEnumMap][]
) {
  propDefs.forEach(([propName, enumMap]) => {
    Object.defineProperty(instance, propName, {
      configurable: true,
      get() {
        return instance.yogaNode[propName];
      },
      set(value: string) {
        setEnumProp(instance.yogaNode, propName, enumMap, value);
        instance.makeDirty();
        return true;
      }
    });
  });
}

function bindUnitProps(instance: RCTShadowView, propDefs: string[]) {
  propDefs.forEach((propName) => {
    Object.defineProperty(instance, propName, {
      configurable: true,
      get() {
        return instance.yogaNode[propName];
      },
      set(value: string | number) {
        instance.yogaNode[propName] = convertToYogaValue(
          value,
          instance.yogaContants.unit
        );
        instance.makeDirty();
        return true;
      }
    });
  });
}

function bindNumberProps(instance: RCTShadowView, propDefs: string[]) {
  propDefs.forEach((propName) => {
    Object.defineProperty(instance, propName, {
      configurable: true,
      get() {
        return instance.yogaNode[propName];
      },
      set(value: number) {
        instance.yogaNode[propName] = value;
        instance.makeDirty();
        return true;
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
  instance: RCTShadowView,
  propDefs: string[],
  bindingFunc: (instance: RCTShadowView, propDefs: string[]) => void
) {
  propDefs.forEach((propName) => {
    bindingFunc.call(
      null,
      instance,
      EDGES.map((edge) => `${propName}${edge}`).concat([propName])
    );
  });
}

class RCTShadowView implements RCTComponent {
  _backgroundColor: string;
  _transform: Array<number>;

  viewName: string;

  yogaContants: YG.Constants;
  yogaNode: YG.Node;
  previousLayout: ?Frame;
  isNewView: boolean;
  isHidden: boolean;
  isDirty: boolean = true;

  reactTag: number;
  reactSubviews: Array<RCTShadowView> = [];
  reactSuperview: ?RCTShadowView;

  measurement: ?Frame;

  constructor({ Node, Constants }: YG.Module) {
    this.yogaContants = Constants;
    this.yogaNode = new Node();

    bindEnumProps(this, [
      ["direction", Constants.direction],
      ["flexDirection", Constants.flexDirection],
      ["justifyContent", Constants.justify],
      ["alignContent", Constants.align],
      ["alignItems", Constants.align],
      ["alignSelf", Constants.align],
      ["position", Constants.position],
      ["flexWrap", Constants.wrap],
      ["overflow", Constants.overflow],
      ["display", Constants.display]
    ]);
    bindUnitProps(this, [
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
      "vertical"
    ]);
    bindNumberProps(this, ["flex", "flexGrow", "flexShrink", "aspectRatio"]);
    bindEdgeProps(this, ["margin", "padding"], bindUnitProps);
    bindEdgeProps(this, ["border"], bindNumberProps);

    this.previousLayout = undefined;
    this.measurement = undefined;
  }

  set localData(value: any) {}

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

      this.previousLayout = newLayout;

      this.reactSubviews.forEach((subView) => {
        layoutChanges = layoutChanges.concat(
          subView.getLayoutChanges(currentPosition)
        );
      });
    } else {
      const shouldUpdateChildren: boolean = (() => {
        let result = false;
        this.reactSubviews.forEach((subView) => {
          if (subView.isDirty) {
            result = true;
          }
        });
        return result;
      })();

      if (shouldUpdateChildren) {
        this.reactSubviews.forEach((subView) => {
          layoutChanges = layoutChanges.concat(
            subView.getLayoutChanges(currentPosition)
          );
        });
      }
    }

    this.measurement = { ...nextMeasurement };
    this.isDirty = false;
    return layoutChanges;
  }

  makeDirty(): void {
    this.isDirty = true;

    let view = this;
    while (view.reactSuperview) {
      view = view.reactSuperview;
      view.isDirty = true;
    }
  }

  makeDirtyRecursive(): void {
    this.reactSubviews.forEach((subView) => {
      subView.makeDirtyRecursive();
    });
    this.isDirty = true;
  }

  insertReactSubviewAtIndex(subview: RCTShadowView, index: number) {
    subview.reactSuperview = this;
    this.reactSubviews.splice(index, 0, subview);
    this.yogaNode.insertChild(subview.yogaNode, index);
    this.makeDirty();
  }

  removeReactSubview(subview: RCTShadowView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter((s) => s !== subview);
    this.yogaNode.removeChild(subview.yogaNode);
    this.makeDirty();
  }

  purge() {
    this.reactSubviews.forEach((subView) => subView.purge());
    this.yogaNode.free();
  }

  // TODO: Implement ===========================================
  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point: { x: number, y: number }): number {
    return 0;
  }
}

export default RCTShadowView;
