// @flow

export type ModuleConfig = [
  string /* name */,
  ?Object /* constants */,
  ?Array<string> /* functions */,
  ?Array<number> /* promise method IDs */,
  ?Array<number> /* sync method IDs */,
];

export function moduleConfigFactory(
  name: string,
  constants: ?Object,
  functions: ?Array<string>,
  promiseMethodIDs: ?Array<number>,
  syncMethodIDs: ?Array<number>
): ModuleConfig {
  return [name, constants, functions, promiseMethodIDs, syncMethodIDs];
}
