/** @flow */

import invariant from "invariant";

import type { Config } from "RCTNativeAnimatedModule";
import type RCTNativeAnimatedNodesManager from "RCTNativeAnimatedNodesManager";

class RCTAnimatedNode {
  nodeTag: number;
  needsUpdate: boolean;
  config: Config;
  manager: RCTNativeAnimatedNodesManager;

  childNodes: ?{ [nodeTag: number]: RCTAnimatedNode };
  parentNodes: ?{ [nodeTag: number]: RCTAnimatedNode };

  constructor(tag: number, config: Config) {
    this.nodeTag = tag;
    this.config = config;
  }

  addChild(child: ?RCTAnimatedNode) {
    if (!this.childNodes) {
      this.childNodes = {};
    }
    if (child) {
      this.childNodes[child.nodeTag] = child;
      child.onAttachedToNode(this);
    }
  }

  removeChild(child: RCTAnimatedNode) {
    if (!this.childNodes) {
      return;
    }
    if (child) {
      delete this.childNodes[child.nodeTag];
      child.onDetachedFromNode(this);
    }
  }

  onAttachedToNode(parent: RCTAnimatedNode) {
    if (!this.parentNodes) {
      this.parentNodes = {};
    }
    if (parent) {
      this.parentNodes[parent.nodeTag] = parent;
    }
  }

  onDetachedFromNode(parent: RCTAnimatedNode) {
    if (!this.parentNodes) {
      return;
    }
    if (parent) {
      delete this.parentNodes[parent.nodeTag];
    }
  }

  detachNode() {
    if (this.parentNodes) {
      Object.values(this.parentNodes).forEach((parent) => {
        // $FlowFixMe - Flow considers the return for Object.values to be Array<mixed>
        parent.removeChild(this);
      });
    }
    if (this.childNodes) {
      Object.values(this.childNodes).forEach((child) => {
        // $FlowFixMe - Flow considers the return for Object.values to be Array<mixed>
        this.removeChild(child);
      });
    }
  }

  setNeedsUpdate() {
    this.needsUpdate = true;
    if (this.childNodes) {
      Object.values(this.childNodes).forEach((child) => {
        // $FlowFixMe - Flow considers the return for Object.values to be Array<mixed>
        child.setNeedsUpdate();
      });
    }
  }

  updateNodeIfNecessary() {
    if (this.needsUpdate) {
      if (this.parentNodes) {
        Object.values(this.parentNodes).forEach((parent) => {
          // $FlowFixMe - Flow considers the return for Object.values to be Array<mixed>
          parent.updateNodeIfNecessary();
        });
      }
      this.performUpdate();
    }
  }

  performUpdate() {
    this.needsUpdate = false;
    // To be overidden by subclasses
    // This method is called on a node only if it has been marked for update
    // during the current update loop
  }
}

export default RCTAnimatedNode;
