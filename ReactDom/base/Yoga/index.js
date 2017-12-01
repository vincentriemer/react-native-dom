/**
 * @providesModule yoga-js
 * @flow
 */

import Yoga from "@vincentriemer/yoga-layout";

/**
 * Value that can generally be represented as either a number, a unit suffixed string (i.e. "10px"), 
 * or in some cases a keyword (i.e. "auto") 
 */
declare type YGLiteralValue = string | number;

/**
 * Layout related style properties used to calculate layout.
 */
type NodeStyle = {
  left?: YGLiteralValue,
  right?: YGLiteralValue,
  top?: YGLiteralValue,
  bottom?: YGLiteralValue,

  alignContent?: string,
  alignItems?: string,
  alignSelf?: string,
  flexDirection?: string,
  flexWrap?: string,
  justifyContent?: string,

  margin?: YGLiteralValue,
  marginBottom?: YGLiteralValue,
  marginHorizontal?: YGLiteralValue,
  marginLeft?: YGLiteralValue,
  marginRight?: YGLiteralValue,
  marginTop?: YGLiteralValue,
  marginVertical?: YGLiteralValue,

  overflow?: string,
  display?: string,

  flex?: number,
  flexBasis?: number,
  flexGrow?: number,
  flexShrink?: number,

  width?: YGLiteralValue,
  height?: YGLiteralValue,

  minWidth?: YGLiteralValue,
  minHeight?: YGLiteralValue,

  maxWidth?: YGLiteralValue,
  maxHeight?: YGLiteralValue,

  borderWidth?: YGLiteralValue,
  borderWidthBottom?: YGLiteralValue,
  borderWidthHorizontal?: YGLiteralValue,
  borderWidthLeft?: YGLiteralValue,
  borderWidthRight?: YGLiteralValue,
  borderWidthTop?: YGLiteralValue,
  borderWidthVertical?: YGLiteralValue,

  padding?: YGLiteralValue,
  paddingBottom?: YGLiteralValue,
  paddingHorizontal?: YGLiteralValue,
  paddingLeft?: YGLiteralValue,
  paddingRight?: YGLiteralValue,
  paddingTop?: YGLiteralValue,
  paddingVertical?: YGLiteralValue,

  position?: string
};

/**
 * Calculated layout from style properties
 */
type YGLayoutResult = {
  left: number,
  right: number,
  top: number,
  bottom: number,
  width: number,
  height: number
};

type EnumMapping = { [string]: number };

type SetterMap = {
  [propName: string]: (
    node: YGNode,
    target: NodeStyle,
    property: string,
    value: any
  ) => boolean
};

type NodeEdgeSetter = (edge: YGEnum, value: YGLiteralValue) => void;

export const MEASURE_MODE_EXACTLY = Yoga.MEASURE_MODE_EXACTLY;
export const MEASURE_MODE_UNDEFINED = Yoga.MEASURE_MODE_UNDEFINED;
export const MEASURE_MODE_COUNT = Yoga.MEASURE_MODE_COUNT;
export const MEASURE_MODE_AT_MOST = Yoga.MEASURE_MODE_AT_MOST;

const BASE_NODE = Yoga.Node.create();

const positionEdgeMapping: EnumMapping = {
  left: Yoga.EDGE_LEFT,
  right: Yoga.EDGE_RIGHT,
  top: Yoga.EDGE_TOP,
  bottom: Yoga.EDGE_BOTTOM
};

const marginEdgeMapping: EnumMapping = {
  marginBottom: Yoga.EDGE_BOTTOM,
  marginHorizontal: Yoga.EDGE_HORIZONTAL,
  marginLeft: Yoga.EDGE_LEFT,
  marginRight: Yoga.EDGE_RIGHT,
  marginTop: Yoga.EDGE_TOP,
  marginVertical: Yoga.EDGE_VERTICAL
};

const paddingEdgeMapping: EnumMapping = {
  paddingBottom: Yoga.EDGE_BOTTOM,
  paddingHorizontal: Yoga.EDGE_HORIZONTAL,
  paddingLeft: Yoga.EDGE_LEFT,
  paddingRight: Yoga.EDGE_RIGHT,
  paddingTop: Yoga.EDGE_TOP,
  paddingVertical: Yoga.EDGE_VERTICAL
};

