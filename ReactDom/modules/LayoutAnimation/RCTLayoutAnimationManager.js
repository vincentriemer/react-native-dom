/**
 * @providesModule RCTLayoutAnimationManager
 * @flow
 */
import type { LayoutChange } from "../../views/RCTShadowView";
import type { KeyframeResult } from "./RTCKeyframeGenerator";

import invariant from "../../utils/Invariant";
import RCTKeyframeGenerator from "./RTCKeyframeGenerator";
import * as MatrixMath from "MatrixMath";

import typeof _RCTUIManager from "../RCTUIManager";
type RCTUIManager = $Call<$await<_RCTUIManager>>;

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
  create: ?KeyframeResult,
  update: ?KeyframeResult,
  delete: ?KeyframeResult
};

type TransformKeyframeConfig = {
  translateX: number,
  translateY: number,
  scaleX: number,
  scaleY: number
};

type ChildContainerKeyframeConfig = {
  scaleX: number,
  scaleY: number
};

type ChildContainerAnimationConfig = ChildContainerKeyframeConfig[];

type TransformAnimationConfig = [
  TransformKeyframeConfig[],
  { duration: number, layout: Frame, origin: Position }
];

type TransformAnimationConfigRegistry = {
  [reactTag: number]: TransformAnimationConfig
};

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
    return keyframes.map((keyframe) => ({
      opacity: `${to + (from - to) * (1 - keyframe)}`
    }));
  }

  createTransformAnimationKeyframes(
    from: number,
    to: number,
    keyframes: number[],
    propName: string,
    existingKeyframes: any[]
  ) {
    return existingKeyframes.map((prevKeyframe, index) => {
      let newValue;

      if (["scaleX", "scaleY"].includes(propName)) {
        newValue = from + (to - from) * keyframes[index];

        if (newValue <= 0) {
          newValue = 0.0001;
        }
      } else {
        newValue = from + (to - from) * keyframes[index];
      }

      return {
        ...prevKeyframe,
        [propName]: newValue
      };
    });
  }

  createInverseTransformAnimationKeyframes(
    propName: string,
    existingKeyframes: any[],
    parentKeyframes: any[]
  ) {
    return existingKeyframes.map((prevKeyframe, index) => {
      const parentKeyframe = parentKeyframes[index];
      let parentValue = parentKeyframe[propName];

      let newValue;
      if (["scaleX", "scaleY"].includes(propName)) {
        newValue = 1 / parentValue;
      } else {
        newValue = -1 * parentValue;
      }

      return {
        ...prevKeyframe,
        [propName]: newValue
      };
    });
  }

  transformAnimationConfigFactory(
    keyLength: number,
    duration: number,
    layout: Frame
  ): TransformAnimationConfig {
    return [
      new Array(keyLength).fill({
        translateX: layout.left,
        translateY: layout.top,
        scaleX: 1.0,
        scaleY: 1.0,
        inverseScaleX: 1.0,
        inverseScaleY: 1.0
      }),
      {
        duration: duration,
        layout,
        origin: {
          x: -1 * layout.width / 2,
          y: -1 * layout.height / 2
        }
      }
    ];
  }

  childContainerAnimationConfigFactory(keyLength: number) {
    return new Array(keyLength).fill({
      scaleX: 1.0,
      scaleY: 1.0
    });
  }

  applyInverseTransformOnChildren(
    shadowView: *,
    registry: TransformAnimationConfigRegistry,
    updateKeyConfig: KeyframeResult,
    newFrames: TransformKeyframeConfig[],
    propName: string
  ) {
    const view = this.manager.viewRegistry.get(shadowView.reactTag);

    if (view && view.reactSubviews.length !== 0) {
      view.reactSubviews.forEach((subView, index) => {
        const subReactTag = subView.reactTag;

        const subShadowView = this.manager.shadowViewRegistry.get(subReactTag);
        invariant(subShadowView, "Shadow View does not exist");

        const previousLayout = subShadowView.previousLayout;
        invariant(previousLayout, "Shadow View has no previous layout");

        if (!registry.hasOwnProperty(subReactTag)) {
          registry[subReactTag] = this.transformAnimationConfigFactory(
            updateKeyConfig.keyframes.length,
            updateKeyConfig.duration,
            previousLayout
          );
        }

        registry[
          subReactTag
        ][0] = this.createInverseTransformAnimationKeyframes(
          propName,
          registry[subReactTag][0],
          newFrames
        );
      });
    }
  }

  createTransformAnimations(
    keyframes: KeyframeConfig,
    config: LayoutAnimationConfig
  ) {
    const animations = [];
    const cleanup = [];
    const registry: TransformAnimationConfigRegistry = {};

    const {
      create: createKeyConfig,
      update: updateKeyConfig,
      delete: deleteKeyConfig
    } = keyframes;

    const addedNodes = this.layoutChanges
      .filter((lc) => !lc.previousMeasurement)
      .map((lc) => lc.reactTag);

    this.layoutChanges.forEach((layoutChange) => {
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
        // skip if no creation keyframe config
        if (createKeyConfig == null) {
          view.frame = layout;
          view.opacity = 1;
          return;
        }

        // Don't animate children of added views
        if (
          view.reactSuperview &&
          addedNodes.includes(view.reactSuperview.reactTag)
        ) {
          view.frame = layout;
          view.opacity = 1;
          return;
        }

        const keyframes = this.createOpacityKeyframes(
          0,
          1,
          createKeyConfig.keyframes
        );

        const config = {
          duration: createKeyConfig.duration,
          delay: createKeyConfig.delay,
          fill: "none"
        };

        view.style.willChange = "opacity";
        view.frame = layout;

        animations.push(new KeyframeEffect(view, keyframes, config));
        cleanup.push(() => {
          view.style.willChange = "";
        });
      } else {
        // skip layout update animation
        if (updateKeyConfig == null) {
          view.frame = layout;
          return;
        }

        const shadowView = this.manager.shadowViewRegistry.get(reactTag);
        invariant(shadowView, "shadowView does not exist");

        if (!registry.hasOwnProperty(reactTag)) {
          registry[reactTag] = this.transformAnimationConfigFactory(
            updateKeyConfig.keyframes.length,
            updateKeyConfig.duration,
            layout
          );
        }

        let {
          top: prevTop,
          left: prevLeft,
          width: prevWidth,
          height: prevHeight
        } = view.frame;

        let {
          top: nextTop,
          left: nextLeft,
          width: nextWidth,
          height: nextHeight
        } = layout;

        if (prevTop !== nextTop) {
          const prevTranslateY = prevTop;
          const nextTranslateY = nextTop;

          const newFrames = this.createTransformAnimationKeyframes(
            prevTranslateY,
            nextTranslateY,
            updateKeyConfig.keyframes,
            "translateY",
            registry[reactTag][0]
          );

          registry[reactTag][0] = newFrames;
        }

        if (prevLeft !== nextLeft) {
          const prevTranslateX = prevLeft;
          const nextTranslateX = nextLeft;

          const newFrames = this.createTransformAnimationKeyframes(
            prevTranslateX,
            nextTranslateX,
            updateKeyConfig.keyframes,
            "translateX",
            registry[reactTag][0]
          );

          registry[reactTag][0] = newFrames;
        }

        const parentLayout = shadowView.previousLayout;
        view.reactSubviews.forEach((subView, index) => {
          if (addedNodes.includes(subView.reactTag)) {
            const previousLayout =
              shadowView.reactSubviews[index].previousLayout;
            const [originalKeyframes, { duration }] = registry[reactTag];

            const adjustedKeyframes = originalKeyframes.map(
              ({ translateX, translateY }) => ({
                transform: `translateX(${-translateX +
                  parentLayout.left +
                  previousLayout.left}px) translateY(${-translateY +
                  parentLayout.top +
                  previousLayout.top}px)`
              })
            );

            const config = { duration, fill: "none" };

            animations.push(
              new KeyframeEffect(subView, adjustedKeyframes, config)
            );
          }
        });

        let childContainerTransform = this.childContainerAnimationConfigFactory(
          updateKeyConfig.keyframes.length
        );
        let shouldTransformChildren = false;

        if (prevWidth !== nextWidth && nextWidth !== 0) {
          const prevScaleX = prevWidth / nextWidth;
          const nextScaleX = 1.0;

          const newFrames = this.createTransformAnimationKeyframes(
            prevScaleX,
            nextScaleX,
            updateKeyConfig.keyframes,
            "scaleX",
            registry[reactTag][0]
          );

          registry[reactTag][0] = newFrames;

          if (view.childContainer) {
            shouldTransformChildren = true;
            childContainerTransform = this.createInverseTransformAnimationKeyframes(
              "scaleX",
              childContainerTransform,
              newFrames
            );
          }
        }

        if (prevHeight !== nextHeight && nextHeight !== 0) {
          const nextScaleY = 1.0;
          const prevScaleY = prevHeight / nextHeight;

          const newFrames = this.createTransformAnimationKeyframes(
            prevScaleY,
            nextScaleY,
            updateKeyConfig.keyframes,
            "scaleY",
            registry[reactTag][0]
          );

          registry[reactTag][0] = newFrames;

          if (view.childContainer) {
            shouldTransformChildren = true;
            childContainerTransform = this.createInverseTransformAnimationKeyframes(
              "scaleY",
              childContainerTransform,
              newFrames
            );
          }
        }

        if (shouldTransformChildren) {
          const childContainer = view.childContainer;
          if (childContainer) {
            const keyframes = childContainerTransform.map(
              ({ scaleX, scaleY }) => ({
                transform: `scale(${scaleX},${scaleY})`
              })
            );
            const config = { duration: updateKeyConfig.duration, fill: "none" };

            childContainer.style.willChange = "transform";
            animations.push(
              new KeyframeEffect(childContainer, keyframes, config)
            );
            cleanup.push(() => {
              childContainer.style.willChange = "";
            });
          }
        }
      }
    });

    Object.keys(registry).forEach((tag) => {
      const reactTag = parseInt(tag, 10);

      const [keyframeConfigs, { duration, layout, origin }] = registry[
        reactTag
      ];

      const view = this.manager.viewRegistry.get(reactTag);
      invariant(view, "view does not exist");

      const keyframes = this.constructTransformKeyframes(
        keyframeConfigs,
        origin
      );

      const layoutStyle = {
        width: `${layout.width}px`,
        height: `${layout.height}px`
      };

      const config = { duration, fill: "none" };

      const prevWillChange = view.style.willChange;
      view.style.willChange = "transform";
      view.frame = layout;
      animations.push(new KeyframeEffect(view, keyframes, config));
      cleanup.push(() => {
        view.style.willChange = prevWillChange;
      });
    });

    // Animate view removal
    this.removedNodes.forEach((reactTag) => {
      const view = this.manager.viewRegistry.get(reactTag);
      invariant(view, "view does not exist");

      if (deleteKeyConfig == null) {
        if (view.reactSuperview) {
          view.reactSuperview.removeReactSubview(view);
        }
        this.manager.viewRegistry.delete(reactTag);
        view.purge();
        return;
      }

      if (
        view.reactSuperview &&
        this.removedNodes.includes(view.reactSuperview.reactTag)
      ) {
        if (view.reactSuperview) {
          view.reactSuperview.removeReactSubview(view);
        }
        this.manager.viewRegistry.delete(reactTag);
        return;
      }

      const keyframes = this.createOpacityKeyframes(
        1,
        0,
        deleteKeyConfig.keyframes
      );

      const config = {
        duration: deleteKeyConfig.duration,
        delay: deleteKeyConfig.delay,
        fill: "forwards"
      };

      view.style.willChange = "opacity";
      animations.push(new KeyframeEffect(view, keyframes, config));
      cleanup.push(() => {
        if (view.reactSuperview) {
          view.reactSuperview.removeReactSubview(view);
        }
        this.manager.viewRegistry.delete(reactTag);
        view.purge();
      });
    });

    return [animations, cleanup];
  }

  constructTransformKeyframes(
    keyframeConfigs: TransformKeyframeConfig[],
    origin: Position
  ) {
    return keyframeConfigs.map((config) => {
      const { translateX, translateY, scaleX, scaleY } = config;

      // shift transformation origin
      let transformMatrix = MatrixMath.createTranslate2d(origin.x, origin.y);

      // apply translation
      MatrixMath.multiplyInto(
        transformMatrix,
        transformMatrix,
        MatrixMath.createTranslate2d(translateX, translateY)
      );

      // apply scaling
      const scaleMatrix = MatrixMath.createIdentityMatrix();
      MatrixMath.reuseScale3dCommand(scaleMatrix, scaleX, scaleY, 1.0);
      MatrixMath.multiplyInto(transformMatrix, transformMatrix, scaleMatrix);

      // revert transformation origin
      MatrixMath.multiplyInto(
        transformMatrix,
        transformMatrix,
        MatrixMath.createTranslate2d(-origin.x, -origin.y)
      );

      return {
        transform: `matrix3d(${transformMatrix.join(", ")})`
      };
    });
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
    const [animations, cleanup] = this.createTransformAnimations(
      keyframes,
      pendingConfig
    );

    const groupEffect = new GroupEffect(animations);

    const animation = document.timeline.play(groupEffect);
    animation.finished.then(() => {
      cleanup.forEach((c) => c());
      callback();
    });

    this.reset();
  }
}

export default RCTLayoutAnimationManager;
