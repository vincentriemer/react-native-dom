/**
 * @providesModule RCTSafeAreaView
 * @flow
 */
import RCTSafeAreaViewLocalData from "RCTSafeAreaViewLocalData";
import NotificationCenter from "NotificationCenter";
import RCTView from "RCTView";
import CustomElement from "CustomElement";

import type RCTBridge from "RCTBridge";

const insetView = document.createElement("div");
insetView.id = "safe-area-inset-view";

function getInsetValue(computedStyle, direction) {
  const paddingValue = parseInt(
    computedStyle.getPropertyValue(`padding-${direction}`),
    10
  );
  const marginValue = parseInt(
    computedStyle.getPropertyValue(`margin-${direction}`),
    10
  );
  return Math.max(paddingValue, marginValue);
}

function getCurrentInset() {
  const computedStyle = window.getComputedStyle(insetView);
  return {
    top: getInsetValue(computedStyle, "top"),
    left: getInsetValue(computedStyle, "left"),
    right: getInsetValue(computedStyle, "right"),
    bottom: getInsetValue(computedStyle, "bottom")
  };
}

Object.assign(insetView.style, {
  position: "absolute",
  visibility: "hidden",
  paddingTop: "constant(safe-area-inset-top)",
  paddingLeft: "constant(safe-area-inset-left)",
  paddingRight: "constant(safe-area-inset-right)",
  paddingBottom: "constant(safe-area-inset-bottom)",
  marginTop: "env(safe-area-inset-top)",
  marginLeft: "env(safe-area-inset-left)",
  marginRight: "env(safe-area-inset-right)",
  marginBottom: "env(safe-area-inset-bottom)"
});

let prevInsets = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

if (document.documentElement) {
  document.documentElement.appendChild(insetView);
  prevInsets = getCurrentInset();
  NotificationCenter.addListener("didUpdateDimensions", () => {
    const nextInsets = getCurrentInset();
    if (JSON.stringify(prevInsets) !== JSON.stringify(nextInsets)) {
      prevInsets = nextInsets;
      NotificationCenter.emitEvent("safeAreaInsetsDidChange", nextInsets);
    }
  });
}

@CustomElement("rct-safe-area-view")
class RCTSafeAreaView extends RCTView {
  constructor(bridge: RCTBridge) {
    super(bridge);
    NotificationCenter.addListener(
      "safeAreaInsetsDidChange",
      this.safeAreaInsetsDidChange
    );
  }

  connectedCallback() {
    this.safeAreaInsetsDidChange();
  }

  safeAreaInsetsDidChange = () => {
    const localData = new RCTSafeAreaViewLocalData(prevInsets);
    this.bridge.uiManager.setLocalDataForView(localData, this);
  };
}

export default RCTSafeAreaView;
