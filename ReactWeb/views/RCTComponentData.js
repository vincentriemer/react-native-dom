// @flow
import type RCTBridge from "RCTBridge";
import UIManager from "../modules/RCTUIManager";

type Props = { [string]: any };

class ComponentData {
  managerClass: Class<RCTViewManager>;
  name: string;
  manager: RCTViewManager;
  viewConfig: { [string]: any };

  constructor(managerClass: Class<RCTViewManager>, bridge: RCTBridge) {}

  createView(tag: number): UIView {}
  createShadowView(tag: number): RCTShadowView {}

  setPropsForView(props: Props, view: RCTComponent) {}
  setPropsForShadowView(props: Props, shadowView: RCTShadowView) {}
}
