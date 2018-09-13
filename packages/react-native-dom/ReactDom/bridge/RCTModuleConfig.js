/** @flow */

import type { ModuleDescription, Constants } from "RCTModule";

export function moduleConfigFactory(
  name: string,
  constants: Constants,
  functions: Array<string>,
  promiseMethodIDs: Array<number>,
  syncMethodIDs: Array<number>
): ModuleDescription {
  return [name, constants, functions, promiseMethodIDs, syncMethodIDs];
}
