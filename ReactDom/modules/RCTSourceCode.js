/**
 * @providesModule RCTSourceCode
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";

@RCT_EXPORT_MODULE("RCTSourceCode")
class RCTSourceCode {
  bridge: RCTBridge;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
  }

  constantsToExport() {
    const bundleURL = this.bridge.bundleLocation;
    return {
      scriptURL: bundleURL ? bundleURL : ""
    };
  }
}

export default RCTSourceCode;
