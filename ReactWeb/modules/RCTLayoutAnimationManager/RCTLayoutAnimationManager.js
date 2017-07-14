/**
 * @providesModule RCTLayoutAnimationManager
 * @flow
 */
import type { Frame } from "UIView";
import type { LayoutChange } from "RCTShadowView";
import type RCTUIManager from "RCTUIManager";
import type { KeyframeResult } from "RCTKeyframeGenerator";

import {
  scale,
  rotate,
  translate,
  transform,
  applyToPoint,
  inverse,
  identity,
  toCSS
} from "transformation-matrix";

import invariant from "Invariant";
import RCTKeyframeGenerator from "RCTKeyframeGenerator";

const PropertiesEnum = {
  opacity: true,
  scaleXY: true
};

const TypesEnum = {
  spring: true,
  linear: true,
  easeInEaseOut: true,
  easeIn: true,
  easeOut: true
};

export type LayoutAnim = {
  duration?: number,
  delay?: number,
  springDamping?: number,
  initialVelocity?: number,
  type?: $Enum<typeof TypesEnum>,
  property?: $Enum<typeof PropertiesEnum>
};

export type LayoutAnimationConfig = {
  duration: number,
  create: LayoutAnim,
  update: LayoutAnim,
  delete: LayoutAnim
};

export type PendingLayoutAnimation = {
  config: LayoutAnimationConfig,
  callback: Function,
  addedNodes: { [reactTag: number]: Frame },
  updatedNodes: { [reactTag: number]: Frame },
  removedNodes: number[]
};

type AttributeMap = {
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  opacity?: number
};

type Matrix = any[];
type MatrixKeyframes = Matrix[];
type OpacityKeyframes = number[];

type KeyframeConfig = {
  create: KeyframeResult,
  update: KeyframeResult,
  delete: KeyframeResult
};

type AnimationConfig = {
  viewTransform?: Matrix,
  parentTransform?: MatrixKeyframes,
  layoutTransfrom?: MatrixKeyframes,
  layoutDuration?: number,
  opacity?: OpacityKeyframes,
  opacityDuration?: number,
  purge: boolean
};

type AnimationConfigRegistry = { [reactTag: number]: AnimationConfig };

class RCTLayoutAnimationManager {
  manager: RCTUIManager;

  pendingConfig: ?LayoutAnimationConfig;
  pendingCallback: ?Function;
  removedNodes: number[];
  layoutChanges: LayoutChange[];

  constructor(manager: RCTUIManager) {
    this.manager = manager;
    this.reset();
  }

  configureNext(config: LayoutAnimationConfig, callback: Function) {
    this.pendingConfig = config;
    this.pendingCallback = callback;
  }

  reset() {
    this.removedNodes = [];
    this.layoutChanges = [];
    this.pendingConfig = undefined;
    this.pendingCallback = undefined;
  }

  isPending(): boolean {
    return this.pendingConfig != null;
  }

  addLayoutChanges(changes: LayoutChange[]) {
    this.layoutChanges = this.layoutChanges.concat(changes);
  }

  queueRemovedNode(tag: number) {
    this.removedNodes.push(tag);
  }

  constructKeyframes(config: LayoutAnimationConfig) {
    const { create, update, delete: del, duration } = config;

    const keyframes = {
      create: RCTKeyframeGenerator(create, duration),
      update: RCTKeyframeGenerator(update, duration),
      delete: RCTKeyframeGenerator(del, duration)
    };

    return keyframes;
  }

  calculateNumericKeyframes(
    prev: number,
    next: number,
    keyframes: Array<number>
  ) {
    const change = next - prev;

    return keyframes.map(frameValue => {
      return prev + change * frameValue;
    });
  }

  calculateScaleFrames(scaleX: number, scaleY: number, keyframes: number[]) {
    return keyframes.map(frameValue => {
      let sX = scaleX === 1 ? 1 : 1 + scaleX * (1 - frameValue);
      let sY = scaleY === 1 ? 1 : 1 + scaleY * (1 - frameValue);

      sX = sX < 0 ? 0 : sX;
      sY = sY < 0 ? 0 : sY;

      return transform(scale(sX, sY));
    });
  }

