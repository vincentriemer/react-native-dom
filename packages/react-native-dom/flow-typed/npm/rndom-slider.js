declare module "rndom-slider" {
    declare type RNDomSliderEventListener = { handleEvent: Function } | Function;
  
    declare class RNDomSlider extends HTMLElement {
	  disabled: boolean;
	  value: number;
	  maximumValue: number;
	  minimumValue: number;
      step: number;
      trackImage: mixed;
      minimumTrackImage: mixed;
      maximumTrackImage: mixed;
      minimumTrackTintColor: string;
      maximumTrackTintColor: string;
      thumbImage: mixed;
      thumbTintColor: string;
      width: number;
      height: number;
  
      addEventListener(
        type: string,
        listener: RNDomSliderEventListener,
        optionsOrUseCapture?: EventListenerOptionsOrUseCapture
      ): void;
    }
  
    declare export default typeof RNDomSlider;
  }
  