/**
 * @providesModule RCTComponentData
 * @flow
 */

import invariant from "invariant";

import RCTBridge, {
  bridgeModuleNameForClass,
  getPropertyNames
} from "RCTBridge";
import RCTUIManager from "RCTUIManager";
import type { RCTComponent } from "RCTComponent";
import UIView from "UIView";
import { normalizeInputEventName } from "RCTEventDispatcher";
import RCTText from "RCTText";
import RCTRawText from "RCTRawText";
import type RCTView from "RCTView";
import RCTTextInput from "RCTTextInput";
import typeof _RCTShadowView from "RCTShadowView";
import typeof _RCTViewManager from "RCTViewManager";

type RCTViewManager = $Call<$await<_RCTViewManager>>;
type RCTShadowView = $Call<$await<_RCTShadowView>>;

type Props = { [string]: any };

type ViewConfig = {
  propTypes: Props,
  bubblingEvents: Array<string>,
  directEvents: Array<string>,
  baseModuleName: ?string
  // uiClassViewName: string
};

type RCTPropBlock = (view: RCTComponent, { [string]: any }) => void;
type RCTPropBlockDictionary = { [string]: RCTPropBlock };

function moduleNameForClass(cls: Class<RCTViewManager>) {
  let name = cls.__moduleName;
  if (name != null) {
    if (name.startsWith("RK")) {
      name = `RCT${name.substring(2)}`;
    }
    if (name.endsWith("Manager")) {
      name = name.substring(0, name.length - "Manager".length);
    }
    return name;
  }
  return "";
}

class RCTComponentData {
  managerClass: Class<RCTViewManager>;
  name: string;
  _manager: ?RCTViewManager;
  viewConfig: { [string]: any };
  bridge: RCTBridge;
  _propConfig: ?Object;
  _shadowPropConfig: ?Object;

  viewPropBlocks: RCTPropBlockDictionary;
  shadowPropBlocks: RCTPropBlockDictionary;

  constructor(managerClass: Class<RCTViewManager>, bridge: RCTBridge) {
    this.bridge = bridge;
    this.managerClass = managerClass;
    this.viewPropBlocks = {};
    this.shadowPropBlocks = {};
    this.name = moduleNameForClass(managerClass);
  }

  get manager(): RCTViewManager {
    if (this._manager == null) {
      this._manager = (this.bridge.moduleForClass(this.managerClass): any);
    }
    invariant(this._manager, "RCTComponentData's view manager must be set");
    return this._manager;
  }

  get viewConfig(): ViewConfig {
    const count = 0;
    const propTypes = {};
    const bubblingEvents = [];
    const directEvents = [];

    if (this.manager.customBubblingEventTypes) {
      const events = this.manager.customBubblingEventTypes();
      for (let event of events) {
        bubblingEvents.push(normalizeInputEventName(event));
      }
    }

    this.manager.__props.forEach(({ name, type, exported }) => {
      if (exported) {
        if (type === "RCTBubblingEventBlock") {
          bubblingEvents.push(normalizeInputEventName(name));
          propTypes[name] = "BOOL";
        } else if (type === "RCTDirectEventBlock") {
          directEvents.push(normalizeInputEventName(name));
          propTypes[name] = "BOOL";
        } else {
          propTypes[name] = type;
        }
      }
    });

    return {
      propTypes,
      bubblingEvents,
      directEvents,
      baseModuleName: null
    };
  }

  generatePropConfig(
    rawPropConfig: Array<any>
  ): { [string]: { type: string, setter: Function } } {
    return rawPropConfig.reduce(
      (propConfig, raw) => ({
        ...propConfig,
        [raw.name]: {
          type: raw.type,
          setter: raw.setter
            ? raw.setter
            : (view, value) => {
                view[raw.name] = value;
              }
        }
      }),
      {}
    );
  }

  get propConfig(): { [string]: { type: string, setter: Function } } {
    if (this._propConfig == null) {
      this._propConfig = this.generatePropConfig(this.manager.__props);
    }

    return this._propConfig;
  }

  get shadowPropConfig(): { [string]: { type: string, setter: Function } } {
    if (this._shadowPropConfig == null) {
      this._shadowPropConfig = this.generatePropConfig(
        this.manager.__shadowProps
      );
    }

    return this._shadowPropConfig;
  }

  createView(tag: number): UIView {
    const view: UIView = (this.manager.view(): any);
    view.reactTag = tag;
    return view;
  }

  createShadowView(tag: number): RCTShadowView {
    const shadowView: RCTShadowView = this.manager.shadowView();
    shadowView.reactTag = tag;
    return shadowView;
  }

  setPropsForView(props: Props, view: RCTComponent) {
    if (props) {
      for (let propName in props) {
        if (this.propConfig.hasOwnProperty(propName)) {
          const propConfig = this.propConfig[propName];
          const propValue = props[propName];
          const setter = propConfig.setter;

          setter(view, propValue);
        }
      }
    }
  }

  setPropsForShadowView(props: Props, shadowView: RCTShadowView) {
    if (props) {
      for (let propName in props) {
        if (this.shadowPropConfig.hasOwnProperty(propName)) {
          const propConfig = this.shadowPropConfig[propName];
          if (propConfig == null) console.log(propName);
          const propValue = props[propName];
          const setter = propConfig.setter;

          setter(shadowView, propValue);
        }
      }
    }
  }
}

export default RCTComponentData;
