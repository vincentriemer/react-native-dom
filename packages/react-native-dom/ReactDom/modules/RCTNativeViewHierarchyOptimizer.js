// @flow

import invariant from "invariant";

import { LAYOUT_ONLY_PROPS } from "RCTShadowView";
import type RCTShadowView from "RCTShadowView";
import type UIManager from "RCTUIManager";

type NodeIndexPair = {
  node: RCTShadowView,
  index: number
};

const ENABLED = true;

class RCTNativeViewHierarchyOptimizer {
  manager: UIManager;
  tagsWithLayoutVisited: Set<number>;

  constructor(manager: UIManager) {
    this.manager = manager;
    this.tagsWithLayoutVisited = new Set();
  }

  get shadowViewRegistry() {
    return this.manager.shadowViewRegistry;
  }

  handleCreateView(node: RCTShadowView, initialProps: ?Object) {
    if (!ENABLED) {
      this.manager.createView(node.reactTag, node.viewName, initialProps);
      return;
    }

    const isLayoutOnly =
      node.viewName === "RCTView" &&
      this.isLayoutOnlyAndCollapsable(initialProps);

    node.isLayoutOnly = isLayoutOnly;

    if (!isLayoutOnly) {
      this.manager.createView(node.reactTag, node.viewName, initialProps);
    }
  }

  handleRemoveNode(node: RCTShadowView) {
    node.removeAllNativeChildren();
  }

  handleUpdateView(node: RCTShadowView, viewName: string, props: Object) {
    if (!ENABLED) {
      this.manager.updateView(node.reactTag, viewName, props);
      return;
    }

    const needsToLeaveLayoutOnly =
      node.isLayoutOnly && !this.isLayoutOnlyAndCollapsable(props);

    if (needsToLeaveLayoutOnly) {
      this.transitionLayoutOnlyViewToNativeView(node, props);
    } else if (!node.isLayoutOnly) {
      this.manager.updateView(node.reactTag, viewName, props);
    }
  }

  handleManageChildren(
    nodeToManage: RCTShadowView,
    indicesToRemove: number[],
    tagsToRemove: number[],
    viewsToAdd: { tag: number, index: number }[],
    tagsToDelete: number[]
  ) {
    if (!ENABLED) {
      this.manager.manageChildren(
        nodeToManage.reactTag,
        indicesToRemove,
        viewsToAdd,
        tagsToDelete
      );
      return;
    }

    for (let i = 0; i < tagsToRemove.length; i++) {
      const tagToRemove = tagsToRemove[i];
      let shouldDelete = false;
      for (let j = 0; j < tagsToDelete.length; j++) {
        if (tagsToDelete[j] === tagToRemove) {
          shouldDelete = true;
          break;
        }
      }
      const nodeToRemove = this.shadowViewRegistry.get(tagToRemove);
      invariant(
        nodeToRemove,
        `No such shadow view found with tag ${tagToRemove}`
      );
      this.removeNodeFromParent(nodeToRemove, shouldDelete);
    }

    for (let i = 0; i < viewsToAdd.length; i++) {
      const view = viewsToAdd[i];
      const nodeToAdd = this.shadowViewRegistry.get(view.tag);
      invariant(nodeToAdd, `No such shadow view found with tag ${view.tag}`);
      this.addNodeToNode(nodeToManage, nodeToAdd, view.index);
    }
  }

  handleSetChildren(nodeToManage: RCTShadowView, childrenTags: number[]) {
    if (!ENABLED) {
      this.manager.setChildren(nodeToManage.reactTag, childrenTags);
    }

    for (let i = 0; i < childrenTags.length; i++) {
      const nodeToAdd = this.shadowViewRegistry.get(childrenTags[i]);
      invariant(nodeToAdd, `No such shadow view with tag ${childrenTags[i]}`);
      this.addNodeToNode(nodeToManage, nodeToAdd, i);
    }
  }

  handleUpdateLayout(node: RCTShadowView) {
    if (!ENABLED) {
      const layout = node.previousLayout;
      if (layout) this.manager.updateLayout(node.reactTag, layout);
      return;
    }
    this.applyLayoutBase(node);
  }

