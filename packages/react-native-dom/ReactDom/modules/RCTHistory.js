/** @flow */

import createHistory, {
  type HashHistory,
  type HashLocation
} from "history/createHashHistory";
import queryString from "query-string";

import RCTEventEmitter from "RCTNativeEventEmitter";
import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

class RCTHistory extends RCTEventEmitter {
  static moduleName = "RCTHistory";

  history: HashHistory;
  unlisten: ?Function;

  constructor(bridge: RCTBridge) {
    super(bridge);
    this.history = createHistory({
      basename: bridge.basename,
      hashType: "slash"
    });
  }

  startObserving() {
    this.unlisten = this.history.listen(this.handleHistoryChange);
  }

  stopObserving() {
    this.unlisten && this.unlisten();
  }

  handleHistoryChange = (location: HashHistory) => {
    this.sendEventWithName("history", { location });
  };

  supportedEvents() {
    return ["history"];
  }

  get currentUrl() {
    if (this.history) {
      const { search, pathname, hash } = this.history.location;
      return `${pathname}${search}${hash}`;
    }
  }

  listen(cb: Function) {
    return this.history.listen(cb);
  }

  $push(path: string) {
    this.history.push(path);
  }

  $goBack() {
    this.history.goBack();
  }

  constantsToExport() {
    return {
      initialLocation: this.history.location
    };
  }
}

export default RCTHistory;
