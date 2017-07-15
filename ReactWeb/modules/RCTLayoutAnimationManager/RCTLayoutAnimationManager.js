/**
 * @providesModule RCTLayoutAnimationManager
 * @flow
 */
import type { Frame } from "UIView";
import type { LayoutChange } from "RCTShadowView";
import type RCTUIManager from "RCTUIManager";
import type { KeyframeResult } from "RCTKeyframeGenerator";

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

type KeyframeConfig = {
  create: KeyframeResult,
  update: KeyframeResult,
  delete: KeyframeResult
};

type AnimationConfig = [
  {
    translateX?: string,
    translateY?: string,
    width?: string,
    height?: string,
    opacity?: string
  }[],
  { duration: number, purge: boolean }
];

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

  createOpacityKeyframes(from: number, to: number, keyframes: number[]) {
    return keyframes.map(keyframe => ({
      opacity: `${to + (from - to) * (1 - keyframe)}`
    }));
  }

  createAnimationKeyframes(
    from: number,
    to: number,
    keyframes: number[],
    propName: string,
    existingKeyframes: any[]
  ) {
    return existingKeyframes.map((existingKeyframe, index) => {
      let newValue = to + (from - to) * (1 - keyframes[index]);

      if (["width", "height"].includes(propName)) {
        if (newValue < 0) {
          newValue = 0;
        } else {
          newValue = Math.ceil(newValue);
        }
      }

      return {
        ...existingKeyframe,
        [propName]: `${newValue}px`
      };
    });
  }

  runAnimations(keyframes: KeyframeConfig, config: LayoutAnimationConfig) {
    const animations = [];

    const {
      create: createKeyConfig,
      update: updateKeyConfig,
      delete: deleteKeyConfig
    } = keyframes;

    this.layoutChanges.forEach(layoutChange => {
      const {
        reactTag,
        layout,
        nextMeasurement,
        previousMeasurement
      } = layoutChange;

      const view = this.manager.viewRegistry.get(reactTag);

      invariant(view, "view does not exist");

      // if there's no previous measurement we can assume the view is created
      if (!previousMeasurement) {
        const keyframes = this.createOpacityKeyframes(
          0,
          1,
          createKeyConfig.keyframes
        );
        const config = {
          duration: createKeyConfig.duration
        };

        view.style.willChange = "opacity";

        animations.push(() => {
          view.frame = layout;

          // $FlowFixMe
          const animation = view.animate(keyframes, config);

          animation.onfinish = () => {
            view.style.willChange = "";
          };

          return animation.finished;
        });
      } else {
        let keyframes = new Array(updateKeyConfig.keyframes.length).fill({
          translateX: `${layout.left}px`,
          translateY: `${layout.top}px`
        });

        const {
          left: nextLeft,
          top: nextTop,
          width: nextWidth,
          height: nextHeight
        } = nextMeasurement;

        const {
          left: prevLeft,
          top: prevTop,
          width: prevWidth,
          height: prevHeight
        } = previousMeasurement;

        const { top, left, width, height } = view.frame;

        if (prevLeft !== nextLeft) {
          keyframes = this.createAnimationKeyframes(
            // layout.left + (prevLeft - nextLeft),
            left,
            layout.left,
            updateKeyConfig.keyframes,
            "translateX",
            keyframes
          );
        }
        if (prevTop !== nextTop) {
          keyframes = this.createAnimationKeyframes(
            // layout.top + (prevTop - nextTop),
            top,
            layout.top,
            updateKeyConfig.keyframes,
            "translateY",
            keyframes
          );
        }
        if (prevWidth !== nextWidth) {
          keyframes = this.createAnimationKeyframes(
            // layout.width + (prevWidth - nextWidth),
            width,
            layout.width,
            updateKeyConfig.keyframes,
            "width",
            keyframes
          );
        }
        if (prevHeight !== nextHeight) {
          keyframes = this.createAnimationKeyframes(
            // layout.height + (prevHeight - nextHeight),
            height,
            layout.height,
            updateKeyConfig.keyframes,
            "height",
            keyframes
          );
        }

        keyframes = keyframes.map(frame => {
          const { translateX, translateY, ...rest } = frame;

          let translateString = "";
          translateString += translateX ? `translateX(${translateX}) ` : "";
          translateString += translateY ? `translateY(${translateY}) ` : "";

          return {
            ...rest,
            transform: translateString
          };
        });

        const config = {
          duration: updateKeyConfig.duration,
          fill: "backwards"
        };

        view.style.willChange = "transform, width, height";

        animations.push(() => {
          view.frame = layout;

          // $FlowFixMe
          const animation = view.animate(keyframes, config);

          animation.onfinish = () => {
            view.style.willChange = "";
          };

          return animation.finished;
        });
      }

      this.removedNodes.forEach(reactTag => {
        const view = this.manager.viewRegistry.get(reactTag);
        invariant(view, "view does not exist");

        const keyframes = this.createOpacityKeyframes(
          1,
          0,
          deleteKeyConfig.keyframes
        );
        const config = {
          duration: deleteKeyConfig.duration
        };

        view.style.willChange = "opacity";

        animations.push(() => {
          // $FlowFixMe
          const animation = view.animate(keyframes, config);

          animation.onfinish = () => {
            view.style.willChange = "";
            this.manager.viewRegistry.delete(reactTag);
            view.purge();
          };

          return animation.finished;
        });
      });
    });

    return animations;
  }

  applyLayoutChanges() {
    const pendingConfig = this.pendingConfig;
    const layoutChanges = this.layoutChanges;
    const callback = this.pendingCallback;

    invariant(
      pendingConfig && layoutChanges && callback,
      "Attempting to apply a layoutanimation without a pending config."
    );

    const keyframes = this.constructKeyframes(pendingConfig);
    const animations = this.runAnimations(keyframes, pendingConfig);

    this.manager.addUIBlock(() => {
      Promise.all(animations.map(f => f())).then(() => {
        callback();
      });
      this.reset();
    });

    // this.removedNodes.forEach(reactTag => {
    //   const view = this.manager.viewRegistry.get(reactTag);
    //   invariant(view, "Attempting to remove view which does not exist");
    //   this.manager.viewRegistry.delete(reactTag);
    //   view.purge();
    // });

    // this.manager.applyLayoutChanges(layoutChanges);
  }
}

export default RCTLayoutAnimationManager;
