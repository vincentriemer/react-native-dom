/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import RCTAnimatedNode from "RCTAnimatedNode";

export interface RCTValueAnimatedNodeObserver {
  animatedNodeDidUpdateValue(node: RCTValueAnimatedNode, value: number): void;
}

class RCTValueAnimatedNode extends RCTAnimatedNode {
  _offset: number;
  _value: number;

  valueObserver: ?RCTValueAnimatedNodeObserver;

  constructor(tag: number, config: Config) {
    super(tag, config);
    this._offset = this.config.offset || 0;
    this._value = this.config.value;
  }

  flattenOffset() {
    this._value += this._offset;
    this._offset = 0;
  }

  extractOffset() {
    this._offset += this._value;
    this._value = 0;
  }

  get offset(): number {
    return this._offset;
  }

  set offset(value: number) {
    this._offset = value;
  }

  get value(): number {
    return this._value + this._offset;
  }

  set value(value: number) {
    this._value = value;

    if (this.valueObserver) {
      this.valueObserver.animatedNodeDidUpdateValue(this, this._value);
    }
  }
}

export default RCTValueAnimatedNode;
