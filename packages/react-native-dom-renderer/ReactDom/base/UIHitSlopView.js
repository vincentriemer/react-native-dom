/** @flow */

import prefixInlineStyles from "prefixInlineStyles";
import type UIView from "UIView";

export type HitSlop = {
  top?: number,
  bottom?: number,
  left?: number,
  right?: number
};

class UIHitSlopView extends HTMLElement {
  static defaultHitSlop: HitSlop = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  viewOwner: UIView;

  constructor(viewOwner: UIView, touchable: boolean) {
    super();

    this.viewOwner = viewOwner;
    this.touchable = touchable;

    Object.assign(
      this.style,
      prefixInlineStyles({
        contain: "strict",
        position: "absolute"
      })
    );
  }

  set slop(value: HitSlop) {
    const resolvedValue = Object.entries({
      ...UIHitSlopView.defaultHitSlop,
      ...value
    }).reduce(
      (acc, cur: any) => ({
        ...acc,
        [cur[0]]: `${-1 * cur[1]}px`
      }),
      {}
    );

    Object.assign(this.style, resolvedValue);
  }

  set touchable(value: boolean) {
    this.style.cursor = value ? "pointer" : "auto";
  }
}

customElements.define("ui-hit-slop-view", UIHitSlopView);

export default UIHitSlopView;
