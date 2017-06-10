/**
 * @providesModule RCTShadowView
 * @flow
 */
import type { RCTComponent } from "RCTComponent";
import Yoga from "yoga-layout";

type RCTUpdateLifecycle = "uninitialized" | "computed" | "dirtied";

class RCTShadowView implements RCTComponent {
  _propagationLifecycle: RCTUpdateLifecycle;
  _textLifecycle: RCTUpdateLifecycle;
  _lastParentProperties: { [string]: any };
  _reactSubviews: Array<RCTShadowView>;
  _recomputePadding: boolean;
  _recomputeMargin: boolean;
  _recomputeBorder: boolean;
  _didUpdateSubviews: boolean;

  // yogaNode: typeof YogaNode;
  isNewView: boolean;
  isHidden: boolean;

  reactTag: number;
  reactSubviews: Array<RCTShadowView>;
  reactSuperview: RCTShadowView;

  insertReactSubviewAtIndex(subview: RCTShadowView, index: number) {}
  removeReactSubview(subview: RCTShadowView) {}

  didSetProps(changedProps: Array<string>) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point: { x: number, y: number }): number {
    return 0;
  }
}

export default RCTShadowView;
