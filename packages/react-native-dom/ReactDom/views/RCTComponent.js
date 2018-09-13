/** @flow */

export interface RCTComponent {
  reactTag: number;

  reactSubviews: Array<$Subtype<RCTComponent>>;
  reactSuperview: ?$Subtype<RCTComponent>;

  insertReactSubviewAtIndex(
    subview: $Subtype<RCTComponent>,
    index: number
  ): void;

  removeReactSubview(subview: $Subtype<RCTComponent>): void;

  purge(): void;
}
