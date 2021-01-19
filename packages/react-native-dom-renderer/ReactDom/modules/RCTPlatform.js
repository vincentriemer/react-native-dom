/** @flow */

/**
 * TODO: Update this file to match 0.62.2 version of react-native
 */

import RCTModule from "RCTModule";

const supportsTouchForceChange = "ontouchforcechange" in window.document;

class RCTPlatformConstants extends RCTModule {
  static moduleName = "RCTPlatformConstants";

  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange,
      interfaceIdiom: "unknown",
      isTesting: Boolean(__DEV__),
      osVersion: "unknown",
      reactNativeVersion: {
        major: 0,
        minor: 62,
        patch: 0,
        prerelease: 0,
      },
      systemName: "unknown",
    }
  }
}

export default RCTPlatformConstants;
