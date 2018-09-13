/** @flow */

import type { BrowserLocation } from "history/createBrowserHistory";

import type RCTBridge from "RCTBridge";
import type RCTHistory from "RCTHistory";
import RCTEventEmitter from "RCTNativeEventEmitter";

// Taken from https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler
const ALLOWED_PROTOCOLS = [
  "bitcoin:",
  "geo:",
  "im:",
  "irc:",
  "ircs:",
  "magnet:",
  "mailto:",
  "mms:",
  "news:",
  "nntp:",
  "sip:",
  "sms:",
  "smsto:",
  "ssh:",
  "tel:",
  "urn:",
  "webcal:",
  "wtai:",
  "xmpp:"
];

type Location = {
  pathname: string,
  search: string,
  hash: string
};

class RCTLinkingManager extends RCTEventEmitter {
  static moduleName = "RCTLinkingManager";

  static locationToString(protocol: string, loc: Location) {
    return `${protocol}/${loc.pathname}${loc.search}${loc.hash}`;
  }

  history: RCTHistory;
  selfProtocol: string;
  stopListening: ?Function;

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.history = bridge.getModuleByName("History");
    this.selfProtocol = `${bridge.urlScheme}:`;
  }

  supportedEvents() {
    return ["url"];
  }

  startObserving() {
    this.stopListening = this.history.listen(this.handleUrlChange);
  }

  stopObserving() {
    if (this.stopListening) this.stopListening();
  }

  handleUrlChange = (location: BrowserLocation) => {
    this.sendEventWithName("url", {
      url: decodeURIComponent(
        RCTLinkingManager.locationToString(this.selfProtocol, location)
      )
    });
  };

  async $$openURL(url: string) {
    const parsedUrl = new URL(url);

    // If URL uses custom "self" protocol, push the path to history
    if (parsedUrl.protocol === this.selfProtocol) {
      const prevUrl = decodeURIComponent(this.history.currentUrl ?? "");
      const nextUrl = `${parsedUrl.href.substr(
        `${this.selfProtocol}/`.length
      )}`;
      if (nextUrl !== prevUrl) {
        this.history.$push(nextUrl);
      }
    } // Otherwise, if url contains a valid protocol, navigate out of page to new url
    else if (ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      window.location = parsedUrl.toString();
    } else {
      throw new Error(`Cannot open URL: ${parsedUrl.toString()}`);
    }

    return true;
  }

  async $$canOpenURL(url: string) {
    const { protocol } = new URL(url);
    return [this.selfProtocol].concat(ALLOWED_PROTOCOLS).includes(protocol);
  }

  async $$getInitialURL() {
    return RCTLinkingManager.locationToString(this.selfProtocol, location);
  }
}

export default RCTLinkingManager;
