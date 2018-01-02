#include <emscripten/bind.h>

#include "../yoga/YGEnums.h"
#include "../yoga/YGNode.h"
#include "../yoga/Yoga.h"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(YGEnums) {
  // YGEnums ==========================================
  enum_<YGAlign>("YGAlign")
    .value("auto", YGAlignAuto)
    .value("flex-start", YGAlignFlexStart)
    .value("center", YGAlignCenter)
    .value("flex-end", YGAlignFlexEnd)
    .value("stretch", YGAlignStretch)
    .value("baseline", YGAlignBaseline)
    .value("space-between", YGAlignSpaceBetween)
    .value("space-around", YGAlignSpaceAround)
    ;
  
  enum_<YGDimension>("YGDimension")
    .value("width", YGDimensionWidth)
    .value("height", YGDimensionHeight)
    ;

  enum_<YGDirection>("YGDirection")
    .value("inherit", YGDirectionInherit)
    .value("ltr", YGDirectionLTR)
    .value("rtl", YGDirectionRTL)
    ;

  enum_<YGDisplay>("YGDisplay")
    .value("flex", YGDisplayFlex)
    .value("none", YGDisplayNone)
    ;

  enum_<YGEdge>("YGEdge")
    .value("left", YGEdgeLeft)
    .value("top", YGEdgeTop)
    .value("right", YGEdgeRight)
    .value("bottom", YGEdgeBottom)
    .value("start", YGEdgeStart)
    .value("end", YGEdgeEnd)
    .value("horizontal", YGEdgeHorizontal)
    .value("vertical", YGEdgeVertical)
    .value("all", YGEdgeAll)
    ;
  
  enum_<YGFlexDirection>("YGFlexDirection")
    .value("column", YGFlexDirectionColumn)
    .value("column-reverse", YGFlexDirectionColumnReverse)
    .value("row", YGFlexDirectionRow)
    .value("row-reverse", YGFlexDirectionRowReverse)
    ;

  enum_<YGJustify>("YGJustify")
    .value("flex-start", YGJustifyFlexStart)
    .value("center", YGJustifyCenter)
    .value("flex-end", YGJustifyFlexEnd)
    .value("space-between", YGJustifySpaceBetween)
    .value("space-around", YGJustifySpaceAround)
    .value("space-evenly", YGJustifySpaceEvenly)
    ;

  // TODO: YGLogLevel

  enum_<YGMeasureMode>("YGMeasureMode")
    .value("undefined", YGMeasureModeUndefined)
    .value("exactly", YGMeasureModeExactly)
    .value("atMost", YGMeasureModeExactly)
    ;

  enum_<YGNodeType>("YGNodeType")
    .value("default", YGNodeTypeDefault)
    .value("text", YGNodeTypeText)
    ;

  enum_<YGOverflow>("YGOverflow")
    .value("visible", YGOverflowVisible)
    .value("hidden", YGOverflowHidden)
    .value("scroll", YGOverflowScroll)
    ;

  enum_<YGPositionType>("YGPositionType")
    .value("relative", YGPositionTypeRelative)
    .value("absolute", YGPositionTypeAbsolute)
    ;
  
  enum_<YGUnit>("YGUnit")
    .value("undefined", YGUnitUndefined)
    .value("point", YGUnitPoint)
    .value("percent", YGUnitPercent)
    .value("auto", YGUnitAuto)
    ;

  enum_<YGWrap>("YGWrap")
    .value("no-wrap", YGWrapNoWrap)
    .value("wrap", YGWrapWrap)
    .value("wrap-reverse", YGWrapWrapReverse)
    ;
}