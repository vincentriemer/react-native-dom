/** @flow */

import rtlDetect from "rtl-detect";

import type RCTBridge from "RCTBridge";
import NotificationCenter from "NotificationCenter";
import RCTModule from "RCTModule";

export const DIRECTION_CHANGE_EVENT = "RCTDirectionDidChange";

// TODO: Persist changes in user preferences
class RCTI18nManager extends RCTModule {
  static moduleName = "RCTI18nManager";

  isRTL: boolean;
  doLeftAndRightSwapInRTL: boolean;
  allowRTL: boolean;
  forceRTL: boolean;

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.initialize();
  }

  initialize() {
    const preferredLanguage = navigator.languages
      ? navigator.languages[0]
      : // $FlowFixMe: FlowLib
        navigator.language || navigator.userLanguage;

    this.isRTL = rtlDetect.isRtlLang(preferredLanguage);
    this.doLeftAndRightSwapInRTL = true;
    this.allowRTL = true;
    this.forceRTL = false;
    this.emitChange();
  }

  get direction() {
    return this.resolvedIsRTL ? "rtl" : "ltr";
  }

  get resolvedIsRTL() {
    let isRTL = this.isRTL;

    if (!isRTL && this.forceRTL) {
      isRTL = true;
    }

    if (isRTL && !this.doLeftAndRightSwapInRTL) {
      isRTL = false;
    }

    return isRTL;
  }

  emitChange() {
    NotificationCenter.emitEvent(DIRECTION_CHANGE_EVENT, [
      {
        direction: this.direction
      }
    ]);
  }

  $allowRTL(value: boolean) {
    this.allowRTL = value;
    this.emitChange();
  }

  $forceRTL(value: boolean) {
    this.forceRTL = value;
    this.emitChange();
  }

  $swapLeftAndRightInRTL(value: boolean) {
    this.doLeftAndRightSwapInRTL = value;
    this.emitChange();
  }

  constantsToExport() {
    return {
      isRTL: this.resolvedIsRTL,
      doLeftAndRightSwapInRTL: this.doLeftAndRightSwapInRTL
    };
  }
}

export default RCTI18nManager;
