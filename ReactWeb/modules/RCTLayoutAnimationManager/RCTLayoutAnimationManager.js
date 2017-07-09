/**
 * @providesModule RCTLayoutAnimationManager
 * @flow
 */
import type { Frame } from "UIView";
import type RCTUIManager from "RCTUIManager";

import Animar from "./animar.es";
import invariant from "Invariant";

const basicEasingFunctions = {
  linear: (t: number, b: number, c: number, d: number) => c * t / d + b,
  easeInEaseOut: (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) {
      return c / 2 * t * t + b;
    }
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  },
  easeIn: (t: number, b: number, c: number, d: number) => {
    t /= d;
    return c * t * t + b;
  },
  easeOut: (t: number, b: number, c: number, d: number) => {
    t /= d;
    return -c * t * (t - 2) + b;
  }
};

const springEasingFunctionGenerator = (damping: number) => {
  return (t: number, b: number, c: number, d: number) => {
    if (damping >= 1) {
      damping = 0.99;
    }
    // prepare variables
    var iterationMult = 27.42078669 * Math.pow(damping, -0.8623276489);
    var startVelocity = 0.0,
      spring = 0.7,
      weightedIteration = t * (iterationMult / d);

    // Spring simulation
    var wd = spring * Math.sqrt(1.0 - Math.pow(damping, 2.0));
    var theta = damping * spring;

    return (
      Math.exp(-1.0 * theta * weightedIteration) *
      (b * Math.cos(wd * weightedIteration) +
        (theta * b + startVelocity) / wd * Math.sin(wd * weightedIteration))
    );
  };
};

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

type LayoutAnim = {
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

class RCTLayoutAnimationManager {
  manager: RCTUIManager;
  animar: any;

  constructor(manager: RCTUIManager) {
    this.manager = manager;
    this.initializeAnimar();
  }

  initializeAnimar() {
    this.animar = new Animar();

    const layoutAnimationAnimarPreset = {
      renderPlugins: [
        {
          name: "RCTLayoutAnimation",
          attributes: ["left", "top", "width", "height", "opacity"],
          render: this.render.bind(this)
        }
      ],
      timingPlugin: update => {
        window.requestAnimationFrame(update);
      }
    };

    this.animar.addPreset(layoutAnimationAnimarPreset);
  }

  render(reactTag: number, attributes: AttributeMap) {
    this.manager.addUIBlock(() => {
      const view = this.manager.viewRegistry.get(reactTag);
      if (view != null) {
        Object.assign(view, attributes);
      }
    });
  }

  getEasingFunction(config: LayoutAnim) {
    const type = config.type;

    invariant(type, "animation type must be defined");

    if (type !== "spring") {
      return basicEasingFunctions[type];
    } else if (type === "spring") {
      const { springDamping } = config;
      invariant(
        springDamping,
        `attempting to create spring animation without damping configured`
      );
      return springEasingFunctionGenerator(springDamping);
    } else {
      throw new Error();
    }
  }

  generateAnimationConfig(
    config: LayoutAnim,
    overallDuration: number,
    useOverallDuration: boolean = true
  ): Object {
    const animationConfig = {};

    if (useOverallDuration) {
      animationConfig.duration = config.duration
        ? config.duration
        : overallDuration;
    } else {
      animationConfig.duration = config.duration ? config.duration : 0;
    }

    // convert from ms to fps
    if (config.type === "spring") {
      animationConfig.duration = animationConfig.duration * 0.12;
    } else {
      animationConfig.duration = animationConfig.duration * 0.03;
    }

    animationConfig.easingFunction = this.getEasingFunction(config);

    if (config.delay) {
      animationConfig.delay = config.delay;
    }

    return animationConfig;
  }

  generateCreateDeleteConfigs(
    reactTag: number,
    createConfig: LayoutAnim,
    duration: number,
    type: "create" | "delete",
    initialFrame: Object = {}
  ): [Object, Object, Object] {
    const view = this.manager.viewRegistry.get(reactTag);
    invariant(view, `View with react tag ${reactTag} does not exist`);

    const { property } = createConfig;
    invariant(property, `createConfig has no proroperty`);

    switch (property) {
      case "opacity": {
        return [
          {
            opacity: type === "create" ? 0 : view.opacity,
            ...initialFrame
          },
          { opacity: type === "create" ? view.opacity : 0 },
          this.generateAnimationConfig(
            createConfig,
            duration,
            type === "create"
          )
        ];
      }
      default: {
        throw new Error();
      }
    }
  }

  generateUpdateConfigs(
    reactTag: number,
    targetState: Frame,
    updateConfig: LayoutAnim,
    duration: number
  ): [Object, Object, Object] {
    const view = this.manager.viewRegistry.get(reactTag);
    invariant(view, `View with react tag ${reactTag} does not exist`);

    return [
      view.frame,
      targetState,
      this.generateAnimationConfig(updateConfig, duration)
    ];
  }

  startLayoutAnimations(pendingAnimations: PendingLayoutAnimation) {
    const {
      config,
      callback,
      addedNodes,
      updatedNodes,
      removedNodes
    } = pendingAnimations;

    let animations = this.animar;

    const targets = [];
    Object.keys(addedNodes).forEach(tagKey => {
      const reactTag = parseInt(tagKey, 10);

      const [
        initialState,
        targetState,
        animationOptions
      ] = this.generateCreateDeleteConfigs(
        reactTag,
        config.create,
        config.duration,
        "create",
        addedNodes[reactTag]
      );

      animations = animations.set(reactTag, initialState);
      targets.push([reactTag, targetState, animationOptions]);
    });

    const updatedTargets = [];
    Object.keys(updatedNodes).forEach(tagKey => {
      const reactTag = parseInt(tagKey, 10);

      const [
        initialState,
        targetState,
        animationOptions
      ] = this.generateUpdateConfigs(
        reactTag,
        updatedNodes[reactTag],
        config.update,
        config.duration
      );

      animations = animations.set(reactTag, initialState);
      targets.push([reactTag, targetState, animationOptions]);
    });

    const removedTargets = [];
    removedNodes.forEach(reactTag => {
      const [
        initialState,
        targetState,
        animationOptions
      ] = this.generateCreateDeleteConfigs(
        reactTag,
        config.create,
        config.duration,
        "delete"
      );

      animations = animations.set(reactTag, initialState);
      targets.push([reactTag, targetState, animationOptions]);
    });

    targets.forEach(args => (animations = animations.add(...args)));

    if (targets.length > 0) {
      animations = animations
        .then()
        .hook(() => {
          removedNodes.forEach(reactTag => {
            this.manager.purgeView(reactTag);
          });
        })
        .hook(() => {
          callback();
        });

      this.manager.addUIBlock(() => animations.start());
    } else {
      callback();
    }
  }
}

export default RCTLayoutAnimationManager;