const borderEdgeMapping: EnumMapping = {
  borderBottomWdith: Yoga.EDGE_BOTTOM,
  borderLeftWidth: Yoga.EDGE_LEFT,
  borderRightWidth: Yoga.EDGE_RIGHT,
  borderTopWidth: Yoga.EDGE_TOP
};

const alignEnumMapping: EnumMapping = {
  auto: Yoga.ALIGN_AUTO,
  "flex-start": Yoga.ALIGN_FLEX_START,
  center: Yoga.ALIGN_CENTER,
  "flex-end": Yoga.ALIGN_FLEX_END,
  stretch: Yoga.ALIGN_STRETCH,
  baseline: Yoga.ALIGN_BASELINE,
  "space-between": Yoga.ALIGN_SPACE_BETWEEN,
  "space-around": Yoga.ALIGN_SPACE_AROUND
};

const flexDirectionEnumMapping: EnumMapping = {
  column: Yoga.FLEX_DIRECTION_COLUMN,
  "column-reverse": Yoga.FLEX_DIRECTION_COLUMN_REVERSE,
  row: Yoga.FLEX_DIRECTION_ROW,
  "row-reverse": Yoga.FLEX_DIRECTION_ROW_REVERSE
};

const flexWrapEnumMapping: EnumMapping = {
  nowrap: Yoga.WRAP_NO_WRAP,
  wrap: Yoga.WRAP_WRAP,
  "wrap-reverse": Yoga.WRAP_WRAP_REVERSE
};

const justifyContentEnumMapping: EnumMapping = {
  "flex-start": Yoga.JUSTIFY_FLEX_START,
  center: Yoga.JUSTIFY_CENTER,
  "flex-end": Yoga.JUSTIFY_FLEX_END,
  "space-between": Yoga.JUSTIFY_SPACE_BETWEEN,
  "space-around": Yoga.JUSTIFY_SPACE_AROUND
};

const overflowEnumMapping: EnumMapping = {
  visible: Yoga.OVERFLOW_VISIBLE,
  hidden: Yoga.OVERFLOW_HIDDEN,
  scroll: Yoga.OVERFLOW_SCROLL
};

const displayEnumMapping: EnumMapping = {
  flex: Yoga.DISPLAY_FLEX,
  none: Yoga.DISPLAY_NONE
};

const positionTypeEnumMapping: EnumMapping = {
  relative: Yoga.POSITION_TYPE_RELATIVE,
  absolute: Yoga.POSITION_TYPE_ABSOLUTE
};

function checkMappingValue(mapping: EnumMapping, value: mixed) {
  if (!mapping.hasOwnProperty(value) && value != null) {
    throw new Error("invalid value");
  }
}

const POSITION_PROPS = ["left", "right", "top", "bottom"];

function shorthandSetter(
  node: YGNode,
  target: NodeStyle,
  property: string,
  value: YGLiteralValue,
  nodeEdgeSetter: NodeEdgeSetter
) {
  if (typeof value === "string") {
    const valueList = value.split(" ");

    if (valueList.length < 1 || valueList.length > 4) return false;

    switch (valueList.length) {
      case 1: {
        nodeEdgeSetter(Yoga.EDGE_ALL, valueList[0]);
      }
      case 2: {
        nodeEdgeSetter(Yoga.EDGE_VERTICAL, valueList[0]);
        nodeEdgeSetter(Yoga.EDGE_HORIZONTAL, valueList[1]);
      }
      case 3: {
        nodeEdgeSetter(Yoga.EDGE_TOP, valueList[0]);
        nodeEdgeSetter(Yoga.EDGE_HORIZONTAL, valueList[1]);
        nodeEdgeSetter(Yoga.EDGE_BOTTOM, valueList[2]);
      }
      case 4: {
        nodeEdgeSetter(Yoga.EDGE_TOP, valueList[0]);
        nodeEdgeSetter(Yoga.EDGE_RIGHT, valueList[1]);
        nodeEdgeSetter(Yoga.EDGE_BOTTOM, valueList[2]);
        nodeEdgeSetter(Yoga.EDGE_BOTTOM, valueList[3]);
      }
    }

    return Reflect.set(target, property, value);
  } else if (typeof value === "number") {
    nodeEdgeSetter(Yoga.EDGE_ALL, value);
    return Reflect.set(target, property, value);
  } else {
    return false;
  }
}

