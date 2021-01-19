/** @flow */

import RedBox from "rndom-redbox";

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import type { StackEntry } from "RCTExceptionsManager";

function getFileName(path) {
  return path
    .split("\\")
    .pop()
    .split("/")
    .pop();
}

class RCTRedBox extends RCTModule {
  static moduleName = "RCTRedBox";

  domRoot: HTMLElement;
  currentBox: ?RedBox;

  _lastErrorMessage: ?string;
  _lastStackTrace: ?(StackEntry[]);

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.domRoot = document.createElement("div");
    this.domRoot.setAttribute("id", "redbox");

    bridge.parent.appendChild(this.domRoot);
  }

  dismiss = () => {
    while (this.domRoot.firstChild) {
      this.domRoot.removeChild(this.domRoot.firstChild);
    }
  };

  reload = () => {
    window.location.reload(true);
  };

  formatFrameSource(frame: StackEntry) {
    const fileName = (() => {
      if (frame.file) {
        const name = getFileName(frame.file);
        if (name) return name;
      }
      return "<unknown file>";
    })();

    let lineInfo = `${fileName}:${frame.lineNumber}`;
    if (frame.column !== 0) {
      lineInfo += `:${frame.column}`;
    }
    return lineInfo;
  }

  copy = () => {
    let fullStackTrace = "";

    if (this._lastErrorMessage != null) {
      fullStackTrace += this._lastErrorMessage;
      fullStackTrace += "\n\n";
    }

    if (this._lastStackTrace) {
      for (let frame of this._lastStackTrace) {
        fullStackTrace += `${frame.methodName}\n`;
        if (frame.file) {
          fullStackTrace += `    ${this.formatFrameSource(frame)}\n`;
        }
      }
    }

    const bundleURL = new URL(this.bridge.bundleLocation);

    bundleURL.pathname = "/copy-to-clipboard";
    bundleURL.search = "";

    fetch(bundleURL, {
      method: "POST",
      body: fullStackTrace,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  };

  openStackFrame = ({ detail: frame }: any) => {
    const bundleURL = new URL(this.bridge.bundleLocation);

    bundleURL.pathname = "/open-stack-frame";
    bundleURL.search = "";

    fetch(bundleURL, {
      method: "POST",
      body: JSON.stringify(frame),
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  updateError(message: string, stack: StackEntry[]) {
    const currentBox = this.currentBox;

    if (currentBox) {
      currentBox.message = message;
      currentBox.stack = stack;
    }

    this._lastErrorMessage = message;
    this._lastStackTrace = stack;
  }

  showErrorMessage(message: string, stack: StackEntry[]) {
    const redBox: RedBox = new RedBox();
    this.currentBox = redBox;

    redBox.message = message;
    redBox.stack = stack;

    this._lastErrorMessage = message;
    this._lastStackTrace = stack;

    redBox.addEventListener("dismiss", this.dismiss);
    redBox.addEventListener("reload", this.reload);
    redBox.addEventListener("copy", this.copy);
    redBox.addEventListener("stackframe", this.openStackFrame);

    this.domRoot.appendChild(redBox);
  }
}

export default RCTRedBox;
