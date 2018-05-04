/**
 * @providesModule RedBoxView
 * @flow
 */

import HyperHTMLElement from "hyperhtml-element/esm";
const { wire } = HyperHTMLElement;

import type { StackEntry } from "RCTExceptionsManager";

type State = {
  message: string,
  stack: StackEntry[]
};

class RedBoxView extends HyperHTMLElement {
  state: State;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  get defaultState(): State {
    return {
      message: "",
      stack: []
    };
  }

  set message(message: string) {
    this.setState({ message });
  }

  set stack(stack: StackEntry[]) {
    this.setState({ stack });
  }

  onDismiss = () => {
    this.dispatchEvent(new Event("dismiss"));
  };

  onReload = () => {
    this.dispatchEvent(new Event("reload"));
  };

  onCopy = () => {
    this.dispatchEvent(new Event("copy"));
  };

  onStackFrame = (frame: StackEntry) => {
    this.dispatchEvent(new CustomEvent("stackframe", { detail: frame }));
  };

  render() {
    return this.html`
      <style>
        :host {
          display: contents;
        }
        .redbox {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
          position: fixed;
          top: 0px;
          left: 0px;
          right: 0px;
          bottom: 0px;
          background: rgb(204, 0, 0);
          color: white;
          z-index: 2147483647;
          text-align: left;
          font-size: 16px;
          line-height: 1.2;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          overflow: hidden;
        }
        .error {
          padding-top: 20px;
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 10px;
          overflow: auto;
          flex: 1;
        }
        .message {
          margin-top: 10px;
          font-size: 1.2em;
          white-space: pre-wrap;
        }
        .stack {
          flex: 1;
          margin-top: 2em;
          display: flex;
          flex-direction: column;
        }
        .frame {
          cursor: pointer;
          font-family: monospace;
          display: block;
          font-size: 1em;
          color: white;
          text-align: left;
          padding-top: 1em;
          padding-bottom: 1em;
          background: none;
          border: none;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .frame:active {
          opacity: 0.4;
        }
        .file {
          font-size: 0.8em;
          color: rgba(255, 255, 255, 0.7);
          word-break: break-all;
        }
        .buttons {
          height: 60px;
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }
        .button {
          cursor: pointer;
          font-size: 1em;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          flex: 1;
        }
        .button:active {
          color: rgba(255, 255, 255, 1.0);
        }
      </style>
      <div class="redbox">
        <div class="error">
          <div class="message">${this.state.message}</div>
          <div class="stack">
            ${this.state.stack.map(
              (entry) => wire()`
                <button onclick=${() => this.onStackFrame(entry)} class="frame">
                  <div>${{ text: entry.methodName }}</div>
                  <div class="file">
                    ${entry.file}:${entry.lineNumber}:${entry.column}
                  </div>
                </button>
            `
            )}
          </div>
        </div>
        <div class="buttons">
          <button onclick=${this.onDismiss} class="button">Dismiss</button>
          <button onclick=${this.onReload} class="button">Reload JS</button>
          <button onclick=${this.onCopy} class="button">Copy</button>
        </div>
      </div>
    `;
  }
}

RedBoxView.define("rct-redbox");

export default RedBoxView;
