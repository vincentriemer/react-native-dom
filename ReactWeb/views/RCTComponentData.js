/**
 * @providesModule RCTComponentData
 * @flow
 */
import invariant from "Invariant";
import RCTBridge, {
  getPropertyNames,
  bridgeModuleNameForClass
} from "RCTBridge";
import RCTUIManager from "RCTUIManager";
import RCTViewManager from "RCTViewManager";
import RCTShadowView, { SHADOW_PROPS } from "RCTShadowView";
import RCTComponent from "RCTComponent";
import UIView from "UIView";
import { normalizeInputEventName } from "RCTEventDispatcher";

import RCTTextInput from "RCTTextInput";

type Props = { [string]: any };

type ViewConfig = {
  propTypes: Props,
  bubblingEvents: Array<string>,
  uiClassViewName: string
};

type RCTPropBlock = (view: typeof RCTComponent, { [string]: any }) => void;
type RCTPropBlockDictionary = { [string]: RCTPropBlock };

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

    this.name = (() => {
      const moduleName = managerClass.__moduleName;

      if (moduleName.endsWith("Manager")) {
        return moduleName.substring(0, moduleName.length - "Manager".length);
      }

      return moduleName;
    })();
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
      uiClassViewName: bridgeModuleNameForClass(this.manager.constructor)
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

  setPropsForView(props: Props, view: typeof RCTComponent) {
    if (props) {
      Object.keys(props).forEach(propName => {
        if (this.propConfig.hasOwnProperty(propName)) {
          const propConfig = this.propConfig[propName];
          const propValue = props[propName];
          const setter = propConfig.setter;

          setter(view, propValue);
        }
      });
    }
  }

  setPropsForShadowView(props: Props, shadowView: RCTShadowView) {
    if (props) {
      Object.keys(props).forEach(propName => {
        if (this.shadowPropConfig.hasOwnProperty(propName)) {
          const propConfig = this.shadowPropConfig[propName];
          const propValue = props[propName];
          const setter = propConfig.setter;

          setter(shadowView, propValue);
        }
      });
    }
  }
}

export default RCTComponentData;
