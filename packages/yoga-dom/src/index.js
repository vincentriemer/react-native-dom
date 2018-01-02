import Yoga from "../build/yoga";

function patch(prototype, name, fn) {
  let original = prototype[name];

  prototype[name] = function(...args) {
    return fn.call(this, original, ...args);
  };
}

// Emscripten exports a "promise-like" function which, if
// you try to resolve via a mechanism that uses native promises,
// causes an infinite loop, so we manually resolve/wrap the call in
// a native promise
export default new Promise(function(resolve) {
  Yoga().then(function(Module) {
    patch(Module.YGNode.prototype, "free", function() {
      this.delete();
    });

    patch(Module.YGNode.prototype, "freeRecursive", function() {
      for (let t = 0, T = this.getChildCount(); t < T; ++t)
        this.getChild(0).freeRecursive();
      this.free();
    });

    resolve({
      Node: Module.YGNode,
      Config: Module.YGConfig,
      Constants: {
        align: Module.YGAlign,
        dimension: Module.YGDimension,
        direction: Module.YGDirection,
        display: Module.YGDisplay,
        edge: Module.YGEdge,
        flexDirection: Module.YGFlexDirection,
        justify: Module.YGJustify,
        measureMode: Module.YGMeasureMode,
        nodeType: Module.YGNodeType,
        overflow: Module.YGOverflow,
        positionType: Module.YGPositionType,
        unit: Module.YGUnit,
        wrap: Module.YGWrap,
        undefinedValue: Module.YGValueUndefined,
        autoValue: Module.YGValueAuto,
      },
      wrapMeasureFunction: function(measureFunction) {
        return Module.MeasureCallback.implement({ measure: measureFunction });
      },
    });
  });
});
