/**
 * @providesModule RCTShadowView
 * @flow
 */

import type { Frame } from "UIView";
import type { RCTComponent } from "RCTComponent";

import YogaNode from "yoga-js";
import invariant from "Invariant";

export const SHADOW_PROPS = [
  "top",
  "right",
  "bottom",
  "left",
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
  "borderWidth",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginVertical",
  "marginHorizontal",
  "margin",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingVertical",
  "paddingHorizontal",
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
  "display"
];

const LAYOUT_PROPS = ["top", "left", "width", "height"];

export type LayoutChange = {
  reactTag: number,
  layout: Frame,
  previousMeasurement: ?Frame,
  nextMeasurement: Frame
};

class RCTShadowView implements RCTComponent {
  _backgroundColor: string;
  _transform: Array<number>;

  viewName: string;

  yogaNode: YogaNode;
  previousLayout: ?Frame;
  isNewView: boolean;
  isHidden: boolean;
  isDirty: boolean = true;

  reactTag: number;
  reactSubviews: Array<RCTShadowView> = [];
  reactSuperview: ?RCTShadowView;

  measurement: ?Frame;

  constructor() {
    this.yogaNode = new YogaNode();

    SHADOW_PROPS.forEach(shadowPropName => {
      Object.defineProperty(this, shadowPropName, {
        configurable: true,
        get: () => this.yogaNode.style[shadowPropName],
        set: value => {
          this.yogaNode.style[shadowPropName] = value;
          this.makeDirty();
          return true;
        }
      });
    });

    this.previousLayout = undefined;
    this.measurement = undefined;
  }

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this._backgroundColor = value;
  }

  getLayoutChanges(previousPosition: {
    top: number,
    left: number
  }): Array<LayoutChange> {
    let layoutChanges = [];

    const newLayout = this.yogaNode.layout;

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

      this.reactSubviews.forEach(subView => {
        layoutChanges = layoutChanges.concat(
          subView.getLayoutChanges(currentPosition)
        );
      });
    } else {
      const shouldUpdateChildren: boolean = (() => {
        let result = false;
        this.reactSubviews.forEach(subView => {
          if (subView.isDirty) {
            result = true;
          }
        });
        return result;
      })();

      if (shouldUpdateChildren) {
        this.reactSubviews.forEach(subView => {
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
    // view.makeDirtyRecursive();
  }

  makeDirtyRecursive(): void {
    this.reactSubviews.forEach(subView => {
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
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
    this.yogaNode.removeChild(subview.yogaNode);
    this.makeDirty();
  }

  purge() {
    this.yogaNode.freeRecursive();
  }

  // TODO: Implement ===========================================
  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point: { x: number, y: number }): number {
    return 0;
  }
}

export default RCTShadowView;
