/**
 * @providesModule RCTShadowView
 * @flow
 */

import type { RCTComponent } from "RCTComponent";
import YogaNode from "yoga-js";

type RCTUpdateLifecycle = "uninitialized" | "computed" | "dirtied";

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
  "display",
];

const LAYOUT_PROPS = ["top", "left", "width", "height"];

type Layout = {
  top: ?number,
  left: ?number,
  width: ?number,
  height: ?number,
};

class RCTShadowView implements RCTComponent {
  _propagationLifecycle: RCTUpdateLifecycle;
  _textLifecycle: RCTUpdateLifecycle;
  _lastParentProperties: { [string]: any };
  _reactSubviews: Array<RCTShadowView> = [];
  _recomputePadding: boolean;
  _recomputeMargin: boolean;
  _recomputeBorder: boolean;
  _didUpdateSubviews: boolean;
  _backgroundColor: string;

  viewName: string;
  backgroundColor: string;

  yogaNode: YogaNode;
  previousLayout: Layout;
  isNewView: boolean;
  isHidden: boolean;
  isDirty: boolean = true;

  reactTag: number;
  reactSubviews: Array<RCTShadowView> = [];
  reactSuperview: ?RCTShadowView;

  constructor() {
    this.yogaNode = new YogaNode();

    SHADOW_PROPS.forEach(shadowPropName => {
      Object.defineProperty(this, shadowPropName, {
        configurable: true,
        get: () => this.yogaNode.style[shadowPropName],
        set: value => {
          this.yogaNode.style[shadowPropName] = value;
          this.makeDirty();
        },
      });
    });

    this.previousLayout = {
      top: undefined,
      left: undefined,
      width: undefined,
      height: undefined,
    };
  }

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this._backgroundColor = value;
  }

  getLayoutChanges() {
    let layoutChanges = [];

    this.reactSubviews.forEach(subView => {
      if (subView.isDirty) {
        layoutChanges = layoutChanges.concat(subView.getLayoutChanges());
      }
    });

    LAYOUT_PROPS.forEach(propName => {
      if (this.previousLayout[propName] !== this.yogaNode.layout[propName]) {
        const value = this.yogaNode.layout[propName];
        layoutChanges.push([this.reactTag, propName, value]);
        this.previousLayout[propName] = value;
      }
    });

    this.isDirty = false;
    return layoutChanges;
  }

  makeDirty(): void {
    let view = this;
    while (view) {
      view.isDirty = true;
      view = view.reactSuperview;
    }
  }

  makeDirtyRecursive(): void {
    this.reactSubviews.forEach(subView => subView.makeDirtyRecursive());
    this.isDirty = true;
  }

  insertReactSubviewAtIndex(subview: RCTShadowView, index: number) {
    subview.reactSuperview = this;
    this.reactSubviews.splice(index, 0, subview);
    this.yogaNode.insertChild(subview.yogaNode, index);
    this.makeDirtyRecursive();
  }

  removeReactSubview(subview: RCTShadowView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
    this.yogaNode.removeChild(subview.yogaNode);
    this.makeDirtyRecursive();
  }

  purge() {
    this.yogaNode.freeRecursive();
  }

  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point: { x: number, y: number }): number {
    return 0;
  }
}

export default RCTShadowView;
