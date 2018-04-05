/**
 * @providesModule RCTPlatform
 * @flow
 */
import { RCT_EXPORT_MODULE } from "../bridge/RCTBridge";

const supportsTouchForceChange = "ontouchforcechange" in window.document;

@RCT_EXPORT_MODULE("RCTPlatformConstants")
class RCTPlatformConstants {
  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange,
      reactNativeVersion: {
        major: 0,
        minor: 54,
        patch: 0
      }
    };
  }
}

export default RCTPlatformConstants;
