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

import NativePlatformConstantsDOM from './NativePlatformConstantsDOM';

export type PlatformSelectSpec<D, N, I> = {
  default?: D,
  native?: N,
  ios?: I,
  ...
};

const Platform = {
  __constants: null,
  OS: 'dom',
  get Version(): string {
    return this.constants.osVersion;
  },
  get constants(): {|
    forceTouchAvailable: boolean,
    interfaceIdiom: string,
    isTesting: boolean,
    osVersion: string,
    reactNativeVersion: {|
      major: number,
      minor: number,
      patch: number,
      prerelease: ?number,
    |},
    systemName: string,
  |} {
    this.__constants = NativePlatformConstantsDOM.getConstants();
    return this.__constants;
  },
  get isPad(): boolean {
    return this.constants.interfaceIdiom === 'pad';
  },
  /**
   * Deprecated, use `isTV` instead.
   */
  get isTVOS(): boolean {
    return Platform.isTV;
  },
  get isTV(): boolean {
    return this.constants.interfaceIdiom === 'tv';
  },
  get isTesting(): boolean {
    if (__DEV__) {
      return this.constants.isTesting;
    }
    return false;
  },
  select: <D, N, I>(spec: PlatformSelectSpec<D, N, I>): D | N | I =>
    'dom' in spec ? spec.dom : 'native' in spec ? spec.native : spec.default,
};

module.exports = Platform;
