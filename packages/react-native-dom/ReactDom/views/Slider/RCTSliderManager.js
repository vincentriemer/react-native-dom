/**
 * @providesModule RCTSliderManager
 * @flow
 */

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";
import RCTSlider from "RCTSlider";
import type UIView from "UIView";
import _RCTViewManager from "RCTViewManager";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const { RCT_EXPORT_VIEW_PROP, RCT_EXPORT_DIRECT_VIEW_PROPS } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTSliderManager")
  class RCTSliderManager extends RCTViewManager {
    view(): UIView {
      return new RCTSlider(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("value", "number")
    setValue(view: RCTSlider, value: number) {
      view.value = value;
    }

    @RCT_EXPORT_VIEW_PROP("step", "number")
    setStep(view: RCTSlider, value: number) {
      view.step = value;
    }

    @RCT_EXPORT_VIEW_PROP("trackImage", "UIImage")
    setTrackImage(view: RCTSlider, value: mixed) {
      view.trackImage = value;
    }

    @RCT_EXPORT_VIEW_PROP("minimumTrackImage", "UIImage")
    setMinimumTrackImage(view: RCTSlider, value: mixed) {
      view.minimumTrackImage = value;
    }

    @RCT_EXPORT_VIEW_PROP("maximumTrackImage", "UIImage")
    setMaximumTrackImage(view: RCTSlider, value: mixed) {
      view.maximumTrackImage = value;
    }

    @RCT_EXPORT_VIEW_PROP("minimumValue", "number")
    setMinimumValue(view: RCTSlider, value: number) {
      view.minimumValue = value;
    }

    @RCT_EXPORT_VIEW_PROP("maximumValue", "number")
    setMaximumValue(view: RCTSlider, value: number) {
      view.maximumValue = value;
    }

    @RCT_EXPORT_VIEW_PROP("minimumTrackTintColor", "color")
    setMinimumTrackTintColor(view: RCTSlider, value: string) {
      view.minimumTrackTintColor = value;
    }

    @RCT_EXPORT_VIEW_PROP("maximumTrackTintColor", "color")
    setMaximumTrackTintColor(view: RCTSlider, value: string) {
      view.maximumTrackTintColor = value;
    }

    @RCT_EXPORT_VIEW_PROP("onValueChange", "RCTBubblingEventBlock")
    setOnValueChange(view: RCTSlider, value: Function) {
      view.onValueChange = value;
    }

    @RCT_EXPORT_VIEW_PROP("onSlidingComplete", "RCTBubblingEventBlock")
    setOnSlidingComplete(view: RCTSlider, value: Function) {
      view.onSlidingComplete = value;
    }

    @RCT_EXPORT_VIEW_PROP("thumbImage", "UIImage")
    setThumbImage(view: RCTSlider, value: mixed) {
      view.thumbImage = value;
    }

    @RCT_EXPORT_VIEW_PROP("disabled", "boolean")
    setDisabled(view: RCTSlider, value: boolean) {
      view.disabled = value;
    }

    @RCT_EXPORT_VIEW_PROP("thumbTintColor", "color")
    setThumbTintColor(view: RCTSlider, value: string) {
      view.thumbTintColor = value;
    }
  }

  return RCTSliderManager;
})();
