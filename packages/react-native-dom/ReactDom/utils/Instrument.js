/**
 * @providesModule Instrument
 * @flow
 */

import CanUse from "CanUse";

export default function instrument<T>(
  name: string,
  instrumentedFunction: () => T
): T {
  if (__DEV__ && CanUse.performanceMeasure) {
    const startName = `${name} start`;
    const endName = `${name} end`;
    window.performance.mark(startName);
    const result = instrumentedFunction();
    window.performance.mark(endName);
    window.performance.measure(name, startName, endName);
    return result;
  }
  return instrumentedFunction();
}
