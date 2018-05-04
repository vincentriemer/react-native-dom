/**
 * @providesModule RCTDevMenu
 * @flow
 */

import RCTBridge, { RCT_EXPORT_MODULE } from "RCTBridge";

@RCT_EXPORT_MODULE("RCTDevMenu")
class RCTDevMenu {
  bridge: RCTBridge;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  handleKeyPress(event: KeyboardEvent) {
    // toggling the inspector
    if (event.metaKey && event.key === "i") {
      event.preventDefault();
      this.bridge.devSettings.toggleElementInspector();
    }
  }
}

export default RCTDevMenu;
