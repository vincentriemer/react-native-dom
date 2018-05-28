/**
 * @providesModule RCTAsyncLocalStorage
 * @flow
 */

import idbKeyval from "idb-keyval";
import deepmerge from "deepmerge";

import RCTBridge, {
  RCTFunctionTypeNormal,
  RCT_EXPORT_METHOD,
  RCT_EXPORT_MODULE
} from "RCTBridge";

@RCT_EXPORT_MODULE("RCTAsyncLocalStorage")
class RCTAsyncLocalStorage {
  bridge: RCTBridge;

  constructor(bridge: RCTBridge) {
    this.bridge = bridge;
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  multiGet(keys: string[], callbackId: number) {
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

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  multiMerge(kvPairs: [string, any][], callbackId: number) {
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

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  multiSet(kvPairs: [string, any][], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);

    Promise.all(
      kvPairs.map(([key, value]) => {
        return idbKeyval.set(key, value);
      })
    ).then(() => {
      callback();
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  multiRemove(keys: string[], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);

    Promise.all(
      keys.map((key) => {
        return idbKeyval.delete(key);
      })
    ).then(() => {
      callback();
    });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  async getAllKeys(callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);
    try {
      const keys = await idbKeyval.keys();
      callback(null, keys);
    } catch (err) {
      callback(err, null);
    }
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  async clear(callbackId: number) {
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
