/**
 * @providesModule CustomElement
 * @flow
 */

export default function CustomElement(name: string) {
  return function(target: any) {
    customElements.define(name, target);
  };
}
