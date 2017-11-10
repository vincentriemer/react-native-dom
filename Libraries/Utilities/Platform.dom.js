/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Platform
 * @flow
 */

"use strict";

const NativeModules = require("NativeModules");

const Platform = {
  OS: "dom",
  get ForceTouchAvailable() {
    const constants = NativeModules.PlatformConstants;
    return constants ? !!constants.forceTouchAvailable : false;
  },
  select: (obj: Object) => ("dom" in obj ? obj.dom : obj.default)
};

module.exports = Platform;
