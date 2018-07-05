/** @flow */

export default function CustomElement(name: string) {
  return function<T: Function>(target: T): T {
    customElements.define(name, target);
    return target;
  };
}
