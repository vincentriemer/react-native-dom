/** @flow */

import type { Config } from "RCTNativeAnimatedModule";
import RCTAnimatedNode from "RCTAnimatedNode";
import RCTStyleAnimatedNode from "RCTStyleAnimatedNode";
import RCTValueAnimatedNode from "RCTValueAnimatedNode";

class RCTPropsAnimatedNode extends RCTAnimatedNode {
  connectedViewTag: ?number;
  connectedViewName: ?string;
  uiManager: ?*;
  propsDictionary: { [propName: string]: any };

  constructor(tag: number, config: Config) {
    super(tag, config);
    this.propsDictionary = {};
  }

  connectToView(viewTag: number, viewName: string, uiManager: *) {
    this.connectedViewTag = viewTag;
    this.connectedViewName = viewName;
    this.uiManager = uiManager;
  }

  disconnectFromView(viewTag: number) {
    // Restore the default value for all props that were modified by this node.
    for (let key of Object.keys(this.propsDictionary)) {
      this.propsDictionary[key] = null;
    }

    if (
      Object.keys(this.propsDictionary).length &&
      this.connectedViewTag &&
      this.connectedViewName &&
      this.uiManager
    ) {
      this.uiManager.synchronouslyUpdateView(
        this.connectedViewTag,
        this.connectedViewName,
        this.propsDictionary
      );
    }

    this.connectedViewTag = null;
    this.connectedViewName = null;
    this.uiManager = null;
  }

  performUpdate() {
    super.performUpdate();

    const connectedViewTag = this.connectedViewTag;
    if (!connectedViewTag) {
      return;
    }

    this.parentNodes &&
      Object.entries(this.parentNodes).forEach(([parentTag, parentNode]) => {
        if (parentNode instanceof RCTStyleAnimatedNode) {
          this.propsDictionary = {
            ...this.propsDictionary,
            ...parentNode.propsDictionary
          };
        } else if (parentNode instanceof RCTValueAnimatedNode) {
          const property = this.propertyNameForParentTag(
            parseInt(parentTag, 10)
          );
          const value = parentNode.value;
          this.propsDictionary[property] = value;
        }
      });

    if (Object.keys(this.propsDictionary).length) {
      if (this.uiManager && this.connectedViewName && this.connectedViewTag) {
        this.uiManager.synchronouslyUpdateView(
          this.connectedViewTag,
          this.connectedViewName,
          this.propsDictionary
        );
      }
    }
  }

  propertyNameForParentTag(parentTag: number): string {
    for (let [property, tag] of Object.entries(this.config.props)) {
      if (tag === parentTag) {
        return property;
      }
    }
    throw new Error("No tags found in props that match parentTag");
  }
}

export default RCTPropsAnimatedNode;
