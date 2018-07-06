/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

class RCTSourceCode extends RCTModule {
  static moduleName = "RCTSourceCode";

  constantsToExport() {
    const bundleURL = this.bridge.bundleLocation;
    return {
      scriptURL: bundleURL ? bundleURL : ""
    };
  }
}

export default RCTSourceCode;
