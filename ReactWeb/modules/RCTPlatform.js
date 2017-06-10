/**
 * @providesModule RCTPlatform
 * @flow
 */
import { RCT_EXPORT_MODULE } from "RCTBridge";

const supportsTouchForceChange = "ontouchforcechange" in window.document;

@RCT_EXPORT_MODULE
class RCTPlatformConstants {
  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange,
    };
  }
}

export default RCTPlatformConstants;
