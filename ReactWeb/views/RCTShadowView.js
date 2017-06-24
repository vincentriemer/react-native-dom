/**
 * @providesModule RCTShadowView
 * @flow
 */

import type { RCTComponent } from "RCTComponent";
import YogaNode from "../../node_modules/yoga-js";

type RCTUpdateLifecycle = "uninitialized" | "computed" | "dirtied";

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

  yogaNode: YogaNode = new YogaNode();
  isNewView: boolean;
  isHidden: boolean;

  reactTag: number;
  reactSubviews: Array<RCTShadowView> = [];
  reactSuperview: ?RCTShadowView;

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this._backgroundColor = value;
  }

  insertReactSubviewAtIndex(subview: RCTShadowView, index: number) {
    subview.reactSuperview = this;
    this.reactSubviews[index] = subview;
    this.yogaNode.insertChild(subview.yogaNode, index);
  }

  removeReactSubview(subview: RCTShadowView) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
    this.yogaNode.removeChild(subview.yogaNode);
  }

  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point: { x: number, y: number }): number {
    return 0;
  }

  dirtyPropagation() {
    // TODO: implement
  }
}

export default RCTShadowView;
