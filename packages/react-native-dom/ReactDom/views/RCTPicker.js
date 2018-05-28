/**
 * @providesModule RCTPicker
 * @flow
 */
import RCTView from "RCTView";
import type RCTBridge from "RCTBridge";
import CustomElement from "CustomElement";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

export type PickerItem = { label: string, value: string, textColor: ?number };
export type SelectOnChange = ({ newIndex: number, newValue: ?string }) => void;

@CustomElement("rct-picker")
class RCTPicker extends RCTView {
  _selectElement: HTMLSelectElement;

  _selectedIndex: number;
  _color: string;
  _onChange: ?SelectOnChange;

  constructor(bridge: RCTBridge) {
    super(bridge);

    this._selectElement = document.createElement("select");
    this._selectedIndex = -1;

    // update select element styles
    this._selectElement.style.fontSize = "14px";
    this._selectElement.style.boxSizing = "border-box";
    this._selectElement.style.width = "100%";
    this._selectElement.style.height = "100%";
    this._selectElement.style.background = "none";
    this._selectElement.style.borderStyle = "solid";
    this._selectElement.style.borderWidth = "1px";
    this._selectElement.style.borderColor = "#CCC";
    this._selectElement.style.borderRadius = "0";
    this._selectElement.style.padding = "5px";
    // $FlowFixMe
    this._selectElement.style.webkitAppearance = "none";
    // $FlowFixMe
    this._selectElement.style.mozAppearance = "none";
    // $FlowFixMe
    this._selectElement.style.appearance = "none";

    // Styles for Custom Arrow
    this._selectElement.style.background = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='25' fill='rgba(0, 0, 0, 0.5)'><polygon points='0,0 50,0 25,25'/></svg>") no-repeat`;
    this._selectElement.style.backgroundSize = "10px";
    this._selectElement.style.backgroundPosition =
      "calc(100% - 10px) calc(50%)";
    this._selectElement.style.backgroundRepeat = "no-repeat";

    this.disabled = false;

    // bind select element events
    this._selectElement.addEventListener(
      "change",
      this.handleValueChange,
      false
    );

    // add to dom tree
    this.childContainer.appendChild(this._selectElement);
  }

  set disabled(value: boolean) {
    this._selectElement.disabled = value;
    if (value) {
      this._selectElement.style.opacity = "0.6";
      this._selectElement.style.pointerEvents = "none";
      this._selectElement.style.cursor = "default";
    } else {
      this._selectElement.style.opacity = "1.0";
      this._selectElement.style.pointerEvents = "auto";
      this._selectElement.style.cursor = "pointer";
    }
  }

  set selectedIndex(value: number) {
    this._selectedIndex = value;
    this._selectElement.selectedIndex = value;
  }

  set color(value: string) {
    this._color = value;
  }

  resolveColor(color: ?number) {
    if (color != null) {
      const [a, r, g, b] = ColorArrayFromHexARGB(color);
      return `rgba(${r},${g},${b},${a})`;
    }
    return this._color ? this._color : "#000";
  }

  set items(items: PickerItem[]) {
    // clean up previous item list
    while (this._selectElement.firstChild) {
      this._selectElement.removeChild(this._selectElement.firstChild);
    }

    // construct new option list
    for (let item of items) {
      const optionElem = document.createElement("option");
      optionElem.innerText = item.label;
      optionElem.value = item.value;
      optionElem.style.color =
        this.resolveColor(item.textColor) + " !important";

      this._selectElement.appendChild(optionElem);
    }
  }

  set onChange(value: ?SelectOnChange) {
    this._onChange = value;
  }

  handleValueChange = (event: Event) => {
    event.preventDefault();

    const onChange = this._onChange;
    if (onChange) {
      const payload = {
        newIndex: this._selectElement.selectedIndex,
        newValue: this._selectElement.value
      };
      onChange(payload);
    }
  };
}

export default RCTPicker;
