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

type Props = { [string]: any };

type ViewConfig = {
  propTypes: Props,
  uiClassViewName: string,
};

class RCTComponentData {
  managerClass: Class<RCTViewManager>;
  name: string;
  _manager: ?RCTViewManager;
  viewConfig: { [string]: any };
  bridge: RCTBridge;

  constructor(managerClass: Class<RCTViewManager>, bridge: RCTBridge) {
    this.bridge = bridge;
    this.managerClass = managerClass;

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
    const methodNames = [...new Set(getPropertyNames(this.manager))];
    for (let i = 0; i < methodNames.length; i++) {
      const methodName = methodNames[i];

      if (!methodName.startsWith("propConfig")) {
        continue;
      }

      const underscorePos = methodName.indexOf("_");
      if (underscorePos === -1) {
        continue;
      }

      const name = methodName.substring(underscorePos + 1);
      const type = (this.manager: any)[methodName][0];

      propTypes[name] = type;
    }

    return {
      propTypes,
      uiClassViewName: bridgeModuleNameForClass(this.manager.constructor),
    };
  }

  createView(tag: number): any {}
  createShadowView(tag: number): RCTShadowView {
    return new RCTShadowView();
  }

  setPropsForView(props: Props, view: typeof RCTComponent) {}
  setPropsForShadowView(props: Props, shadowView: RCTShadowView) {}
}

export default RCTComponentData;
