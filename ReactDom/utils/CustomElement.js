/**
 * @providesModule CustomElement
 * @flow
 */

export default function CustomElement(name: string) {
  return function(target: Function) {
    customElements.define(name, target);
  };
}
