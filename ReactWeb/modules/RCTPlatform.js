/**
 * @providesModule RCTPlatform
 * @flow
 */
import { RCT_EXPORT_MODULE } from "RCTBridge";

const supportsTouchForceChange = "ontouchforcechange" in window.document;

@RCT_EXPORT_MODULE("RCTPlatformConstants")
class RCTPlatformConstants {
  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange,
      reactNativeVersion: {
        major: 0,
        minor: 49,
        patch: 3
      }
    };
  }
}

export default RCTPlatformConstants;