  onBatchComplete() {
    this.tagsWithLayoutVisited.clear();
  }

  walkUpUntilNonLayoutOnly(
    node: RCTShadowView,
    indexInNativeChildren: number
  ): ?NodeIndexPair {
    while (node.isLayoutOnly) {
      const parent = node.reactSuperview;
      if (parent == null) {
        return null;
      }

      indexInNativeChildren =
        indexInNativeChildren + parent.getNativeOffsetForChild(node);
      node = parent;
    }

    return { node, index: indexInNativeChildren };
  }

  addNodeToNode(parent: RCTShadowView, child: RCTShadowView, index: number) {
    let indexInNativeChildren = parent.getNativeOffsetForChild(
      parent.reactSubviews[index]
    );

    if (parent.isLayoutOnly) {
      const result = this.walkUpUntilNonLayoutOnly(
        parent,
        indexInNativeChildren
      );
      if (result == null) {
        return;
      }
      parent = result.node;
      indexInNativeChildren = result.index;
    }

    if (!child.isLayoutOnly) {
      this.addNonLayoutNode(parent, child, indexInNativeChildren);
    } else {
      this.addLayoutOnlyNode(parent, child, indexInNativeChildren);
    }
  }

  removeNodeFromParent(nodeToRemove: RCTShadowView, shouldDelete: boolean) {
    const nativeNodeToRemoveFrom = nodeToRemove.nativeParent;

    if (nativeNodeToRemoveFrom != null) {
      let index = nativeNodeToRemoveFrom.reactSubviews.indexOf(nodeToRemove);
      nativeNodeToRemoveFrom.removeNativeChild(nodeToRemove);
      this.manager.manageChildren(
        nativeNodeToRemoveFrom.reactTag,
        [index],
        null,
        shouldDelete ? [nodeToRemove.reactTag] : null
      );
    } else {
      for (let i = nodeToRemove.reactSubviews.length - 1; i >= 0; i--) {
        this.removeNodeFromParent(nodeToRemove.reactSubviews[i], shouldDelete);
      }
    }
  }

  addLayoutOnlyNode(
    nonLayoutOnlyNode: RCTShadowView,
    layoutOnlyNode: RCTShadowView,
    index: number
  ) {
    this.addGrandchildren(nonLayoutOnlyNode, layoutOnlyNode, index);
  }

  addNonLayoutNode(parent: RCTShadowView, child: RCTShadowView, index: number) {
    parent.addNativeChildAt(child, index);
    this.manager.manageChildren(
      parent.reactTag,
      null,
      [{ tag: child.reactTag, index }],
      null
    );
  }

  addGrandchildren(
    nativeParent: RCTShadowView,
    child: RCTShadowView,
    index: number
  ) {
    invariant(
      !nativeParent.isLayoutOnly,
      "Native parent cannot be a layoutOnly node"
    );

    // `child` can't hold native children. Add all of `child`'s children to `parent`.
    let currentIndex = index;
    for (let i = 0; i < child.reactSubviews.length; i++) {
      const grandchild = child.reactSubviews[i];
      invariant(
        grandchild.nativeParent == null,
        "Grandchild must not have native parent"
      );

      if (grandchild.isLayoutOnly) {
        // Adding this child could result in adding multiple native views
        const grandchildCountBefore = nativeParent.totalNativeChildren;
        this.addLayoutOnlyNode(nativeParent, grandchild, currentIndex);
        const grandchildCountAfter = nativeParent.totalNativeChildren;
        currentIndex += grandchildCountAfter - grandchildCountBefore;
      } else {
        this.addNonLayoutNode(nativeParent, grandchild, currentIndex);
        currentIndex++;
      }
    }
  }

