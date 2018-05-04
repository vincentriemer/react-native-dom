/**
 * @providesModule RCTModule
 * @flow
 */

import type RCTBridge from "RCTBridge";

export interface RCTModuleClass {
  constructor(bridge: RCTBridge): RCTModule;
  constantsToExport?: () => { [string]: any };
  [propName: string]: any;
}

export type RCTModuleStatics = {
  __moduleName: ?string
};

export type RCTModule = RCTModuleClass & RCTModuleStatics;

export type NativeModuleImports = Array<
  Promise<Class<RCTModule>> | Class<RCTModule>
>;
