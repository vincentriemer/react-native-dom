/** @flow */

import invariant from "invariant";

import type { Config } from "RCTNativeAnimatedModule";
import type { RCTEvent } from "RCTEventDispatcher";
import type { RCTAnimationDriver } from "RCTAnimationDriver";
import type { RCTValueAnimatedNodeObserver } from "RCTValueAnimatedNode";
import RCTAnimatedNode from "RCTAnimatedNode";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";
import RCTPropsAnimatedNode from "RCTPropsAnimatedNode";
import RCTStyleAnimatedNode from "RCTStyleAnimatedNode";
import RCTInterpolationAnimatedNode from "RCTInterpolationAnimatedNode";
import RCTTransformAnimatedNode from "RCTTransformAnimatedNode";
import RCTMultiplicationAnimatedNode from "RCTMultiplicationAnimatedNode";
import RCTAdditionAnimatedNode from "RCTAdditionAnimatedNode";
import RCTSubtractionAnimatedNode from "RCTSubtractionAnimatedNode";
import RCTModuloAnimatedNode from "RCTModuloAnimatedNode";
import RCTDivisionAnimatedNode from "RCTDivisionAnimatedNode";
import RCTTrackingAnimatedNode from "RCTTrackingAnimatedNode";
import RCTEventAnimation from "RCTEventAnimation";
import RCTFrameAnimation from "RCTFrameAnimation";
import RCTDecayAnimation from "RCTDecayAnimation";
import RCTSpringAnimation from "RCTSpringAnimation";
import typeof _RCTUIManager from "RCTUIManager";
type RCTUIManager = $Call<$await<_RCTUIManager>>;

const NODE_TYPE_MAP: { [typeName: string]: Class<RCTAnimatedNode> } = {
  style: RCTStyleAnimatedNode,
  value: RCTValueAnimatedNode,
  props: RCTPropsAnimatedNode,
  interpolation: RCTInterpolationAnimatedNode,
  transform: RCTTransformAnimatedNode,
  multiplication: RCTMultiplicationAnimatedNode,
  addition: RCTAdditionAnimatedNode,
  subtraction: RCTSubtractionAnimatedNode,
  modulus: RCTModuloAnimatedNode,
  division: RCTDivisionAnimatedNode,
  tracking: RCTTrackingAnimatedNode
};

const DRIVER_TYPE_MAP: { [typeName: string]: Class<RCTAnimationDriver> } = {
  frames: RCTFrameAnimation,
  decay: RCTDecayAnimation,
  spring: RCTSpringAnimation
};

class RCTNativeAnimatedNodesManager {
  uiManager: RCTUIManager;

  animationNodes: { [nodeTag: number]: RCTAnimatedNode };
  eventDrivers: { [key: string]: RCTEventAnimation[] };
  activeAnimations: Set<RCTAnimationDriver>;

  ticking: boolean;

  constructor(uiManager: RCTUIManager) {
    this.uiManager = uiManager;
    this.animationNodes = {};
    this.eventDrivers = {};
    this.activeAnimations = new Set();
    this.ticking = false;
  }

  // -- Graph

  createAnimatedNode(tag: number, config: Config) {
    const nodeType = config.type;

    const NodeClass = NODE_TYPE_MAP[nodeType];
    if (!NodeClass) {
      console.error(`Animated node type ${nodeType} not supported natively`);
      return;
    }

    const node = new NodeClass(tag, config);
    node.manager = this;
    this.animationNodes[tag] = node;
    node.setNeedsUpdate();
  }

  connectAnimatedNodes(parentTag: number, childTag: number) {
    const parentNode = this.animationNodes[parentTag];
    const childNode = this.animationNodes[childTag];

    invariant(parentNode, `no such parent node with id ${parentTag}`);
    invariant(childNode, `no such child node with id ${childTag}`);

    parentNode.addChild(childNode);
    childNode.setNeedsUpdate();
  }

  disconnectAnimatedNodes(parentTag: number, childTag: number) {
    const parentNode = this.animationNodes[parentTag];
    const childNode = this.animationNodes[childTag];

    invariant(parentNode, `no such parent node with id ${parentTag}`);
    invariant(childNode, `no such child node with id ${childTag}`);

    parentNode.removeChild(childNode);
    childNode.setNeedsUpdate();
  }

  connectAnimatedNodeToView(
    nodeTag: number,
    viewTag: number,
    viewName: string
  ) {
    const node = this.animationNodes[nodeTag];
    if (node instanceof RCTPropsAnimatedNode) {
      node.connectToView(viewTag, viewName, this.uiManager);
    }
    node.setNeedsUpdate();
  }

  disconnectAnimatedNodeFromView(nodeTag: number, viewTag: number) {
    const node = this.animationNodes[nodeTag];
    if (node instanceof RCTPropsAnimatedNode) {
      node.disconnectFromView(viewTag);
    }
  }

  dropAnimatedNode(tag: number) {
    const node = this.animationNodes[tag];
    if (node) {
      node.detachNode();
      delete this.animationNodes[tag];
    }
  }

  // -- Mutations

  setAnimatedNodeValue(nodeTag: number, value: number) {
    const node = this.animationNodes[nodeTag];
    if (!(node instanceof RCTValueAnimatedNode)) {
      console.error("Not a value node.");
      return;
    }
    this.stopAnimationsForNode(node);

    node.value = value;
    node.setNeedsUpdate();
  }

  setAnimatedNodeOffset(nodeTag: number, offset: number) {
    const node = this.animationNodes[nodeTag];
    if (!(node instanceof RCTValueAnimatedNode)) {
      console.error("Not a value node.");
      return;
    }
    node.offset = offset;
    node.setNeedsUpdate();
  }

