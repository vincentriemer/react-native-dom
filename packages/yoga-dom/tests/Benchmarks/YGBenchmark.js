/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var ITERATIONS = 2000;

if (typeof Yoga.then === "function") {
  Yoga.then(run_benchmarks);
} else {
  run_benchmarks(Yoga);
}

function run_benchmarks(YogaModule) {
  var { Node, Constants, wrapMeasureFunction } = YogaModule;
  YGBENCHMARK("Stack with flex", function() {
    var root = new Node();
    root.width = { value: 100, unit: Constants.unit.point };
    root.height = { value: 100, unit: Constants.unit.point };

    var measureCounter = getMeasureCounter(Yoga);

    for (var i = 0; i < ITERATIONS; i++) {
      const child = new Node();
      child.setMeasureFunc(wrapMeasureFunction(measureCounter.inc));
      child.flex = 1;
      root.insertChild(child, 0);
    }

    root.calculateLayout(NaN, NaN, Constants.direction.ltr);
    root.freeRecursive();
  });

  YGBENCHMARK("Align stretch in undefined axis", function() {
    var root = new Node();

    var measureCounter = getMeasureCounter(Yoga);

    for (var i = 0; i < ITERATIONS; i++) {
      var child = new Node();
      child.setMeasureFunc(wrapMeasureFunction(measureCounter.inc));
      child.height = { value: 20, unit: Constants.unit.point };
      root.insertChild(child, 0);
    }

    root.calculateLayout(NaN, NaN, Constants.direction.ltr);
    root.freeRecursive();
  });

  YGBENCHMARK("Nested flex", function() {
    var root = new Node();

    var measureCounter = getMeasureCounter(Yoga);

    var iterations = Math.pow(ITERATIONS, 1 / 2);

    for (var i = 0; i < iterations; i++) {
      var child = new Node();
      child.flex = 1;
      root.insertChild(child, 0);

      for (var ii = 0; ii < iterations; ii++) {
        var grandChild = new Node();
        grandChild.setMeasureFunc(wrapMeasureFunction(measureCounter.inc));
        grandChild.flex = 1;
        child.insertChild(grandChild, 0);
      }
    }

    root.calculateLayout(NaN, NaN, Constants.direction.ltr);
    root.freeRecursive();
  });

  YGBENCHMARK("Huge nested layout", function() {
    var root = new Node();

    var iterations = Math.pow(ITERATIONS, 1 / 4);

    for (var i = 0; i < iterations; i++) {
      var child = new Node();
      child.flexGrow = 1;
      child.width = { value: 10, unit: Constants.unit.point };
      child.height = { value: 10, unit: Constants.unit.point };
      root.insertChild(child, 0);

      for (var ii = 0; ii < iterations; ii++) {
        var grandChild = new Node();
        grandChild.flexDirection = Constants.flexDirection.row;
        grandChild.flexGrow = 1;
        grandChild.width = { value: 10, unit: Constants.unit.point };
        grandChild.height = { value: 10, unit: Constants.unit.point };
        child.insertChild(grandChild, 0);

        for (var iii = 0; iii < iterations; iii++) {
          var grandGrandChild = new Node();
          grandGrandChild.flexGrow = 1;
          grandGrandChild.width = { value: 10, unit: Constants.unit.point };
          grandGrandChild.height = { value: 10, unit: Constants.unit.point };
          grandChild.insertChild(grandGrandChild, 0);

          for (var iiii = 0; iiii < iterations; iiii++) {
            var grandGrandGrandChild = new Node();
            grandGrandGrandChild.flexDirection = Constants.flexDirection.row;
            grandGrandGrandChild.flexGrow = 1;
            grandGrandGrandChild.width = {
              value: 10,
              unit: Constants.unit.point,
            };
            grandGrandGrandChild.height = {
              value: 10,
              unit: Constants.unit.point,
            };
            grandGrandChild.insertChild(grandGrandGrandChild, 0);
          }
        }
      }
    }

    root.calculateLayout(NaN, NaN, Constants.direction.ltr);
    root.freeRecursive();
  });
}
