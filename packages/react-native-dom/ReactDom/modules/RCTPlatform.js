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
        minor: 57,
        patch: 0,
        prerelease: "rc.4"
      }
    };
  }
}

export default RCTPlatformConstants;
