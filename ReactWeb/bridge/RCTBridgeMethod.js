export const RCTFunctionTypeNormal = "async";
export const RCTFunctionTypePromise = "promise";
export const RCTFunctionTypeSync = "sync";

export type RCTFunctionType =
  | RCTFunctionTypeNormal
  | RCTFunctionTypePromise
  | RCTFunctionTypePromise;

export interface RCTBridgeMethod {
  jsMethodName: string,
  functionType: RCTFunctionType,
  invokeWithBridge: (
    bridge: RCTBridge,
    module: any,
    arguments: Array<any>
  ) => any,
}