  applyLayoutBase(node: RCTShadowView) {
    const tag = node.reactTag;
    if (this.tagsWithLayoutVisited.has(tag)) {
      return;
    }
    this.tagsWithLayoutVisited.add(tag);

    if (node.previousLayout == null) {
      return;
    }

    let x = node.previousLayout.left;
    let y = node.previousLayout.top;

    let parent = node.reactSuperview;

    if (parent) {
      while (parent != null && parent.isLayoutOnly) {
        const prevLayout = parent.previousLayout;
        invariant(prevLayout, "node has no layout calculated");
        // TODO(7854667): handle and test proper clipping
        x += prevLayout.left;
        y += prevLayout.top;

        parent = parent.reactSuperview;
      }
    }

    this.applyLayoutRecursive(node, x, y);
  }

  applyLayoutRecursive(toUpdate: RCTShadowView, x: number, y: number) {
    if (!toUpdate.isLayoutOnly && toUpdate.nativeParent != null) {
      const tag = toUpdate.reactTag;
      const layout = toUpdate.previousLayout;

      invariant(layout, `Node ${tag} has no layout calculated`);
      this.manager.updateLayout(tag, {
        left: x,
        top: y,
        width: layout.width,
        height: layout.height
      });
      return;
    }

    for (let i = 0; i < toUpdate.reactSubviews.length; i++) {
      const child = toUpdate.reactSubviews[i];
      const childTag = child.reactTag;
      if (this.tagsWithLayoutVisited.has(childTag)) {
        continue;
      }
      this.tagsWithLayoutVisited.add(childTag);

      const childLayout = child.previousLayout;
      invariant(childLayout, `Node ${childTag} has no layout calculated`);

      const childX = childLayout.left + x;
      const childY = childLayout.top + y;

      this.applyLayoutRecursive(child, childX, childY);
    }
  }

  transitionLayoutOnlyViewToNativeView(node: RCTShadowView, props: ?Object) {
    const parent = node.reactSuperview;
    if (parent == null) {
      node.isLayoutOnly = false;
      return;
    }

    // First, remove the node from its parent. This causes the parent to update its native children
    // count. The removeNodeFromParent call will cause all the view's children to be detached from
    // their native parent.
    const childIndex = parent.reactSubviews.indexOf(node);
    parent.removeReactSubview(node);
    this.removeNodeFromParent(node, false);

    node.isLayoutOnly = false;

    // Create the view since it doesn't exist in the native hierarchy yet
    this.manager.createView(node.reactTag, node.viewName, props);

    // Add the node and all its children as if we are adding a new nodes
    parent.insertReactSubviewAtIndex(node, childIndex);
    this.addNodeToNode(parent, node, childIndex);
    for (let i = 0; i < node.reactSubviews.length; i++) {
      this.addNodeToNode(node, node.reactSubviews[i], i);
    }

    // Update layouts since the children of the node were offset by its x/y position previously.
    // Bit of a hack: we need to update the layout of this node's children now that it's no longer
    // layout-only, but we may still receive more layout updates at the end of this batch that we
    // don't want to ignore.
    invariant(
      this.tagsWithLayoutVisited.size == 0,
      "Tried to calculate layout with nodes already visited"
    );
    this.applyLayoutBase(node);
    for (let i = 0; i < node.reactSubviews.length; i++) {
      this.applyLayoutBase(node.reactSubviews[i]);
    }
    this.tagsWithLayoutVisited.clear();
  }

  isPropLayoutOnly(map: Object, prop: string) {
    if (LAYOUT_ONLY_PROPS.includes(prop)) {
      return true;
    } else if (prop === "pointerEvents") {
      const value = map[prop];
      return value === "auto" || value === "box-none";
    }

    // TODO: Border Color/Width/Radius Checks
    switch (prop) {
      case "opacity":
        return map.opacity == null || map[prop] === 1;
      case "onLayout":
        return true;
      case "overflow":
        return map.overflow !== "hidden";
      default:
        return false;
    }
  }

  isLayoutOnlyAndCollapsable(props: ?Object) {
    if (props == null) return true;

    if (props.collapsable != null && !props.collapsable) return false;

    for (let propName of Object.keys(props)) {
      if (!this.isPropLayoutOnly(props, propName)) {
        return false;
      }
    }

    return true;
  }
}

export default RCTNativeViewHierarchyOptimizer;
