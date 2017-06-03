// @flow

export interface RCTComponent {
  reactTag: number,

  reactSubviews: Array<RCTComponent>,
  reactSuperview: RCTComponent,

  insertReactSubviewAtIndex(subview: RCTComponent, index: number): void,
  removeReactSubview(subview: RCTComponent): void,
  reactTagAtPoint(point: { x: number, y: number }): number,

  didSetProps(changedProps: Array<string>): void,
  didUpdateReactSubviews(): void,
}
