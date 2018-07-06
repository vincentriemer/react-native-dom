/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

export type StackEntry = {
  file: string,
  methodName: string,
  lineNumber: number,
  column: number
};

class RCTExceptionsManager extends RCTModule {
  static moduleName = "RCTExceptionsManager";

  $reportSoftException(
    message: string,
    stack: StackEntry[],
    exceptionId: number
  ) {
    this.bridge.redBox.showErrorMessage(message, stack);
  }

  $reportFatalException(
    message: string,
    stack: StackEntry[],
    exceptionId: number
  ) {
    this.bridge.redBox.showErrorMessage(message, stack);
  }

  $updateExceptionMessage(
    message: string,
    stack: StackEntry[],
    exceptionId: number
  ) {
    this.bridge.redBox.updateError(message, stack);
  }

  $reportUnhandledException(message: string, stack: StackEntry[]) {
    this.$reportFatalException(message, stack, -1);
  }
}

export default RCTExceptionsManager;
