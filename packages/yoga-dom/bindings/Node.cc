/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#include <algorithm>
#include <emscripten/bind.h>

#include "../yoga/Yoga.h"

#include "./Layout.hh"
#include "./Config.hh"
#include "./Node.hh"

static YGSize globalMeasureFunc(YGNodeRef nodeRef, float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode)
{
  Node const &node = *reinterpret_cast<Node const *>(YGNodeGetContext(nodeRef));

  YGSize size = node.callMeasureFunc(width, widthMode, height, heightMode);

  return size;
}

/* static */ Node *Node::createDefault(void)
{
  return new Node(nullptr);
}

/* static */ Node *Node::createWithConfig(Config *config)
{
  return new Node(config);
}

/* static */ void Node::destroy(Node *node)
{
  delete node;
}

/* static */ Node *Node::fromYGNode(YGNodeRef nodeRef)
{
  return reinterpret_cast<Node *>(YGNodeGetContext(nodeRef));
}

Node::Node(Config *config)
    : m_node(config != nullptr ? YGNodeNewWithConfig(config->m_config) : YGNodeNew()), m_measureCb(nullptr)
{
  YGNodeSetContext(m_node, reinterpret_cast<void *>(this));
}

Node::~Node(void)
{
  YGNodeFree(m_node);
}

void Node::reset(void)
{
  m_measureCb.reset(nullptr);
  YGNodeReset(m_node);
}

void Node::copyStyle(Node const &other)
{
  YGNodeCopyStyle(m_node, other.m_node);
}

void Node::insertChild(Node *child, unsigned index)
{
  YGNodeInsertChild(m_node, child->m_node, index);
}

void Node::removeChild(Node *child)
{
  YGNodeRemoveChild(m_node, child->m_node);
}

unsigned Node::getChildCount(void) const
{
  return YGNodeGetChildCount(m_node);
}

Node *Node::getParent(void)
{
  auto nodePtr = YGNodeGetParent(m_node);

  if (nodePtr == nullptr)
    return nullptr;

  return Node::fromYGNode(nodePtr);
}

Node *Node::getChild(unsigned index)
{
  auto nodePtr = YGNodeGetChild(m_node, index);

  if (nodePtr == nullptr)
    return nullptr;

  return Node::fromYGNode(nodePtr);
}

void Node::setMeasureFunc(MeasureCallback *measureCb)
{
  m_measureCb.reset(measureCb);
  YGNodeSetMeasureFunc(m_node, &globalMeasureFunc);
}

void Node::unsetMeasureFunc(void)
{
  m_measureCb.reset(nullptr);
  YGNodeSetMeasureFunc(m_node, nullptr);
}

YGSize Node::callMeasureFunc(float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode) const
{
  return m_measureCb->measure(width, widthMode, height, heightMode);
}

void Node::markDirty(void)
{
  YGNodeMarkDirty(m_node);
}

bool Node::isDirty(void) const
{
  return YGNodeIsDirty(m_node);
}

void Node::calculateLayout(float width, float height, YGDirection direction)
{
  YGNodeCalculateLayout(m_node, width, height, direction);
}

Layout Node::getComputedLayout(void) const
{
  Layout layout;

  layout.left = YGNodeLayoutGetLeft(m_node);
  layout.top = YGNodeLayoutGetTop(m_node);

  layout.width = YGNodeLayoutGetWidth(m_node);
  layout.height = YGNodeLayoutGetHeight(m_node);

  return layout;
}

#define NODE_STYLE_PROPERTY_SETTER_IMPL(type, name, paramName) \
  void Node::set##name(const type paramName)                   \
  {                                                            \
    YGNodeStyleSet##name(m_node, paramName);                   \
  }

#define NODE_STYLE_PROPERTY_IMPL(type, name, paramName)  \
  NODE_STYLE_PROPERTY_SETTER_IMPL(type, name, paramName) \
                                                         \
  type Node::get##name(void) const                       \
  {                                                      \
    return YGNodeStyleGet##name(m_node);                 \
  }

#define NODE_STYLE_PROPERTY_SETTER_UNIT_IMPL(name, paramName) \
  void Node::set##name(const YGValue paramName)               \
  {                                                           \
    switch (paramName.unit)                                   \
    {                                                         \
    case YGUnitPercent:                                       \
    {                                                         \
      YGNodeStyleSet##name##Percent(m_node, paramName.value); \
      break;                                                  \
    }                                                         \
    case YGUnitPoint:                                         \
    {                                                         \
      YGNodeStyleSet##name(m_node, paramName.value);          \
      break;                                                  \
    }                                                         \
    default:                                                  \
    {                                                         \
      break;                                                  \
    }                                                         \
    }                                                         \
  }

