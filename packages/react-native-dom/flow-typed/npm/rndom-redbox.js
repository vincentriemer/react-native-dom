declare module "rndom-redbox" {
  declare type RNDomRedboxEventListener = { handleEvent: Function } | Function;

  declare class Redbox extends HTMLElement {
    message: string;
    stack: any[];

    addEventListener(
      type: string,
      listener: RNDomRedboxEventListener,
      optionsOrUseCapture?: EventListenerOptionsOrUseCapture
    ): void;
  }

  declare export default typeof Redbox;
}
