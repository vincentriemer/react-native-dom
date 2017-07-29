/**
 * @providesModule RCTAsyncLocalStorage
 * @flow
 */

import RCTBridge, {
  RCT_EXPORT_MODULE,
  RCT_EXPORT_METHOD,
  RCTFunctionTypeNormal
} from "RCTBridge";
import localforage from "localforage";
import deepmerge from "deepmerge";

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
      keys.map(key => {
        return localforage.getItem(key);
      })
    )
      .then(result => {
        callback(
          null,
          result.reduce((prev, currentValue, index) => ({
            ...prev,
            [keys[index]]: currentValue
          }))
        );
      })
      .catch(err => {
        callback(err);
      });
  }

  @RCT_EXPORT_METHOD(RCTFunctionTypeNormal)
  multiMerge(kvPairs: [string, any][], callbackId: number) {
    const callback = this.bridge.callbackFromId(callbackId);

    Promise.all(
      kvPairs.map(([key, prevValue]) => {
        return localforage.getItem(key).then(nextValue => {
          if (nextValue == null || typeof nextValue !== "object") {
            return localforage.setItem(key, prevValue);
          } else {
            return localforage.setItem(key, deepmerge(prevValue, nextValue));
          }
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
        return localforage.setItem(key, value);
      })
    ).then(() => {
      callback();
    });
  }
}

export default RCTAsyncLocalStorage;
