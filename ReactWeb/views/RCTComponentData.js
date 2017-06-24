/**
 * @providesModule RCTComponentData
 * @flow
 */
import invariant from "Invariant";
import RCTBridge, {
  getPropertyNames,
  bridgeModuleNameForClass,
} from "RCTBridge";
import RCTUIManager from "RCTUIManager";
import RCTViewManager from "RCTViewManager";
import RCTShadowView from "RCTShadowView";
import RCTComponent from "RCTComponent";
import UIView from "UIView";

type Props = { [string]: any };

type ViewConfig = {
  propTypes: Props,
  uiClassViewName: string,
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
  _shadowPropConfig: ?Array<string>;

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

    this.manager.propConfig().forEach(([propName, type]) => {
      propTypes[propName] = type;
    });

    this.manager.shadowPropConfig().forEach(propName => {
      propTypes[propName] = "";
    });

    return {
      propTypes,
      uiClassViewName: bridgeModuleNameForClass(this.manager.constructor),
    };
  }

  get propConfig(): Object {
    if (this._propConfig == null) {
      const rawPropConfig = this.manager.propConfig();
      this._propConfig = rawPropConfig.reduce(
        (propConfig, raw) => ({
          ...propConfig,
          [raw[0]]: {
            type: raw[1],
            ...(raw.length >= 3 ? { setter: raw[2] } : {}),
          },
        }),
        {}
      );
    }

    return this._propConfig;
  }

  get shadowPropConfig(): Array<string> {
    if (this._shadowPropConfig == null) {
      this._shadowPropConfig = this.manager.shadowPropConfig();
    }
    return this._shadowPropConfig;
  }

  createView(tag: number): UIView {
    const view: UIView = (this.manager.view(): any);
    view.reactTag = tag;
    return view;
  }

  createShadowView(tag: number): RCTShadowView {
    const shadowView = new RCTShadowView();
    shadowView.reactTag = tag;
    return shadowView;
  }

  setPropsForView(props: Props, view: typeof RCTComponent) {
    Object.keys(props).forEach(propName => {
      if (this.propConfig.hasOwnProperty(propName)) {
        const propConfig = this.propConfig[propName];
        const propValue = props[propName];

        if (propConfig.hasOwnProperty("setter")) {
          propConfig.setter(view, propValue);
        } else {
          view[propName] = propValue;
        }
      }
    });
  }

  setPropsForShadowView(props: Props, shadowView: RCTShadowView) {
    Object.keys(props).forEach(propName => {
      if (this.shadowPropConfig.includes(propName)) {
        (shadowView: any)[propName] = props[propName];
      }
    });
  }
}

export default RCTComponentData;