#define NODE_STYLE_PROPERTY_SETTER_UNIT_AUTO_IMPL(name, paramName) \
  void Node::set##name(const YGValue paramName)                    \
  {                                                                \
    switch (paramName.unit)                                        \
    {                                                              \
    case YGUnitAuto:                                               \
    {                                                              \
      YGNodeStyleSet##name##Auto(m_node);                          \
      break;                                                       \
    }                                                              \
    case YGUnitPercent:                                            \
    {                                                              \
      YGNodeStyleSet##name##Percent(m_node, paramName.value);      \
      break;                                                       \
    }                                                              \
    case YGUnitPoint:                                              \
    {                                                              \
      YGNodeStyleSet##name(m_node, paramName.value);               \
      break;                                                       \
    }                                                              \
    default:                                                       \
    {                                                              \
      break;                                                       \
    }                                                              \
    }                                                              \
  }

#define NODE_STYLE_PROPERTY_UNIT_IMPL(name, paramName)   \
  NODE_STYLE_PROPERTY_SETTER_UNIT_IMPL(name, paramName); \
                                                         \
  YGValue Node::get##name(void) const                    \
  {                                                      \
    return YGNodeStyleGet##name(m_node);                 \
  }

#define NODE_STYLE_PROPERTY_UNIT_AUTO_IMPL(name, paramName)   \
  NODE_STYLE_PROPERTY_SETTER_UNIT_AUTO_IMPL(name, paramName); \
                                                              \
  YGValue Node::get##name(void) const                         \
  {                                                           \
    return YGNodeStyleGet##name(m_node);                      \
  }

#define NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, methodName, name, paramName, edge) \
  void Node::set##methodName(const type paramName)                   \
  {                                                                  \
    YGNodeStyleSet##name(m_node, edge, paramName);                   \
  }                                                                  \
  type Node::get##methodName(void) const                             \
  {                                                                  \
    return YGNodeStyleGet##name(m_node, edge);                       \
  }

#define NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(methodName, name, paramName, edge) \
  void Node::set##methodName(const YGValue paramName)                              \
  {                                                                                \
    switch (paramName.unit)                                                        \
    {                                                                              \
      case YGUnitPercent:                                                          \
      {                                                                            \
        YGNodeStyleSet##name##Percent(m_node, edge, paramName.value);              \
        break;                                                                     \
      }                                                                            \
      case YGUnitPoint:                                                            \
      {                                                                            \
        YGNodeStyleSet##name(m_node, edge, paramName.value);                       \
        break;                                                                     \
      }                                                                            \
      default:                                                                     \
      {                                                                            \
        break;                                                                     \
      }                                                                            \
    }                                                                              \
  }                                                                                \
  YGValue Node::get##methodName(void) const                                        \
  {                                                                                \
    return YGNodeStyleGet##name(m_node, edge);                                     \
  }

#define NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(methodName, name, paramName, edge) \
  void Node::set##methodName(const YGValue paramName)                                   \
  {                                                                                     \
    switch (paramName.unit)                                                             \
    {                                                                                   \
      case YGUnitAuto:                                                                  \
      {                                                                                 \
        YGNodeStyleSet##name##Auto(m_node, edge);                                       \
        break;                                                                          \
      }                                                                                 \
      case YGUnitPercent:                                                               \
      {                                                                                 \
        YGNodeStyleSet##name##Percent(m_node, edge, paramName.value);                   \
        break;                                                                          \
      }                                                                                 \
      case YGUnitPoint:                                                                 \
      {                                                                                 \
        YGNodeStyleSet##name(m_node, edge, paramName.value);                            \
        break;                                                                          \
      }                                                                                 \
      default:                                                                          \
      {                                                                                 \
        break;                                                                          \
      }                                                                                 \
    }                                                                                   \
  }                                                                                     \
  YGValue Node::get##methodName(void) const                                             \
  {                                                                                     \
    return YGNodeStyleGet##name(m_node, edge);                                          \
  }

