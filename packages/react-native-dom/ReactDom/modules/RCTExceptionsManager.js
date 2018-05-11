/**
 * @providesModule RCTExceptionsManager
 * @flow
 */

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";

export type StackEntry = {
  file: string,
  methodName: string,
  lineNumber: number,
  column: number
};

@RCT_EXPORT_MODULE("RCTExceptionsManager")
class RCTExceptionsManager {
  bridge: RCTBridge;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  reportSoftException(
    message: string,
    stack: StackEntry[],
    exceptionId: number
  ) {
    this.bridge.redBox.showErrorMessage(message, stack);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  reportFatalException(
    message: string,
    stack: StackEntry[],
    exceptionId: number
  ) {
    this.bridge.redBox.showErrorMessage(message, stack);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  updateExceptionMessage(
    message: string,
    stack: StackEntry[],
    exceptionId: number
  ) {
    this.bridge.redBox.updateError(message, stack);
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  reportUnhandledException(message: string, stack: StackEntry[]) {
    this.reportFatalException(message, stack, -1);
  }
}

export default RCTExceptionsManager;
