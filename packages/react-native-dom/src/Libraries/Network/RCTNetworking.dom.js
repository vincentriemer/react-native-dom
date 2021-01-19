/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const NativeEventEmitter = require('../EventEmitter/NativeEventEmitter');

const convertRequestBody = require('./convertRequestBody');

import NativeNetworkingDOM from './NativeNetworkingDOM';
import type {NativeResponseType} from './XMLHttpRequest';
import type {RequestBody} from './convertRequestBody';

class RCTNetworking extends NativeEventEmitter {
  constructor() {
    super(NativeNetworkingDOM);
  }

  sendRequest(
    method: string,
    trackingName: string,
    url: string,
    headers: Object,
    data: RequestBody,
    responseType: NativeResponseType,
    incrementalUpdates: boolean,
    timeout: number,
    callback: (requestId: number) => void,
    withCredentials: boolean,
  ) {
    const body = convertRequestBody(data);
    NativeNetworkingDOM.sendRequest(
      {
        method,
        url,
        data: {...body, trackingName},
        headers,
        responseType,
        incrementalUpdates,
        timeout,
        withCredentials: false,
      },
      callback,
    );
  }

  abortRequest(requestId: number) {
    NativeNetworkingDOM.abortRequest(requestId);
  }

  clearCookies(callback: (result: boolean) => void) {
    NativeNetworkingDOM.clearCookies(callback);
  }
}

module.exports = (new RCTNetworking(): RCTNetworking);
