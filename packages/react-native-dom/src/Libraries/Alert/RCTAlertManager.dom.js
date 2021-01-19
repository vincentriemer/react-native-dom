/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import NativeAlertManager from './NativeAlertManager';
import type {Args} from './NativeAlertManager';

module.exports = {
  alertWithArgs(
    args: Args,
    callback: (id: number, value: string) => void,
  ): void {
    if (NativeAlertManager == null) {
      return;
    }
    NativeAlertManager.alertWithArgs(args, callback);
  },
};
