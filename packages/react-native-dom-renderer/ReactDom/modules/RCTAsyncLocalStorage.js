/** @flow */

import * as idbKeyval from "idb-keyval";
import deepmerge from "deepmerge";

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";

class RCTAsyncLocalStorage extends RCTModule {
  static moduleName = "RCTAsyncLocalStorage";

  $multiGet(keys: string[], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    Promise.all(
      keys.map((key) => {
        return idbKeyval.get(key);
      })
    )
      .then((result) => {
        callback(null, result.map((value, index) => [keys[index], value]));
      })
      .catch((err) => {
        callback(err);
      });
  }

  $multiMerge(kvPairs: [string, any][], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    Promise.all(
      kvPairs.map(([key, prevValue]) => {
        return idbKeyval.get(key).then((nextValue) => {
          if (nextValue == null || typeof nextValue !== "object") {
            return idbKeyval.set(key, prevValue);
          }
          return idbKeyval.set(key, deepmerge(prevValue, nextValue));
        });
      })
    ).then(() => {
      callback();
    });
  }

  $multiSet(kvPairs: [string, any][], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    Promise.all(
      kvPairs.map(([key, value]) => {
        return idbKeyval.set(key, value);
      })
    ).then(() => {
      callback();
    });
  }

  $multiRemove(keys: string[], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    Promise.all(
      keys.map((key) => {
        return idbKeyval.del(key);
      })
    ).then(() => {
      callback();
    });
  }

  async $getAllKeys(callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    try {
      const keys = await idbKeyval.keys();
      callback(null, keys);
    } catch (err) {
      callback(err, null);
    }
  }

  async $clear(callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    try {
      await idbKeyval.clear();
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

export default RCTAsyncLocalStorage;
