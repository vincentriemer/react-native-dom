/** @flow */

import invariant from "invariant";

import RCTModule from "RCTModule";
import type RCTBridge from "RCTBridge";
import type { RCTEvent } from "RCTEventDispatcher";
import type RCTValueAnimatedNode from "RCTValueAnimatedNode";
import RCTNativeAnimatedNodesManager from "RCTNativeAnimatedNodesManager";
import RCTEventEmitter from "RCTNativeEventEmitter";

export type Config = Object;
type AnimatedOperation = (nodesManager: RCTNativeAnimatedNodesManager) => void;

class RCTNativeAnimatedModule extends RCTEventEmitter {
  static moduleName = "RCTNativeAnimatedModule";

  bridge: RCTBridge;

  nodesManager: RCTNativeAnimatedNodesManager;
  operations: AnimatedOperation[];
  preOperations: AnimatedOperation[];

  constructor(bridge: RCTBridge) {
    super(bridge);

    this.bridge = bridge;
    this.nodesManager = new RCTNativeAnimatedNodesManager(
      this.bridge.uiManager
    );

    this.operations = [];
    this.preOperations = [];

    this.bridge.eventDispatcher.addDispatchObserver(this);
    this.bridge.uiManager.observerCoordinator.addObserver(this);
  }

  $createAnimatedNode(tag: number, config: Config) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.createAnimatedNode(tag, config);
    });
  }

  $connectAnimatedNodes(parentTag: number, childTag: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.connectAnimatedNodes(parentTag, childTag);
    });
  }

  $disconnectAnimatedNodes(parentTag: number, childTag: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.disconnectAnimatedNodes(parentTag, childTag);
    });
  }

  $startAnimatingNode(
    animationId: number,
    nodeTag: number,
    config: Config,
    endCallbackId: number
  ) {
    const endCallback = this.bridge.callbackFromId(endCallbackId);
    this.addOperationBlock((nodesManager) => {
      nodesManager.startAnimatingNode(
        animationId,
        nodeTag,
        config,
        endCallback
      );
    });
  }

  $stopAnimation(animationId: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.stopAnimation(animationId);
    });
  }

  $setAnimatedNodeValue(nodeTag: number, value: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.setAnimatedNodeValue(nodeTag, value);
    });
  }

  $setAnimatedNodeOffset(nodeTag: number, offset: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.setAnimatedNodeOffset(nodeTag, offset);
    });
  }

  $flattenAnimatedNodeOffset(nodeTag: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.flattenAnimatedNodeOffset(nodeTag);
    });
  }

  $extractAnimatedNodeOffset(nodeTag: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.extractAnimatedNodeOffset(nodeTag);
    });
  }

  $connectAnimatedNodeToView(nodeTag: number, viewTag: number) {
    const viewName = this.bridge.uiManager.viewNameForReactTag(viewTag);
    invariant(viewName, `No such viewName for react tag ${viewTag}`);
    this.addOperationBlock((nodesManager) => {
      nodesManager.connectAnimatedNodeToView(nodeTag, viewTag, viewName);
    });
  }

  $disconnectAnimatedNodeFromView(nodeTag: number, viewTag: number) {
    // Disconnecting a view also restores its default values so we have to make
    // sure this happens before views get updated with their new props. This is
    // why we enqueue this on the pre-operations queue.
    this.addPreOperationBlock((nodesManager) => {
      nodesManager.disconnectAnimatedNodeFromView(nodeTag, viewTag);
    });
  }

  $dropAnimatedNode(tag: number) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.dropAnimatedNode(tag);
    });
  }

  $startListeningToAnimatedNodeValue(tag: number) {
    const valueObserver = this;
    this.addOperationBlock((nodesManager) => {
      this.addListener("onAnimatedValueUpdate");
      nodesManager.startListeningToAnimatedNodeValue(tag, valueObserver);
    });
  }

  $stopListeningToAnimatedNodeValue(tag: number) {
    this.addOperationBlock((nodesManager) => {
      this.removeListener("onAnimatedValueUpdate");
      nodesManager.stopListeningToAnimatedNodeValue(tag);
    });
  }

  $addAnimatedEventToView(
    viewTag: number,
    eventName: string,
    eventMapping: Object
  ) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.addAnimatedEventToView(viewTag, eventName, eventMapping);
    });
  }

  $removeAnimatedEventFromView(
    viewTag: number,
    eventName: string,
    animatedNodeTag: number
  ) {
    this.addOperationBlock((nodesManager) => {
      nodesManager.removeAnimatedEventFromView(
        viewTag,
        eventName,
        animatedNodeTag
      );
    });
  }

  addOperationBlock(operation: AnimatedOperation) {
    this.operations.push(operation);
  }

  addPreOperationBlock(operation: AnimatedOperation) {
    this.preOperations.push(operation);
  }

  uiManagerWillFlushBlocks = (uiManager: *) => {
    if (this.preOperations.length === 0 && this.operations.length === 0) {
      return;
    }

    const preOperations = [...this.preOperations];
    this.preOperations = [];
    const operations = [...this.operations];
    this.operations = [];

    uiManager.prependUIBlock(() => {
      for (let operation of preOperations) {
        operation(this.nodesManager);
      }
    });

    uiManager.addUIBlock(() => {
      for (let operation of operations) {
        operation(this.nodesManager);
      }
      this.nodesManager.updateAnimations();
    });
  };

  supportedEvents() {
    return ["onAnimatedValueUpdate"];
  }

  animatedNodeDidUpdateValue(node: RCTValueAnimatedNode, value: number) {
    this.sendEventWithName("onAnimatedValueUpdate", {
      tag: node.nodeTag,
      value
    });
  }

  eventDispatcherWillDispatchEvent(event: RCTEvent) {
    this.nodesManager.handleAnimatedEvent(event);
  }
}

export default RCTNativeAnimatedModule;
