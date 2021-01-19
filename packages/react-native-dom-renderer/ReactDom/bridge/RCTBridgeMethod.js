/** @flow */
import type RCTBridge from "RCTBridge";

export const RCTFunctionTypeNormal = "async";
export const RCTFunctionTypePromise = "promise";
export const RCTFunctionTypeSync = "sync";

export type RCTFunctionType = string;

export interface RCTBridgeMethod {
  jsMethodName: string;
  functionType: RCTFunctionType;
  invokeWithBridge: (
    bridge: RCTBridge,
    module: any,
    arguments: Array<any>
  ) => any;
}