  calculateInverseScaleFrames(keyframes: Matrix[]) {
    return keyframes.map(mat => {
      try {
        return transform(inverse(mat));
      } catch (e) {
        return transform(identity());
      }
    });
  }

  calculateTranslationFrames(
    transX: number,
    transY: number,
    keyframes: number[]
  ) {
    return keyframes.map(frameValue => {
      const tx = transX * (1 - frameValue);
      const ty = transY * (1 - frameValue);

      const result = transform(translate(tx, ty));
      return result;
    });
  }

  createNewAnimationConfig(): AnimationConfig {
    return { purge: false };
  }

  constructAnimationConfigs(
    keyframes: KeyframeConfig,
    config: LayoutAnimationConfig
  ) {
    const configRegistry: AnimationConfigRegistry = {};

    const {
      create: createKeyConfig,
      update: updateKeyConfig,
      delete: deleteKeyConfig
    } = keyframes;

    // Add Create/Update layout changes to animation registry
    this.layoutChanges.forEach(layoutChange => {
      const {
        reactTag,
        layout,
        nextMeasurement,
        previousMeasurement
      } = layoutChange;

      const shadowView = this.manager.shadowViewRegistry.get(reactTag);

      invariant(shadowView, "Invalid react tag");

      if (!configRegistry.hasOwnProperty(reactTag)) {
        configRegistry[reactTag] = this.createNewAnimationConfig();
      }

      // if there's no previous measurement we can assume the view is created
      if (!previousMeasurement) {
        // Currently assuming property is opacity, TODO: handle ScaleXY too
        configRegistry[reactTag].opacityDuration = createKeyConfig.duration;
        configRegistry[reactTag].opacity = this.calculateNumericKeyframes(
          0,
          1,
          createKeyConfig.keyframes
        );
      } else {
        // update
        configRegistry[reactTag].layoutDuration = updateKeyConfig.duration;

        let layoutKeyframes;

        if (
          previousMeasurement.left !== nextMeasurement.left ||
          previousMeasurement.top !== nextMeasurement.top
        ) {
          const transX = previousMeasurement.left - nextMeasurement.left;
          const transY = previousMeasurement.top - nextMeasurement.top;

          layoutKeyframes = this.calculateTranslationFrames(
            transX,
            transY,
            updateKeyConfig.keyframes
          );

          if (shadowView.reactSubviews.length !== 0) {
            // Apply inverse scale transforms to children
            const inverseTranslateFrames = this.calculateInverseScaleFrames(
              layoutKeyframes
            );

            shadowView.reactSubviews.forEach(subview => {
              const subReactTag = subview.reactTag;

              if (!configRegistry.hasOwnProperty(subReactTag)) {
                configRegistry[subReactTag] = this.createNewAnimationConfig();
              }

              configRegistry[
                subReactTag
              ].parentTransform = inverseTranslateFrames;
            });
          }
        }

        if (
          previousMeasurement.width !== nextMeasurement.width ||
          previousMeasurement.height !== nextMeasurement.height
        ) {
          const scaleX = previousMeasurement.width / nextMeasurement.width;
          const scaleY = previousMeasurement.height / nextMeasurement.height;

          const scaleKeyframes = this.calculateScaleFrames(
            scaleX,
            scaleY,
            updateKeyConfig.keyframes
          );

          if (layoutKeyframes) {
            layoutKeyframes = layoutKeyframes.map((translateMat, index) => {
              return transform(translateMat, scaleKeyframes[index]);
            });
          } else {
            layoutKeyframes = scaleKeyframes;
          }

          if (shadowView.reactSubviews.length !== 0) {
            // Apply inverse scale transforms to children
            const inverseScaleFrames = this.calculateInverseScaleFrames(
              scaleKeyframes
            );

            shadowView.reactSubviews.forEach(subview => {
              const subReactTag = subview.reactTag;

              if (!configRegistry.hasOwnProperty(subReactTag)) {
                configRegistry[subReactTag] = this.createNewAnimationConfig();
              }

              if (configRegistry[subReactTag].parentTransform) {
                const parentTransform =
                  configRegistry[subReactTag].parentTransform;
                configRegistry[
                  subReactTag
                ].parentTransform = parentTransform.map(prev => {
                  return transform(prev, inverseScaleFrames);
                });
              } else {
                configRegistry[
                  subReactTag
                ].parentTransform = inverseScaleFrames;
              }
            });
          }
        }

        configRegistry[reactTag].layoutTransfrom = layoutKeyframes;

        if (shadowView._transform) {
          configRegistry[reactTag].viewTransform = shadowView._transform;
        }
      }
    });

    this.removedNodes.forEach(reactTag => {
      if (!configRegistry.hasOwnProperty(reactTag)) {
        configRegistry[reactTag] = this.createNewAnimationConfig();
      }

      configRegistry[reactTag].purge = true;
      configRegistry[reactTag].opacityDuration = deleteKeyConfig.duration;
      configRegistry[reactTag].opacity = this.calculateNumericKeyframes(
        1,
        0,
        createKeyConfig.keyframes
      );
    });

    return configRegistry;
  }

