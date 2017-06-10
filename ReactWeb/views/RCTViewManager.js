/**
 * @providesModule RCTViewManager
 * @flow
 */
import RCTBridge, { RCT_EXPORT_MODULE, RCT_EXPORT_METHOD } from "RCTBridge";

export function RCT_EXPORT_VIEW_PROPERTY(type: string) {
  return (target: any, key: any, descriptor: any) => {
    Object.defineProperty(target, `propConfig_${key}`, {
      ...descriptor,
      value: () => [type],
    });
  };
}

@RCT_EXPORT_MODULE
class RCTViewManager {
  static __moduleName: string;
  static __isViewManager = true;

  @RCT_EXPORT_VIEW_PROPERTY("bool") accessible = false;
}

export default RCTViewManager;
