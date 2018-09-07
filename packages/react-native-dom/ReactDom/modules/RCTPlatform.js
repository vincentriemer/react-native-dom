/** @flow */

import RCTModule from "RCTModule";

const supportsTouchForceChange = "ontouchforcechange" in window.document;

class RCTPlatformConstants extends RCTModule {
  static moduleName = "RCTPlatformConstants";

  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange,
      reactNativeVersion: {
        major: 0,
        minor: 0,
        patch: 0
      }
    };
  }
}

export default RCTPlatformConstants;
