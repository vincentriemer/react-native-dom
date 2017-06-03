// @flow
import { RCT_EXPORT_MODULE } from "RCTBridge";

const supportsTouchForceChange = "ontouchforcechange" in window.document;

@RCT_EXPORT_MODULE class PlatformConstants {
  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange,
    };
  }
}
