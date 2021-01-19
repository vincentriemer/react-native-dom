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

const Platform = require('../../Utilities/Platform');
const ReactNativeViewViewConfigAndroid = require('./ReactNativeViewViewConfigAndroid');

const registerGeneratedViewConfig = require('../../Utilities/registerGeneratedViewConfig');
const requireNativeComponent = require('../../ReactNative/requireNativeComponent');

import * as React from 'react';

import codegenNativeCommands from '../../Utilities/codegenNativeCommands';
import type {ViewProps} from './ViewPropTypes';
import type {HostComponent} from '../../Renderer/shims/ReactNativeTypes';

export type ViewNativeComponentType = HostComponent<ViewProps>;

let NativeViewComponent;
let viewConfig:
  | {...}
  | {|
      bubblingEventTypes?: $ReadOnly<{
        [eventName: string]: $ReadOnly<{|
          phasedRegistrationNames: $ReadOnly<{|
            bubbled: string,
            captured: string,
          |}>,
        |}>,
        ...,
      }>,
      directEventTypes?: $ReadOnly<{
        [eventName: string]: $ReadOnly<{|registrationName: string|}>,
        ...,
      }>,
      uiViewClassName: string,
      validAttributes?: {
        [propName: string]:
          | true
          | $ReadOnly<{|
              diff?: <T>(arg1: any, arg2: any) => boolean,
              process?: (arg1: any) => any,
            |}>,
        ...,
      },
    |};
/**
 * TODO: implement viewConfig attributes on native side and eliminate use of viewNativeComponent.dom.js file
 * 
*/
NativeViewComponent = requireNativeComponent('RCTView');

export const __INTERNAL_VIEW_CONFIG = viewConfig;

interface NativeCommands {
  +hotspotUpdate: (
    viewRef: React.ElementRef<HostComponent<mixed>>,
    x: number,
    y: number,
  ) => void;
  +setPressed: (
    viewRef: React.ElementRef<HostComponent<mixed>>,
    pressed: boolean,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['hotspotUpdate', 'setPressed'],
});

export default ((NativeViewComponent: any): ViewNativeComponentType);