function edgeSetters(edgeMapping: EnumMapping, nodeEdgeSetter: string) {
  return Object.keys(edgeMapping).reduce(
    (prev, propName) => ({
      ...prev,
      [propName]: (
        node: YGNode,
        target: NodeStyle,
        property: string,
        value: YGLiteralValue
      ) => {
        const edge = edgeMapping[property];
        return setterBase(
          node,
          target,
          property,
          value,
          nodeEdgeSetter,
          edge,
          value
        );
      }
    }),
    {}
  );
}

function setterBase(
  node: YGNode,
  target,
  property,
  value,
  setterName,
  ...setterArgs
) {
  const nodeSetter = (node: { [key: string]: ?Function })[setterName];
  if (typeof nodeSetter === "function") {
    nodeSetter.call(node, ...setterArgs);
    return Reflect.set(target, property, value);
  } else {
    return false;
  }
}

function valueSetter(setterName) {
  return (
    node: YGNode,
    target: NodeStyle,
    property: string,
    value: YGLiteralValue
  ) => setterBase(node, target, property, value, setterName, value);
}

function enumSetter(enumMapping: EnumMapping, setterName: string) {
  return (node: YGNode, target: NodeStyle, property: string, value: string) => {
    checkMappingValue(enumMapping, value);
    return setterBase(
      node,
      target,
      property,
      value,
      setterName,
      enumMapping[value]
    );
  };
}

function YGRemoveAllChildren(node: YGNode) {
  const childCount = node.getChildCount();
  for (let i = childCount - 1; i >= 0; i--) {
    node.removeChild(node.getChild(i));
  }
}

const styleSetterMap = {
  ...edgeSetters(positionEdgeMapping, "setPosition"),

  alignContent: enumSetter(alignEnumMapping, "setAlignContent"),
  alignItems: enumSetter(alignEnumMapping, "setAlignItems"),
  alignSelf: enumSetter(alignEnumMapping, "setAlignSelf"),
  flexDirection: enumSetter(flexDirectionEnumMapping, "setFlexDirection"),
  flexWrap: enumSetter(flexWrapEnumMapping, "setFlexWrap"),
  justifyContent: enumSetter(justifyContentEnumMapping, "setJustifyContent"),

  ...edgeSetters(marginEdgeMapping, "setMargin"),
  margin: (node: YGNode, ...args) =>
    shorthandSetter(node, ...args, node.setMargin.bind(node)),

  overflow: enumSetter(overflowEnumMapping, "setOverflow"),
  display: enumSetter(displayEnumMapping, "setDisplay"),

  flex: valueSetter("setFlex"),
  flexBasis: valueSetter("setFlexBasis"),
  flexGrow: valueSetter("setFlexGrow"),
  flexShrink: valueSetter("setFlexShrink"),

  width: valueSetter("setWidth"),
  height: valueSetter("setHeight"),

  minWidth: valueSetter("setMinWidth"),
  minHeight: valueSetter("setMinHeight"),

  maxWidth: valueSetter("setMaxHeight"),
  maxHeight: valueSetter("setMaxHeight"),

  ...edgeSetters(borderEdgeMapping, "setBorder"),
  borderWidth: (node: YGNode, ...args) =>
    shorthandSetter(node, ...args, node.setBorder.bind(node)),

  ...edgeSetters(paddingEdgeMapping, "setPadding"),
  padding: (node: YGNode, ...args) =>
    shorthandSetter(node, ...args, node.setPadding.bind(node)),

  position: enumSetter(positionTypeEnumMapping, "setPositionType")
};

const STYLE_PROPS = Object.keys(styleSetterMap);

function styleHandlerFactory(node: YGNode) {
  return {
    get(target: NodeStyle, name: string): ?YGLiteralValue {
      if (STYLE_PROPS.includes(name)) {
        return Reflect.get(target, name);
      } else {
        return undefined;
      }
    },
    set(target: NodeStyle, property: string, value: any): boolean {
      if (styleSetterMap.hasOwnProperty(property)) {
        return styleSetterMap[property](node, target, property, value);
      }
      return false;
    }
  };
}

export const GlobalConfig = Yoga.Config.create();

/**
 * Yoga layout node
 */
