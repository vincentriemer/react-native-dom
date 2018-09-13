declare module "rndom-switch" {
  declare type RNDomSwitchEventListener = { handleEvent: Function } | Function;

  declare class RNDomSwitch extends HTMLElement {
    disabled: boolean;
    value: boolean;
    width: number;
    height: number;
    tintColor: ?string;
    onTintColor: ?string;
    thumbTintColor: ?string;

    addEventListener(
      type: string,
      listener: RNDomSwitchEventListener,
      optionsOrUseCapture?: EventListenerOptionsOrUseCapture
    ): void;
  }

  declare export default typeof RNDomSwitch;
}
