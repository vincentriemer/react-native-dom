/** @flow */

import invariant from "invariant";

import type RCTBridge from "RCTBridge";

export type Constants = { [const: string]: any };

export type ModuleDescription = [
  string,
  Constants,
  Array<string>,
  Array<number>,
  Array<number>
];

export const UNNAMED_MODULE = "UNNAMED";

export function bridgeModuleNameForClass(cls: Class<RCTModule>): string {
  let name = cls.moduleName;

  invariant(
    name != null && name !== UNNAMED_MODULE,
    `Module "${cls.name}" does not have its static \`moduleName\` property set`
  );

  if (name.startsWith("RK")) {
    name = name.substring(2);
  } else if (name.startsWith("RCT")) {
    name = name.substring(3);
  }

  return name;
}

/**
 * Modules are platform-specific implementations of functionality that can
 * be asynchronously called across the bridge.
 * This class serves as a base for all Modules, and provides the _describe
 * method used to extract attributes and send them to the web worker.
 * This React and runtime handshake can only be done once
 * The type and first character of the name of the attribute is used to
 * determine how the attribute is reflected
 *
 * - '_' denotes a hidden attribute and should not be reflected
 * - '$' is a function which is async in react code, for the runtime the fucntion
 *   take two automatic callback ids, success and reject, one of which must be called
 * - any other functions are added in the functionmap with a corresponding ID used by React code
 * - all other attributes are determined to be constants
 */
export default class RCTModule {
  static moduleName: string = UNNAMED_MODULE;

  functionMap: Array<() => any>;
  bridge: RCTBridge;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
    this.functionMap = [];
  }

  constantsToExport(): Constants {
    return {};
  }

  _describe(): ModuleDescription {
    let name = bridgeModuleNameForClass(this.constructor);

    const functions = [];
    const promiseFunctions = [];
    const syncFunctions = []; // Not currently supported

    const deepProps = (x) =>
      x &&
      // $FlowFixMe
      x !== Object.prototype &&
      Object.getOwnPropertyNames(x).concat(
        deepProps(Object.getPrototypeOf(x)) || []
      );

    let methodID = 0;
    // Record prototype methods
    const proto: any = Object.getPrototypeOf(this);
    const protoMembers: Array<string> = (deepProps(this): any);
    for (const attr of protoMembers) {
      const member = proto[attr];
      // Skip any "private" entries prefixed with an underscore
      if (
        attr[0] === "_" ||
        attr === "constructor" ||
        typeof member !== "function"
      ) {
        continue;
      }
      let name = attr;

      if (name[0] === "$") {
        name = name.substring(1);

        // by default functions are denoted as remote
        // by prepending a $ onto the name the function is denoted as a special,
        // async function that uses Promises
        // the $ is removed from the name before registering with the react code
        if (name[0] === "$") {
          name = name.substring(1);
          promiseFunctions.push(methodID);
        }

        // record the mapping from ID used by React to the real function
        this.functionMap[methodID] = member;
        functions.push(name);
        methodID++;
      }
    }

    // Record exported constants
    const constants = this.constantsToExport();

    return [name, constants, functions, promiseFunctions, syncFunctions];
  }
}

export type NativeModuleImports = Array<
  Promise<Class<RCTModule>> | Class<RCTModule>
>;