class YogaNode {
  /**
   * Private YGNode instance providing the native code to perform layout
   * @memberof YogaNode
   * @private
   */
  _node: YGNode;

  /**
   * Layout-related style properties which dictate the resulting layout
   * @memberof YogaNode
   */
  style: NodeStyle;

  /**
   * The calculated layout result.
   * @memberof YogaNode
   */
  +layout: YGLayoutResult;

  /**
   * The {@link YogaNode}'s children
   */
  children: Array<?YogaNode>;

  constructor() {
    this._node = Yoga.Node.createWithConfig(GlobalConfig);

    // this.children = Object.freeze([]);
    this.children = [];
    this.style = new Proxy({}, styleHandlerFactory(this._node));

    // return proxied instance
    return new Proxy(this, {
      get(target: YogaNode, name: string) {
        switch (name) {
          case "layout": {
            const {
              top,
              left,
              width,
              height
            } = target._node.getComputedLayout();
            return { top, left, width, height };
          }
          default: {
            return Reflect.get(target, name);
          }
        }
      },

      set(target: YogaNode, property: string, value: any) {
        if (property === "style") {
          if (typeof value === "object") {
            target._node.copyStyle(BASE_NODE);

            const processedValue = new Proxy(
              {},
              styleHandlerFactory(target._node)
            );

            Object.keys(value).forEach(propName => {
              processedValue[propName] = value[propName];
            });

            return Reflect.set(target, property, processedValue);
          } else {
            return false;
          }
        } else if (property === "children") {
          if (Array.isArray(value)) {
            Reflect.set(target, property, []);

            YGRemoveAllChildren(target._node);

            value.forEach((child, index) => {
              if (child instanceof YogaNode) {
                target._node.insertChild(child._node, index);
                target.children.push(child);
              }
            });

            Object.freeze(target.children);

            return true;
          } else {
            return false;
          }
        } else {
          return Reflect.set(target, property, value);
        }
      },

      ownKeys(target: YogaNode) {
        return ["style", "layout", "children"];
      },

      getOwnPropertyDescriptor(
        target: YogaNode,
        property: string
      ): void | Object {
        if (["style", "children"].includes(property)) {
          return Reflect.getOwnPropertyDescriptor(target, property);
        }

        if (property === "layout") {
          const { top, left, width, height } = target._node.getComputedLayout();
          return {
            configurable: true,
            enumerable: true,
            writable: false,
            value: {
              top,
              left,
              width,
              height
            }
          };
        }
      }
    });
  }

  /**
   * Recalculate the layout
   */
  calculateLayout(
    width?: YGLiteralValue,
    height?: YGLiteralValue,
    direction?: YGEnum
  ): YGLayoutResult {
    return this._node.calculateLayout(width, height, direction);
  }

  /**
   * Insert a child at the specified index
   */
  insertChild(child: YogaNode, index: number) {
    this.children[index] = child;
    this._node.insertChild(child._node, index);
  }

  /**
   * Remove a child node
   */
  removeChild(child: YogaNode) {
    const childIndex = this.children.indexOf(child);
    this.children[childIndex] = undefined;
    this._node.removeChild(child._node);
  }

  /**
   * Get total number of children
   */
  getChildCount(): number {
    return this._node.getChildCount();
  }

  /**
   * Get the parent of the node
   */
  getParent(): YGNode {
    return this._node.getParent();
  }

  /**
   * Get a child at a given index of a node
   */
  getChild(index: number): YGNode {
    return this._node.getChild(index);
  }

  /**
   * Purge the node and it's memory
   */
  free() {
    this._node.free();
  }

  /**
   * Pure the node and all it's children recursively.
   */
  freeRecursive() {
    this._node.freeRecursive();
  }

  /**
   * Set the measure function used for nodes who's dimensions are determined outside
   * of Yoga
   */
  setMeasureFunc(func: YGMeasureFunc) {
    this._node.setMeasureFunc(func);
  }

  /**
   * Clear the node's measure function
   */
  unsetMeasureFunc() {
    this._node.unsetMeasureFunc();
  }

  /**
   * Explicitly mark the node as dirty
   */
  markDirty() {
    this._node.markDirty();
  }

  /**
   * Get the dirtiness of the node.
   */
  isDirty(): boolean {
    return this._node.isDirty();
  }
}

export default YogaNode;
