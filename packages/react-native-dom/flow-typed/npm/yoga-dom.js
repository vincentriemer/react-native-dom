declare module "yoga-dom" {
  declare opaque type AlignAuto;
  declare opaque type AlignFlexStart;
  declare opaque type AlignCenter;
  declare opaque type AlignFlexEnd;
  declare opaque type AlignBaseline;
  declare opaque type AlignSpaceBetween;
  declare opaque type AlignSpaceAround;
  declare type Align =
    | AlignAuto
    | AlignFlexStart
    | AlignCenter
    | AlignFlexEnd
    | AlignBaseline
    | AlignSpaceBetween
    | AlignSpaceAround;

  declare opaque type DimensionWidth;
  declare opaque type DimensionHeight;
  declare type Dimension = DimensionWidth | DimensionHeight;

  declare opaque type DirectionInherit;
  declare opaque type DirectionLTR;
  declare opaque type DirectionRTL;
  declare type Direction = DirectionInherit | DirectionLTR | DirectionRTL;

  declare opaque type DisplayFlex;
  declare opaque type DisplayNone;
  declare type Display = DisplayFlex | DisplayNone;

  declare opaque type FlexDirColumn;
  declare opaque type FlexDirColumnReverse;
  declare opaque type FlexDirRow;
  declare opaque type FlexDirRowReverse;
  declare type FlexDirection =
    | FlexDirColumn
    | FlexDirColumnReverse
    | FlexDirRow
    | FlexDirRowReverse;

  declare opaque type JustifyFlexStart;
  declare opaque type JustifyCenter;
  declare opaque type JustifyFlexEnd;
  declare opaque type JustifySpaceBetween;
  declare opaque type JustifySpaceAround;
  declare opaque type JustifySpaceEvenly;
  declare type Justify =
    | JustifyFlexStart
    | JustifyCenter
    | JustifyFlexEnd
    | JustifySpaceBetween
    | JustifySpaceAround
    | JustifySpaceEvenly;

  declare opaque type MeasureModeUndefined;
  declare opaque type MeasureModeExactly;
  declare opaque type MeasureModeAtMost;
  declare type MeasureMode =
    | MeasureModeUndefined
    | MeasureModeExactly
    | MeasureModeAtMost;

  declare opaque type OverflowVisible;
  declare opaque type OverflowHidden;
  declare opaque type OverflowScroll;
  declare type Overflow = OverflowVisible | OverflowHidden | OverflowScroll;

  declare opaque type PositionRelative;
  declare opaque type PositionAbsolute;
  declare type PositionType = PositionRelative | PositionAbsolute;

  declare opaque type UnitUndefined;
  declare opaque type UnitPoint;
  declare opaque type UnitPercent;
  declare opaque type UnitAuto;
  declare type Unit = UnitUndefined | UnitPoint | UnitPercent | UnitAuto;

  declare opaque type WrapNoWrap;
  declare opaque type WrapWrap;
  declare opaque type WrapWrapReverse;
  declare type Wrap = WrapNoWrap | WrapWrap | WrapWrapReverse;

  declare type YGSize = { width: number, height: number };
  declare type YGLayout = {
    top: number,
    left: number,
    width: number,
    height: number
  };
  declare type YGValue = {
    value: number,
    unit: Unit
  };

  declare type MeasureFunction = (
    width: number,
    widthMode: MeasureMode,
    height: number,
    heightMode: MeasureMode
  ) => YGSize;

  declare class YogaConfig {
    constructor(): YogaConfig;
    setPointScaleFactor(ratio: number): void;
  }

  declare class YogaNode {
    [propName: string]:
      | boolean
      | number
      | YGValue
      | Align
      | Direction
      | Display
      | FlexDirection
      | Justify
      | Overflow
      | PositionType
      | Unit
      | Wrap;

    constructor(): YogaNode;

    hasNewLayout: boolean;

    static createWithConfig(config: YogaConfig): YogaNode;

    insertChild(child: YogaNode, index: number): void;
    removeChild(child: YogaNode): void;
    getChildCount(): number;
    getParent(): ?YogaNode;
    getChild(index: number): ?YogaNode;

    setMeasureFunc(measureFunc: MeasureFunction): void;
    unsetMeasureFunc(): void;

    markDirty(): void;
    isDirty(): boolean;

    free(): void;
    freeRecursive(): void;

    calculateLayout(
      width: ?number,
      height: ?number,
      direction: ?Direction
    ): void;
    getComputedLayout(): YGLayout;
  }

  declare type YogaPropConstants = {
    align: {
      [string]: ?Align,
      auto: AlignAuto,
      "flex-start": AlignFlexStart,
      center: AlignCenter,
      "flex-end": AlignFlexEnd,
      baseline: AlignBaseline,
      "space-between": AlignSpaceBetween,
      "space-around": AlignSpaceAround
    },
    direction: {
      [string]: ?Direction,
      inherit: DirectionInherit,
      ltr: DirectionLTR,
      rtl: DirectionRTL
    },
    display: {
      [string]: ?Display,
      flex: DisplayFlex,
      none: DisplayNone
    },
    flexDirection: {
      [string]: ?FlexDirection,
      column: FlexDirColumn,
      "column-reverse": FlexDirColumnReverse,
      row: FlexDirRow,
      "row-reverse": FlexDirRowReverse
    },
    justify: {
      [string]: ?Justify,
      "flex-start": JustifyFlexStart,
      center: JustifyFlexStart,
      "flex-end": JustifyFlexEnd,
      "space-between": JustifySpaceBetween,
      "space-around": JustifySpaceAround,
      "space-evenly": JustifySpaceEvenly
    },
    overflow: {
      [string]: ?Overflow,
      visible: OverflowVisible,
      hidden: OverflowHidden,
      scroll: OverflowScroll
    },
    position: {
      [string]: ?PositionType,
      absolute: PositionAbsolute,
      relative: PositionRelative
    },
    wrap: {
      [string]: ?Wrap,
      nowrap: WrapNoWrap,
      wrap: WrapWrap,
      "wrap-reverse": WrapWrapReverse
    },
    undefinedValue: any
  };

  declare type YogaConstants = YogaPropConstants & {
    measureMode: {
      [string]: ?MeasureMode,
      undefined: MeasureModeUndefined,
      exactly: MeasureModeExactly,
      atMost: MeasureModeAtMost
    },

    unit: {
      [string]: ?Unit,
      undefined: UnitUndefined,
      point: UnitPoint,
      percent: UnitPercent,
      auto: UnitAuto
    }
  };

  declare export type Exports = {
    Node: typeof YogaNode,
    Config: typeof YogaConfig,
    Constants: YogaConstants
  };

  declare export type Node = YogaNode;
  declare export type Config = YogaConfig;
  declare export type Constants = YogaConstants;
  declare export type Module = Exports;
  declare export type PropEnumMap = $Values<YogaPropConstants>;
  declare export type Value = YGValue;

  declare export default Promise<Exports>;
}
