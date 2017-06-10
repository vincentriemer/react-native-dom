/**
 * @providesModule RCTComponent
 * @flow
 */
export interface RCTComponent {
  reactTag: number,

  reactSubviews: Array<$Subtype<RCTComponent>>,
  reactSuperview: $Subtype<RCTComponent>,

  insertReactSubviewAtIndex(
    subview: $Subtype<RCTComponent>,
    index: number
  ): void,
  removeReactSubview(subview: $Subtype<RCTComponent>): void,
  reactTagAtPoint(point: { x: number, y: number }): number,

  didSetProps(changedProps: Array<string>): void,
  didUpdateReactSubviews(): void,
}
