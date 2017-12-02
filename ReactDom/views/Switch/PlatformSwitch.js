/**
 * @providesModule PlatformSwitch
 * @flow
 */

import HyperHTMLElement from "hyperhtml-element";

type State = {
  disabled: boolean,
  value: boolean,
  width: number,
  height: number,
  tintColor: string,
  onTintColor: string,
  thumbTintColor: string
};

class PlatformSwitch extends HyperHTMLElement {
  state: State;

  static get observedAttributes() {
    return [
      "disabled",
      "value",
      "width",
      "height",
      "tint-color",
      "on-tint-color",
      "thumb-tint-color"
    ];
  }

  get defaultState(): State {
    return {
      disabled: false,
      value: false,
      width: 51,
      height: 31,
      tintColor: "#aaa",
      onTintColor: "#007bff",
      thumbTintColor: "#fff"
    };
  }

  attributeChangedCallback(name: string, prev: any, curr: any) {
    const objName = name.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());

    if (["disabled", "value"].includes(objName)) {
      curr = curr == "true";
    }
    if (["width", "height"].includes(objName)) {
      curr = parseInt(curr, 10);
    }

    this.setState({ [objName]: curr });
  }

  created() {
    this.attachShadow({ mode: "open" });
    this.disabled = this.disabled || false;
    this.value = this.value || false;
    this.width = this.width || 51;
    this.height = this.height || 31;
    this.tintColor = this.tintColor || "#aaa";
    this.onTintColor = this.onTintColor || "#007bff";
    this.thumbTintColor = this.thumbTintColor || "#fff";
  }

  onclick() {
    this.dispatchEvent(
      new CustomEvent("onchange", { detail: { value: !this.state.value } })
    );
  }

  render() {
    return this.html`
      <style>
        .checkbox {
          display: none;
        }
        .toggle {
          box-sizing: border-box;
          position: relative;
          z-index: 2;
          -webkit-tap-highlight-color: rgba(0,0,0,0);
        }
        .background-on {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
        }
        .background-off {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          transition: opacity 0.1s ease-out;
          will-change: opacity;
        }
        .background-off-inner {
          position: absolute;
          top: 2px; left: 2px; right: 2px; bottom: 2px;
          background-color: #ccc;
          will-change: transform, opacity;
          transition: transform 0.35s, opacity 0.35s;
        }
        .handle {
          position: absolute;
          top: 2px; left: 2px;
          will-change: transform;
          transition: transform 0.35s;
        }
      </style>
      <div 
        class="toggle" 
        onclick=${this}
        style=${{
          width: this.state.width,
          height: this.state.height,
          opacity: this.state.disabled ? 0.5 : 1,
          cursor: this.state.disabled ? "auto" : "pointer",
          pointerEvents: this.state.disabled ? "none" : "auto"
        }}
      >
        <input 
          class="checkbox" 
          type="checkbox" 
          checked=${this.state.value}
        ></input>
        <div 
          class="background-on" 
          style=${{
            borderRadius: this.state.height / 2,
            backgroundColor: this.state.onTintColor
          }}
        ></div>
        <div 
          class="background-off" 
          style=${{
            opacity: this.state.value ? 0 : 1,
            borderRadius: this.state.height / 2,
            backgroundColor: this.state.tintColor
          }}
        ></div>
        <div 
          class="background-off-inner" 
          style=${{
            transform: `scale(${this.state.value ? 0 : 1})`,
            opacity: this.state.value ? 0 : 1,
            borderRadius: (this.state.height - 4) / 2
          }}
        ></div>
        <div 
          class="handle" 
          style=${{
            width: this.state.height - 4,
            height: this.state.height - 4,
            backgroundColor: this.state.thumbTintColor,
            borderRadius: (this.state.height - 4) / 2,
            transform: `translateX(${
              this.state.value
                ? `${this.state.width - this.state.height}px`
                : "0px"
            })`
          }}
        ></div>
      </div>
    `;
  }
}

PlatformSwitch.define("platform-switch");

export default PlatformSwitch;
