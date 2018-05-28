/**
 * @providesModule RCTPickerManager
 * @flow
 */

import type UIView from "UIView";
import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";
import _RCTViewManager from "RCTViewManager";
import RCTPicker from "RCTPicker";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";
import type { PickerItem, SelectOnChange } from "RCTPicker";

module.exports = (async () => {
  const RCTViewManager = await _RCTViewManager;
  const { RCT_EXPORT_VIEW_PROP } = RCTViewManager;

  @RCT_EXPORT_MODULE("RCTPickerManager")
  class RCTPickerManager extends RCTViewManager {
    view(): UIView {
      return new RCTPicker(this.bridge);
    }

    @RCT_EXPORT_VIEW_PROP("color", "color")
    setColor(view: RCTPicker, value: ?number) {
      if (value) {
        const [a, r, g, b] = ColorArrayFromHexARGB(value);
        const stringValue = `rgba(${r},${g},${b},${a})`;
        view.color = stringValue;
      } else {
        view.color = "#000";
      }
    }

    @RCT_EXPORT_VIEW_PROP("selectedIndex", "number")
    setSelectedIndex(view: RCTPicker, value: ?number) {
      view.selectedIndex = value != null ? value : -1;
    }

    @RCT_EXPORT_VIEW_PROP("items", "array")
    setItems(view: RCTPicker, value: ?(PickerItem[])) {
      view.items = value ? value : [];
    }

    @RCT_EXPORT_VIEW_PROP("enabled", "bool")
    setDisabled(view: RCTPicker, value: boolean = true) {
      view.disabled = !value;
    }

    @RCT_EXPORT_VIEW_PROP("onChange", "RCTBubblingEventBlock")
    setOnChange(view: RCTPicker, value: ?SelectOnChange) {
      view.onChange = value;
    }
  }

  return RCTPickerManager;
})();