  flattenAnimatedNodeOffset(nodeTag: number) {
    const node = this.animationNodes[nodeTag];
    if (!(node instanceof RCTValueAnimatedNode)) {
      console.error("Not a value node.");
      return;
    }
    node.flattenOffset();
  }

  extractAnimatedNodeOffset(nodeTag: number) {
    const node = this.animationNodes[nodeTag];
    if (!(node instanceof RCTValueAnimatedNode)) {
      console.error("Not a value node.");
      return;
    }
    node.extractOffset();
  }

  // -- Drivers

  startAnimatingNode(
    animationId: number,
    nodeTag: number,
    config: Config,
    endCallback: ?Function
  ) {
    const valueNode = this.animationNodes[nodeTag];
    invariant(
      valueNode instanceof RCTValueAnimatedNode,
      `Animation Node of id ${nodeTag} is not a ValueAnimatedNode`
    );

    const AnimationDriverClass = DRIVER_TYPE_MAP[config.type];
    if (AnimationDriverClass == null) {
      console.error(`Unsupported animation type: ${config.type}`);
      return;
    }

    const animationDriver = new AnimationDriverClass(
      animationId,
      config,
      valueNode,
      endCallback
    );

    this.activeAnimations.add(animationDriver);
    animationDriver.startAnimation();
    this.startAnimationLoopIfNeeded();
  }

  stopAnimation(animationId: number) {
    for (let driver of this.activeAnimations) {
      if (driver.animationId === animationId) {
        driver.stopAnimation();
        this.activeAnimations.delete(driver);
        break;
      }
    }
  }

  stopAnimationsForNode(node: RCTAnimatedNode) {
    const discarded: RCTAnimationDriver[] = [];
    this.activeAnimations.forEach((driver) => {
      if (driver.valueNode === node) {
        discarded.push(driver);
      }
    });

    discarded.forEach((driver) => {
      driver.stopAnimation();
      this.activeAnimations.delete(driver);
    });
  }

  // -- Events

  addAnimatedEventToView(
    viewTag: number,
    eventName: string,
    eventMapping: Object
  ) {
    const nodeTag: number = eventMapping.animatedValueTag;
    const node = this.animationNodes[nodeTag];

    if (!node) {
      console.error(`Animated node with tag ${nodeTag} does not exist`);
      return;
    }

    if (!(node instanceof RCTValueAnimatedNode)) {
      console.error(
        "Animated node connected to event should be of type RCTValueAnimatedNode"
      );
      return;
    }

    const eventPath: string[] = eventMapping.nativeEventPath;

    const driver = new RCTEventAnimation(eventPath, node);

    const key = `${viewTag}${eventName}`;
    if (this.eventDrivers[key] != null) {
      this.eventDrivers[key].push(driver);
    } else {
      this.eventDrivers[key] = [driver];
    }
  }

  removeAnimatedEventFromView(
    viewTag: number,
    eventName: string,
    animatedNodeTag: number
  ) {
    const key = `${viewTag}${eventName}`;
    if (this.eventDrivers[key] != null) {
      if (this.eventDrivers[key].length === 1) {
        delete this.eventDrivers[key];
      } else {
        const driversForKey = this.eventDrivers[key];
        for (let i = 0; i < driversForKey.length; i++) {
          if (driversForKey[i].valueNode.nodeTag === animatedNodeTag) {
            this.eventDrivers[key].splice(i, 1);
            break;
          }
        }
      }
    }
  }

  handleAnimatedEvent(event: RCTEvent) {
    if (Object.keys(this.eventDrivers).length === 0) {
      return;
    }

    const key = `${event.viewTag}${event.eventName}`;
    const driversForKey = this.eventDrivers[key];

    if (driversForKey) {
      for (let driver of driversForKey) {
        this.stopAnimationsForNode(driver.valueNode);
        driver.updateWithEvent(event);
      }

      this.updateAnimations();
    }
  }

  // -- Listeners

  startListeningToAnimatedNodeValue(
    tag: number,
    valueObserver: RCTValueAnimatedNodeObserver
  ) {
    const node = this.animationNodes[tag];
    if (node instanceof RCTValueAnimatedNode) {
      node.valueObserver = valueObserver;
    }
  }

  stopListeningToAnimatedNodeValue(tag: number) {
    const node = this.animationNodes[tag];
    if (node instanceof RCTValueAnimatedNode) {
      node.valueObserver = null;
    }
  }

  // -- Animation Loop
  // TODO: Don't hook into RAF and instead declaritively use WAAPI

  startAnimationLoopIfNeeded() {
    if (!this.ticking && this.activeAnimations.size > 0) {
      window.requestAnimationFrame(this.stepAnimations.bind(this));
      this.ticking = true;
    }
  }

  stepAnimations(timestamp: number) {
    for (let animationDriver of this.activeAnimations) {
      animationDriver.stepAnimationWithTime(timestamp);
    }

    this.updateAnimations();

    for (let animationDriver of this.activeAnimations) {
      if (animationDriver.animationHasFinished) {
        animationDriver.stopAnimation();
        this.activeAnimations.delete(animationDriver);
      }
    }

    this.stopAnimationLoopIfNeeded();
  }

  stopAnimationLoopIfNeeded() {
    this.ticking = false;

    // If there are still active animations continue to next frame
    if (this.activeAnimations.size !== 0) {
      this.startAnimationLoopIfNeeded();
    }
  }

  // -- Updates

  updateAnimations() {
    // $FlowFixMe
    Object.values(this.animationNodes).forEach((node: RCTAnimatedNode) => {
      if (node.needsUpdate) {
        node.updateNodeIfNecessary();
      }
    });
  }
}

export default RCTNativeAnimatedNodesManager;
