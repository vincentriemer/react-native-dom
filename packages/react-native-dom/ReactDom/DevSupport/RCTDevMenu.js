/** @flow */

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

class RCTDevMenu extends RCTModule {
  static moduleName = "RCTDevMenu";

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.bridge = bridge;
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  handleKeyPress(event: KeyboardEvent) {
    // toggling the inspector
    if (event.metaKey && event.key === "i") {
      event.preventDefault();
      this.bridge.devSettings.$toggleElementInspector();
    }
  }
}

export default RCTDevMenu;