  createAnimations(registry: AnimationConfigRegistry) {
    return Object.entries(registry).map(([stringReactTag, nodeConfig]) => {
      const reactTag = parseInt(stringReactTag, 10);
      const view = this.manager.viewRegistry.get(reactTag);
      invariant(view, `No such view with tag ${reactTag}`);

      let animations = [];
      const {
        opacity,
        opacityDuration,
        viewTransform,
        parentTransform,
        layoutTransfrom,
        layoutDuration,
        purge
      } = nodeConfig;

      let keyframes;

      if (parentTransform || layoutTransfrom) {
        let compositeTransform;

        // TODO: incorporate view transform value
        if (parentTransform) {
          compositeTransform = parentTransform.map(toCSS);
        }

        if (layoutTransfrom) {
          if (compositeTransform) {
            compositeTransform = compositeTransform.map((prevMat, index) => {
              return prevMat + " " + toCSS(layoutTransfrom[index]);
            });
          } else {
            compositeTransform = layoutTransfrom.map(toCSS);
          }
        }

        if (compositeTransform && layoutDuration) {
          const transformKeyframes = compositeTransform.map(matrix => ({
            transform: matrix
          }));

          const transformConfig = {
            duration: layoutDuration,
            fill: "both"
          };

          animations.push(() => {
            view.style.transformOrigin = "0% 0%";
            // $FlowFixMe
            const animation = view.animate(transformKeyframes, transformConfig);

            animation.onfinish = () => {
              view.style.transformOrigin = "";
            };

            return animation.finished;
          });
        }
      }

      if (opacity && opacityDuration) {
        const opacityKeyframes = opacity.map(value => ({
          opacity: value
        }));

        const opacityConfig = { duration: opacityDuration };

        animations.push(() => {
          // $FlowFixMe
          const animation = view.animate(opacityKeyframes, opacityConfig);

          if (purge) {
            animation.onfinish = () => {
              this.manager.viewRegistry.delete(reactTag);
              view.purge();
            };
          }

          return animation.finished;
        });
      }

      return () => Promise.all(animations.map(t => t()));
    });
  }

  applyLayoutChanges() {
    const pendingConfig = this.pendingConfig;

    invariant(
      pendingConfig,
      "Attempting to apply a layoutanimation without a pending config."
    );

    const keyframes = this.constructKeyframes(pendingConfig);

    const animationConfig = this.constructAnimationConfigs(
      keyframes,
      pendingConfig
    );

    const layoutChanges = this.layoutChanges;
    const callback = this.pendingCallback;
    this.reset();

    let animations = this.createAnimations(animationConfig);

    animations = [() => this.manager.applyLayoutChanges(layoutChanges)].concat(
      animations
    );

    this.manager.addUIBlock(() => {
      Promise.all(animations.map(t => t())).then(() => {
        if (callback) callback();
      });

      this.manager.applyLayoutChanges(layoutChanges);
    });
  }
}

export default RCTLayoutAnimationManager;