#define NODE_STYLE_EDGE_PROPERTY_IMPL(type, name, paramName)                                                 \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Left, name, paramName##Left, YGEdgeLeft);                   \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Right, name, paramName##Right, YGEdgeRight);                \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Top, name, paramName##Top, YGEdgeTop);                      \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Bottom, name, paramName##Bottom, YGEdgeBottom);             \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Start, name, paramName##Start, YGEdgeStart);                \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##End, name, paramName##End, YGEdgeEnd);                      \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Horizontal, name, paramName##Horizontal, YGEdgeHorizontal); \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##Vertical, name, paramName##Vertical, YGEdgeVertical);       \
  NODE_STYLE_INDV_EDGE_PROPERTY_IMPL(type, name##All, name, paramName##All, YGEdgeAll);

#define NODE_STYLE_EDGE_PROPERTY_UNIT_IMPL(name, paramName)                                                 \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Left, name, paramName##Left, YGEdgeLeft);                   \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Right, name, paramName##Right, YGEdgeRight);                \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Top, name, paramName##Top, YGEdgeTop);                      \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Bottom, name, paramName##Bottom, YGEdgeBottom);             \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Start, name, paramName##Start, YGEdgeStart);                \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##End, name, paramName##End, YGEdgeEnd);                      \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Horizontal, name, paramName##Horizontal, YGEdgeHorizontal); \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##Vertical, name, paramName##Vertical, YGEdgeVertical);       \
  NODE_STYLE_INDV_EDGE_UNIT_PROPERTY_IMPL(name##All, name, paramName##All, YGEdgeAll);

#define NODE_STYLE_EDGE_PROPERTY_UNIT_AUTO_IMPL(name, paramName)                                                 \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Left, name, paramName##Left, YGEdgeLeft);                   \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Right, name, paramName##Right, YGEdgeRight);                \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Top, name, paramName##Top, YGEdgeTop);                      \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Bottom, name, paramName##Bottom, YGEdgeBottom);             \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Start, name, paramName##Start, YGEdgeStart);                \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##End, name, paramName##End, YGEdgeEnd);                      \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Horizontal, name, paramName##Horizontal, YGEdgeHorizontal); \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##Vertical, name, paramName##Vertical, YGEdgeVertical);       \
  NODE_STYLE_INDV_EDGE_UNIT_AUTO_PROPERTY_IMPL(name##All, name, paramName##All, YGEdgeAll);

NODE_STYLE_PROPERTY_IMPL(YGDirection, Direction, direction);
NODE_STYLE_PROPERTY_IMPL(YGFlexDirection, FlexDirection, flexDirection);
NODE_STYLE_PROPERTY_IMPL(YGJustify, JustifyContent, justifyContent);
NODE_STYLE_PROPERTY_IMPL(YGAlign, AlignContent, alignContent);
NODE_STYLE_PROPERTY_IMPL(YGAlign, AlignItems, alignItems);
NODE_STYLE_PROPERTY_IMPL(YGAlign, AlignSelf, alignSelf);
NODE_STYLE_PROPERTY_IMPL(YGPositionType, PositionType, positionType);
NODE_STYLE_PROPERTY_IMPL(YGWrap, FlexWrap, flexWrap);
NODE_STYLE_PROPERTY_IMPL(YGOverflow, Overflow, overflow);
NODE_STYLE_PROPERTY_IMPL(YGDisplay, Display, display);
NODE_STYLE_PROPERTY_IMPL(float, Flex, flex);

NODE_STYLE_EDGE_PROPERTY_UNIT_IMPL(Position, position);
NODE_STYLE_EDGE_PROPERTY_UNIT_AUTO_IMPL(Margin, margin);
NODE_STYLE_EDGE_PROPERTY_UNIT_IMPL(Padding, padding);
NODE_STYLE_EDGE_PROPERTY_IMPL(float, Border, border);

NODE_STYLE_PROPERTY_UNIT_AUTO_IMPL(Width, width);
NODE_STYLE_PROPERTY_UNIT_AUTO_IMPL(Height, height);
NODE_STYLE_PROPERTY_UNIT_IMPL(MinWidth, minWidth);
NODE_STYLE_PROPERTY_UNIT_IMPL(MinHeight, minHeight);
NODE_STYLE_PROPERTY_UNIT_IMPL(MaxWidth, maxWidth);
NODE_STYLE_PROPERTY_UNIT_IMPL(MaxHeight, maxHeight);

NODE_STYLE_PROPERTY_IMPL(float, AspectRatio, aspectRatio);

NODE_STYLE_PROPERTY_SETTER_IMPL(float, FlexGrow, flexGrow);
float Node::getFlexGrow() const { return NULL; } // yoga doesn't provide a getter
NODE_STYLE_PROPERTY_SETTER_IMPL(float, FlexShrink, flexShrink);
float Node::getFlexShrink() const { return NULL; } // yoga doesn't provide a getter
NODE_STYLE_PROPERTY_UNIT_AUTO_IMPL(FlexBasis, flexBasis);

using namespace emscripten;

#define EMBIND_NODE_PROP_BINDING(exposedName, propName) \
  .property(#exposedName, &Node::get##propName, &Node::set##propName)

#define EMBIND_NODE_EDGE_PROP_BINDING(exposedName, propName)               \
  EMBIND_NODE_PROP_BINDING(exposedName##Left, propName##Left)              \
  EMBIND_NODE_PROP_BINDING(exposedName##Right, propName##Right)            \
  EMBIND_NODE_PROP_BINDING(exposedName##Top, propName##Top)                \
  EMBIND_NODE_PROP_BINDING(exposedName##Bottom, propName##Bottom)          \
  EMBIND_NODE_PROP_BINDING(exposedName##Start, propName##Start)            \
  EMBIND_NODE_PROP_BINDING(exposedName##End, propName##End)                \
  EMBIND_NODE_PROP_BINDING(exposedName##Horizontal, propName##Horizontal)  \
  EMBIND_NODE_PROP_BINDING(exposedName##Vertical, propName##Vertical)      \
  EMBIND_NODE_PROP_BINDING(exposedName, propName##All)

EMSCRIPTEN_BINDINGS(YGNode)
{
  class_<MeasureCallback>("MeasureCallback")
    .function("measure", &MeasureCallback::measure, pure_virtual())
    .allow_subclass<MeasureCallbackWrapper>("MeasureCallbackWrapper")
    ;

  value_object<YGSize>("YGSize")
    .field("width", &YGSize::width)
    .field("height", &YGSize::height)
    ;

  value_object<YGValue>("YGValue")
    .field("value", &YGValue::value)
    .field("unit", &YGValue::unit)
    ;

  value_object<Layout>("YGLayout")
    .field("left", &Layout::left)
    .field("top", &Layout::top)
    .field("width", &Layout::width)
    .field("height", &Layout::height)
    ;

  // constant("YGValueUndefined", YGValueUndefined);
  // constant("YGValueAuto", YGValueAuto);

  class_<Node>("YGNode")
    .constructor<>(&Node::createDefault, allow_raw_pointers())

    .class_function("createWithConfig", &Node::createWithConfig, allow_raw_pointers())

    .function("insertChild", &Node::insertChild, allow_raw_pointers())
    .function("removeChild", &Node::removeChild, allow_raw_pointers())
    .function("getChildCount", &Node::getChildCount)
    .function("getParent", &Node::getParent, allow_raw_pointers())
    .function("getChild", &Node::getChild, allow_raw_pointers())

    .function("setMeasureFunc", &Node::setMeasureFunc, allow_raw_pointers())
    .function("unsetMeasureFunc", &Node::unsetMeasureFunc, allow_raw_pointers())

    .function("markDirty", &Node::markDirty)
    .function("isDirty", &Node::isDirty)

    .function("calculateLayout", &Node::calculateLayout)
    .function("getComputedLayout", &Node::getComputedLayout)
    
    EMBIND_NODE_PROP_BINDING(direction, Direction)
    EMBIND_NODE_PROP_BINDING(flexDirection, FlexDirection)
    EMBIND_NODE_PROP_BINDING(justifyContent, JustifyContent)
    EMBIND_NODE_PROP_BINDING(alignContent, AlignContent)
    EMBIND_NODE_PROP_BINDING(alignItems, AlignItems)
    EMBIND_NODE_PROP_BINDING(alignSelf, AlignSelf)
    EMBIND_NODE_PROP_BINDING(position, PositionType)
    EMBIND_NODE_PROP_BINDING(flexWrap, FlexWrap)
    EMBIND_NODE_PROP_BINDING(overflow, Overflow)
    EMBIND_NODE_PROP_BINDING(display, Display)
    EMBIND_NODE_PROP_BINDING(flex, Flex)
    EMBIND_NODE_PROP_BINDING(flexGrow, FlexGrow)
    EMBIND_NODE_PROP_BINDING(flexShrink, FlexShrink)
    EMBIND_NODE_PROP_BINDING(flexBasis, FlexBasis)

    EMBIND_NODE_PROP_BINDING(left, PositionLeft)
    EMBIND_NODE_PROP_BINDING(right, PositionRight)
    EMBIND_NODE_PROP_BINDING(top, PositionTop)
    EMBIND_NODE_PROP_BINDING(bottom, PositionBottom)
    EMBIND_NODE_PROP_BINDING(start, PositionStart)
    EMBIND_NODE_PROP_BINDING(end, PositionEnd)

    EMBIND_NODE_EDGE_PROP_BINDING(margin, Margin)
    EMBIND_NODE_EDGE_PROP_BINDING(padding, Padding)
    EMBIND_NODE_EDGE_PROP_BINDING(border, Border)

    EMBIND_NODE_PROP_BINDING(width, Width)
    EMBIND_NODE_PROP_BINDING(height, Height)
    EMBIND_NODE_PROP_BINDING(minWidth, MinWidth)
    EMBIND_NODE_PROP_BINDING(minHeight, MinHeight)
    EMBIND_NODE_PROP_BINDING(maxWidth, MaxWidth)
    EMBIND_NODE_PROP_BINDING(maxHeight, MaxHeight)

    EMBIND_NODE_PROP_BINDING(aspectRatio, AspectRatio)
    ;
}
