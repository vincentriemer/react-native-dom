/**
 * @providesModule RCTNativeAnimatedNodesManager
 * @flow
 */

import type { Config } from "./RCTNativeAnimatedModule";
import type { RCTEvent } from "../../bridge/RCTEventDispatcher";

import invariant from "../../utils/Invariant";

import type { RCTAnimationDriver } from "./Drivers/RCTAnimationDriver";
import type { RCTValueAnimatedNodeObserver } from "./Nodes/RCTValueAnimatedNode";

// Nodes
import RCTAnimatedNode from "./Nodes/RCTAnimatedNode";
import RCTValueAnimatedNode from "./Nodes/RCTValueAnimatedNode";
import RCTPropsAnimatedNode from "./Nodes/RCTPropsAnimatedNode";
import RCTStyleAnimatedNode from "./Nodes/RCTStyleAnimatedNode";
import RCTInterpolationAnimatedNode from "./Nodes/RCTInterpolationAnimatedNode";
import RCTTransformAnimatedNode from "./Nodes/RCTTransformAnimatedNode";
import RCTMultiplicationAnimatedNode from "./Nodes/RCTMultiplicationAnimatedNode";
import RCTAdditionAnimatedNode from "./Nodes/RCTAdditionAnimatedNode";
import RCTModuloAnimatedNode from "./Nodes/RCTModuloAnimatedNode";
import RCTDivisionAnimatedNode from "./Nodes/RCTDivisionAnimatedNode";

// Drivers
import RCTEventAnimation from "./Drivers/RCTEventAnimation";
import RCTFrameAnimation from "./Drivers/RCTFrameAnimation";
import RCTDecayAnimation from "./Drivers/RCTDecayAnimation";
import RCTSpringAnimation from "./Drivers/RCTSpringAnimation";

import typeof _RCTUIManager from "../RCTUIManager";
type RCTUIManager = $Call<$await<_RCTUIManager>>;

const NODE_TYPE_MAP: { [typeName: string]: Class<RCTAnimatedNode> } = {
  style: RCTStyleAnimatedNode,
  value: RCTValueAnimatedNode,
  props: RCTPropsAnimatedNode,
  interpolation: RCTInterpolationAnimatedNode,
  transform: RCTTransformAnimatedNode,
  multiplication: RCTMultiplicationAnimatedNode,
  addition: RCTAdditionAnimatedNode,
  modulus: RCTModuloAnimatedNode,
  division: RCTDivisionAnimatedNode
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
    endCallback: Function
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
