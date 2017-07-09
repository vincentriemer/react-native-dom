var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var seamlessImmutable = createCommonjsModule(function (module, exports) {
(function() {
  "use strict";

  // https://github.com/facebook/react/blob/v15.0.1/src/isomorphic/classic/element/ReactElement.js#L21
  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element');
  var REACT_ELEMENT_TYPE_FALLBACK = 0xeac7;

  function addPropertyTo(target, methodName, value) {
    Object.defineProperty(target, methodName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    });
  }

  function banProperty(target, methodName) {
    addPropertyTo(target, methodName, function() {
      throw new ImmutableError("The " + methodName +
        " method cannot be invoked on an Immutable data structure.");
    });
  }

  var immutabilityTag = "__immutable_invariants_hold";

  function addImmutabilityTag(target) {
    addPropertyTo(target, immutabilityTag, true);
  }

  function isImmutable(target) {
    if (typeof target === "object") {
      return target === null || Boolean(
        Object.getOwnPropertyDescriptor(target, immutabilityTag)
      );
    } else {
      // In JavaScript, only objects are even potentially mutable.
      // strings, numbers, null, and undefined are all naturally immutable.
      return true;
    }
  }

  function isEqual(a, b) {
    // Avoid false positives due to (NaN !== NaN) evaluating to true
    return (a === b || (a !== a && b !== b));
  }

  function isMergableObject(target) {
    return target !== null && typeof target === "object" && !(Array.isArray(target)) && !(target instanceof Date);
  }

  var mutatingObjectMethods = [
    "setPrototypeOf"
  ];

  var nonMutatingObjectMethods = [
    "keys"
  ];

  var mutatingArrayMethods = mutatingObjectMethods.concat([
    "push", "pop", "sort", "splice", "shift", "unshift", "reverse"
  ]);

  var nonMutatingArrayMethods = nonMutatingObjectMethods.concat([
    "map", "filter", "slice", "concat", "reduce", "reduceRight"
  ]);

  var mutatingDateMethods = mutatingObjectMethods.concat([
    "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds",
    "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes",
    "setUTCMonth", "setUTCSeconds", "setYear"
  ]);

  function ImmutableError(message) {
    var err       = new Error(message);
    // TODO: Consider `Object.setPrototypeOf(err, ImmutableError);`
    err.__proto__ = ImmutableError;

    return err;
  }
  ImmutableError.prototype = Error.prototype;

  function makeImmutable(obj, bannedMethods) {
    // Tag it so we can quickly tell it's immutable later.
    addImmutabilityTag(obj);

    if ("development" !== "production") {
      // Make all mutating methods throw exceptions.
      for (var index in bannedMethods) {
        if (bannedMethods.hasOwnProperty(index)) {
          banProperty(obj, bannedMethods[index]);
        }
      }

      // Freeze it and return it.
      Object.freeze(obj);
    }

    return obj;
  }

  function makeMethodReturnImmutable(obj, methodName) {
    var currentMethod = obj[methodName];

    addPropertyTo(obj, methodName, function() {
      return Immutable(currentMethod.apply(obj, arguments));
    });
  }

  function arraySet(idx, value, config) {
    var deep          = config && config.deep;

    if (idx in this) {
      if (deep && this[idx] !== value && isMergableObject(value) && isMergableObject(this[idx])) {
        value = this[idx].merge(value, {deep: true, mode: 'replace'});
      }
      if (isEqual(this[idx], value)) {
        return this;
      }
    }

    var mutable = asMutableArray.call(this);
    mutable[idx] = Immutable(value);
    return makeImmutableArray(mutable);
  }

  var immutableEmptyArray = Immutable([]);

  function arraySetIn(pth, value, config) {
    var head = pth[0];

    if (pth.length === 1) {
      return arraySet.call(this, head, value, config);
    } else {
      var tail = pth.slice(1);
      var thisHead = this[head];
      var newValue;

      if (typeof(thisHead) === "object" && thisHead !== null && typeof(thisHead.setIn) === "function") {
        // Might (validly) be object or array
        newValue = thisHead.setIn(tail, value);
      } else {
        var nextHead = tail[0];
        // If the next path part is a number, then we are setting into an array, else an object.
        if (nextHead !== '' && isFinite(nextHead)) {
          newValue = arraySetIn.call(immutableEmptyArray, tail, value);
        } else {
          newValue = objectSetIn.call(immutableEmptyObject, tail, value);
        }
      }

      if (head in this && thisHead === newValue) {
        return this;
      }

      var mutable = asMutableArray.call(this);
      mutable[head] = newValue;
      return makeImmutableArray(mutable);
    }
  }

  function makeImmutableArray(array) {
    // Don't change their implementations, but wrap these functions to make sure
    // they always return an immutable value.
    for (var index in nonMutatingArrayMethods) {
      if (nonMutatingArrayMethods.hasOwnProperty(index)) {
        var methodName = nonMutatingArrayMethods[index];
        makeMethodReturnImmutable(array, methodName);
      }
    }

    addPropertyTo(array, "flatMap",  flatMap);
    addPropertyTo(array, "asObject", asObject);
    addPropertyTo(array, "asMutable", asMutableArray);
    addPropertyTo(array, "set", arraySet);
    addPropertyTo(array, "setIn", arraySetIn);
    addPropertyTo(array, "update", update);
    addPropertyTo(array, "updateIn", updateIn);

    for(var i = 0, length = array.length; i < length; i++) {
      array[i] = Immutable(array[i]);
    }

    return makeImmutable(array, mutatingArrayMethods);
  }

  function makeImmutableDate(date) {
    addPropertyTo(date, "asMutable", asMutableDate);

    return makeImmutable(date, mutatingDateMethods);
  }

  function asMutableDate() {
    return new Date(this.getTime());
  }

  /**
   * Effectively performs a map() over the elements in the array, using the
   * provided iterator, except that whenever the iterator returns an array, that
   * array's elements are added to the final result instead of the array itself.
   *
   * @param {function} iterator - The iterator function that will be invoked on each element in the array. It will receive three arguments: the current value, the current index, and the current object.
   */
  function flatMap(iterator) {
    // Calling .flatMap() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    var result = [],
        length = this.length,
        index;

    for (index = 0; index < length; index++) {
      var iteratorResult = iterator(this[index], index, this);

      if (Array.isArray(iteratorResult)) {
        // Concatenate Array results into the return value we're building up.
        result.push.apply(result, iteratorResult);
      } else {
        // Handle non-Array results the same way map() does.
        result.push(iteratorResult);
      }
    }

    return makeImmutableArray(result);
  }

  /**
   * Returns an Immutable copy of the object without the given keys included.
   *
   * @param {array} keysToRemove - A list of strings representing the keys to exclude in the return value. Instead of providing a single array, this method can also be called by passing multiple strings as separate arguments.
   */
  function without(remove) {
    // Calling .without() with no arguments is a no-op. Don't bother cloning.
    if (typeof remove === "undefined" && arguments.length === 0) {
      return this;
    }

    if (typeof remove !== "function") {
      // If we weren't given an array, use the arguments list.
      var keysToRemoveArray = (Array.isArray(remove)) ?
         remove.slice() : Array.prototype.slice.call(arguments);

      // Convert numeric keys to strings since that's how they'll
      // come from the enumeration of the object.
      keysToRemoveArray.forEach(function(el, idx, arr) {
        if(typeof(el) === "number") {
          arr[idx] = el.toString();
        }
      });

      remove = function(val, key) {
        return keysToRemoveArray.indexOf(key) !== -1;
      };
    }

    var result = this.instantiateEmptyObject();

    for (var key in this) {
      if (this.hasOwnProperty(key) && remove(this[key], key) === false) {
        result[key] = this[key];
      }
    }

    return makeImmutableObject(result,
      {instantiateEmptyObject: this.instantiateEmptyObject});
  }

  function asMutableArray(opts) {
    var result = [], i, length;

    if(opts && opts.deep) {
      for(i = 0, length = this.length; i < length; i++) {
        result.push(asDeepMutable(this[i]));
      }
    } else {
      for(i = 0, length = this.length; i < length; i++) {
        result.push(this[i]);
      }
    }

    return result;
  }

  /**
   * Effectively performs a [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) over the elements in the array, expecting that the iterator function
   * will return an array of two elements - the first representing a key, the other
   * a value. Then returns an Immutable Object constructed of those keys and values.
   *
   * @param {function} iterator - A function which should return an array of two elements - the first representing the desired key, the other the desired value.
   */
  function asObject(iterator) {
    // If no iterator was provided, assume the identity function
    // (suggesting this array is already a list of key/value pairs.)
    if (typeof iterator !== "function") {
      iterator = function(value) { return value; };
    }

    var result = {},
        length = this.length,
        index;

    for (index = 0; index < length; index++) {
      var pair  = iterator(this[index], index, this),
          key   = pair[0],
          value = pair[1];

      result[key] = value;
    }

    return makeImmutableObject(result);
  }

  function asDeepMutable(obj) {
    if (
      (!obj) ||
      (typeof obj !== 'object') ||
      (!Object.getOwnPropertyDescriptor(obj, immutabilityTag)) ||
      (obj instanceof Date)
    ) { return obj; }
    return obj.asMutable({deep: true});
  }

  function quickCopy(src, dest) {
    for (var key in src) {
      if (Object.getOwnPropertyDescriptor(src, key)) {
        dest[key] = src[key];
      }
    }

    return dest;
  }

  /**
   * Returns an Immutable Object containing the properties and values of both
   * this object and the provided object, prioritizing the provided object's
   * values whenever the same key is present in both objects.
   *
   * @param {object} other - The other object to merge. Multiple objects can be passed as an array. In such a case, the later an object appears in that list, the higher its priority.
   * @param {object} config - Optional config object that contains settings. Supported settings are: {deep: true} for deep merge and {merger: mergerFunc} where mergerFunc is a function
   *                          that takes a property from both objects. If anything is returned it overrides the normal merge behaviour.
   */
  function merge(other, config) {
    // Calling .merge() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    if (other === null || (typeof other !== "object")) {
      throw new TypeError("Immutable#merge can only be invoked with objects or arrays, not " + JSON.stringify(other));
    }

    var receivedArray = (Array.isArray(other)),
        deep          = config && config.deep,
        mode          = config && config.mode || 'merge',
        merger        = config && config.merger,
        result;

    // Use the given key to extract a value from the given object, then place
    // that value in the result object under the same key. If that resulted
    // in a change from this object's value at that key, set anyChanges = true.
    function addToResult(currentObj, otherObj, key) {
      var immutableValue = Immutable(otherObj[key]);
      var mergerResult = merger && merger(currentObj[key], immutableValue, config);
      var currentValue = currentObj[key];

      if ((result !== undefined) ||
        (mergerResult !== undefined) ||
        (!currentObj.hasOwnProperty(key)) ||
        !isEqual(immutableValue, currentValue)) {

        var newValue;

        if (mergerResult) {
          newValue = mergerResult;
        } else if (deep && isMergableObject(currentValue) && isMergableObject(immutableValue)) {
          newValue = currentValue.merge(immutableValue, config);
        } else {
          newValue = immutableValue;
        }

        if (!isEqual(currentValue, newValue) || !currentObj.hasOwnProperty(key)) {
          if (result === undefined) {
            // Make a shallow clone of the current object.
            result = quickCopy(currentObj, currentObj.instantiateEmptyObject());
          }

          result[key] = newValue;
        }
      }
    }

    function clearDroppedKeys(currentObj, otherObj) {
      for (var key in currentObj) {
        if (!otherObj.hasOwnProperty(key)) {
          if (result === undefined) {
            // Make a shallow clone of the current object.
            result = quickCopy(currentObj, currentObj.instantiateEmptyObject());
          }
          delete result[key];
        }
      }
    }

    var key;

    // Achieve prioritization by overriding previous values that get in the way.
    if (!receivedArray) {
      // The most common use case: just merge one object into the existing one.
      for (key in other) {
        if (Object.getOwnPropertyDescriptor(other, key)) {
          addToResult(this, other, key);
        }
      }
      if (mode === 'replace') {
        clearDroppedKeys(this, other);
      }
    } else {
      // We also accept an Array
      for (var index = 0, length = other.length; index < length; index++) {
        var otherFromArray = other[index];

        for (key in otherFromArray) {
          if (otherFromArray.hasOwnProperty(key)) {
            addToResult(result !== undefined ? result : this, otherFromArray, key);
          }
        }
      }
    }

    if (result === undefined) {
      return this;
    } else {
      return makeImmutableObject(result,
        {instantiateEmptyObject: this.instantiateEmptyObject});
    }
  }

  function objectReplace(value, config) {
    var deep          = config && config.deep;

    // Calling .replace() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    if (value === null || typeof value !== "object") {
      throw new TypeError("Immutable#replace can only be invoked with objects or arrays, not " + JSON.stringify(value));
    }

    return this.merge(value, {deep: deep, mode: 'replace'});
  }

  var immutableEmptyObject = Immutable({});

  function objectSetIn(path, value, config) {
    var head = path[0];
    if (path.length === 1) {
      return objectSet.call(this, head, value, config);
    }

    var tail = path.slice(1);
    var newValue;
    var thisHead = this[head];

    if (this.hasOwnProperty(head) && typeof(thisHead) === "object" && thisHead !== null && typeof(thisHead.setIn) === "function") {
      // Might (validly) be object or array
      newValue = thisHead.setIn(tail, value);
    } else {
      newValue = objectSetIn.call(immutableEmptyObject, tail, value);
    }

    if (this.hasOwnProperty(head) && thisHead === newValue) {
      return this;
    }

    var mutable = quickCopy(this, this.instantiateEmptyObject());
    mutable[head] = newValue;
    return makeImmutableObject(mutable, this);
  }

  function objectSet(property, value, config) {
    var deep          = config && config.deep;

    if (this.hasOwnProperty(property)) {
      if (deep && this[property] !== value && isMergableObject(value) && isMergableObject(this[property])) {
        value = this[property].merge(value, {deep: true, mode: 'replace'});
      }
      if (isEqual(this[property], value)) {
        return this;
      }
    }

    var mutable = quickCopy(this, this.instantiateEmptyObject());
    mutable[property] = Immutable(value);
    return makeImmutableObject(mutable, this);
  }

  function update(property, updater) {
    var restArgs = Array.prototype.slice.call(arguments, 2);
    var initialVal = this[property];
    return this.set(property, updater.apply(initialVal, [initialVal].concat(restArgs)));
  }

  function getInPath(obj, path) {
    /*jshint eqnull:true */
    for (var i = 0, l = path.length; obj != null && i < l; i++) {
      obj = obj[path[i]];
    }

    return (i && i == l) ? obj : undefined;
  }

  function updateIn(path, updater) {
    var restArgs = Array.prototype.slice.call(arguments, 2);
    var initialVal = getInPath(this, path);

    return this.setIn(path, updater.apply(initialVal, [initialVal].concat(restArgs)));
  }

  function asMutableObject(opts) {
    var result = this.instantiateEmptyObject(), key;

    if(opts && opts.deep) {
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          result[key] = asDeepMutable(this[key]);
        }
      }
    } else {
      for (key in this) {
        if (this.hasOwnProperty(key)) {
          result[key] = this[key];
        }
      }
    }

    return result;
  }

  // Creates plain object to be used for cloning
  function instantiatePlainObject() {
    return {};
  }

  // Finalizes an object with immutable methods, freezes it, and returns it.
  function makeImmutableObject(obj, options) {
    var instantiateEmptyObject =
      (options && options.instantiateEmptyObject) ?
        options.instantiateEmptyObject : instantiatePlainObject;

    addPropertyTo(obj, "merge", merge);
    addPropertyTo(obj, "replace", objectReplace);
    addPropertyTo(obj, "without", without);
    addPropertyTo(obj, "asMutable", asMutableObject);
    addPropertyTo(obj, "instantiateEmptyObject", instantiateEmptyObject);
    addPropertyTo(obj, "set", objectSet);
    addPropertyTo(obj, "setIn", objectSetIn);
    addPropertyTo(obj, "update", update);
    addPropertyTo(obj, "updateIn", updateIn);

    return makeImmutable(obj, mutatingObjectMethods);
  }

  // Returns true if object is a valid react element
  // https://github.com/facebook/react/blob/v15.0.1/src/isomorphic/classic/element/ReactElement.js#L326
  function isReactElement(obj) {
    return typeof obj === 'object' &&
           obj !== null &&
           (obj.$$typeof === REACT_ELEMENT_TYPE_FALLBACK || obj.$$typeof === REACT_ELEMENT_TYPE);
  }

  function Immutable(obj, options, stackRemaining) {
    if (isImmutable(obj) || isReactElement(obj)) {
      return obj;
    } else if (Array.isArray(obj)) {
      return makeImmutableArray(obj.slice());
    } else if (obj instanceof Date) {
      return makeImmutableDate(new Date(obj.getTime()));
    } else {
      // Don't freeze the object we were given; make a clone and use that.
      var prototype = options && options.prototype;
      var instantiateEmptyObject =
        (!prototype || prototype === Object.prototype) ?
          instantiatePlainObject : (function() { return Object.create(prototype); });
      var clone = instantiateEmptyObject();

      if ("development" !== "production") {
        /*jshint eqnull:true */
        if (stackRemaining == null) {
          stackRemaining = 64;
        }
        if (stackRemaining <= 0) {
          throw new ImmutableError("Attempt to construct Immutable from a deeply nested object was detected." +
            " Have you tried to wrap an object with circular references (e.g. React element)?" +
            " See https://github.com/rtfeldman/seamless-immutable/wiki/Deeply-nested-object-was-detected for details.");
        }
        stackRemaining -= 1;
      }

      for (var key in obj) {
        if (Object.getOwnPropertyDescriptor(obj, key)) {
          clone[key] = Immutable(obj[key], undefined, stackRemaining);
        }
      }

      return makeImmutableObject(clone,
        {instantiateEmptyObject: instantiateEmptyObject});
    }
  }

  // Wrapper to allow the use of object methods as static methods of Immutable.
  function toStatic(fn) {
    function staticWrapper() {
      var args = [].slice.call(arguments);
      var self = args.shift();
      return fn.apply(self, args);
    }

    return staticWrapper;
  }

  // Wrapper to allow the use of object methods as static methods of Immutable.
  // with the additional condition of choosing which function to call depending
  // if argument is an array or an object.
  function toStaticObjectOrArray(fnObject, fnArray) {
    function staticWrapper() {
      var args = [].slice.call(arguments);
      var self = args.shift();
      if (Array.isArray(self)) {
          return fnArray.apply(self, args);
      } else {
          return fnObject.apply(self, args);
      }
    }

    return staticWrapper;
  }

  // Export the library
  Immutable.from           = Immutable;
  Immutable.isImmutable    = isImmutable;
  Immutable.ImmutableError = ImmutableError;
  Immutable.merge          = toStatic(merge);
  Immutable.replace        = toStatic(objectReplace);
  Immutable.without        = toStatic(without);
  Immutable.asMutable      = toStaticObjectOrArray(asMutableObject, asMutableArray);
  Immutable.set            = toStaticObjectOrArray(objectSet, arraySet);
  Immutable.setIn          = toStaticObjectOrArray(objectSetIn, arraySetIn);
  Immutable.update         = toStatic(update);
  Immutable.updateIn       = toStatic(updateIn);
  Immutable.flatMap        = toStatic(flatMap);
  Immutable.asObject       = toStatic(asObject);

  Object.freeze(Immutable);

  /* istanbul ignore if */
  if (typeof module === "object") {
    module.exports = Immutable;
  } else if (typeof exports === "object") {
    exports.Immutable = Immutable;
  } else if (typeof window === "object") {
    window.Immutable = Immutable;
  } else if (typeof commonjsGlobal === "object") {
    commonjsGlobal.Immutable = Immutable;
  }
})();
});

var ANIMATION_DEFAULTS = {
  looping: false,
  wait: 0
};

function animationValueReducer(animationValue, animation) {
  var currentIteration = animation.currentIteration,
      totalIterations = animation.totalIterations,
      easingFunction = animation.easingFunction,
      startValue = animation.startValue,
      changeInValue = animation.changeInValue;


  if (currentIteration < 0) {
    currentIteration = 0;
  } else if (currentIteration > totalIterations) {
    currentIteration = totalIterations;
  }

  return animationValue + easingFunction(currentIteration, startValue, changeInValue, totalIterations);
}

function calculateAnimationValue(animations) {
  return animations.reduce(animationValueReducer, 0);
}

function stepAnimation(timescale) {
  return function (animation) {
    var currentIteration = animation.currentIteration,
        totalIterations = animation.totalIterations,
        wait = animation.wait,
        delay = animation.delay,
        looping = animation.looping;


    if (currentIteration < totalIterations + wait) {
      return animation.merge({
        currentIteration: currentIteration + timescale
      });
    } else if (looping) {
      return animation.merge({
        currentIteration: 0 - delay
      });
    } else {
      return null;
    }
  };
}

function loopAnimation(chainOptions) {
  return function (animation) {
    return animation.merge({
      looping: true,
      wait: chainOptions.totalDuration - animation.delay - animation.totalIterations
    });
  };
}

function Animation (currentIteration, startValue, changeInValue, totalIterations, easingFunction, delay) {
  return seamlessImmutable.from({
    currentIteration: currentIteration,
    startValue: startValue,
    changeInValue: changeInValue,
    totalIterations: totalIterations,
    easingFunction: easingFunction,
    delay: delay,
    looping: ANIMATION_DEFAULTS.looping,
    wait: ANIMATION_DEFAULTS.wait
  });
}

function addAnimationToAttribute(animation) {
  return function (attribute) {
    return attribute.merge({
      animations: attribute.animations.concat([animation])
    });
  };
}

function mergeAttributes(target) {
  return function (source) {
    return source.merge({
      model: target.model,
      animations: source.animations.concat(target.animations)
    });
  };
}

function stepAttribute(timescale) {
  return function (attribute) {
    return attribute.merge({
      animations: attribute.animations.map(stepAnimation(timescale)).filter(function (anim) {
        return anim;
      })
    });
  };
}

function loopAttribute(chainOptions) {
  return function (attribute) {
    return attribute.merge({
      animations: attribute.animations.map(loopAnimation(chainOptions))
    });
  };
}

function calculateAttributeDisplayValue(attribute) {
  return attribute.model + calculateAnimationValue(attribute.animations);
}

function Attribute (model) {
  return seamlessImmutable.from({
    model: model,
    animations: seamlessImmutable.from([])
  });
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

// type InputObject<T> = { [key: string]: T };


function entries(obj) {
  var output = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _key = _step.value;

      output.push([_key, obj[_key]]);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return output;
}

function reduce(obj) {
  return function (callback, initialValue) {
    return entries(obj).reduce(function (output, _ref) {
      var _ref2 = slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      return callback(output, value, key);
    }, initialValue);
  };
}

function map(obj) {
  return function (callback) {
    return reduce(obj)(function (output, value, key) {
      return output.merge(defineProperty({}, key, callback(value)));
    }, seamlessImmutable.from({}));
  };
}

function addAttributeToElement(name, attribute) {
  return function (element) {
    return element.merge({
      attributes: element.attributes.merge(defineProperty({}, name, attribute))
    });
  };
}

function mergeElements(target) {
  return function (source) {
    return source.merge({
      attributes: reduce(target.attributes)(function (output, targetAttr, attrName) {
        var existingAttr = output[attrName];
        if (existingAttr != null) {
          return output.set(attrName, mergeAttributes(targetAttr)(existingAttr));
        } else {
          return output.set(attrName, targetAttr);
        }
      }, source.attributes)
    });
  };
}

function stepElement(timescale) {
  return function (element) {
    return element.merge({
      attributes: map(element.attributes)(stepAttribute(timescale))
    });
  };
}

function loopElement(chainOptions) {
  return function (element) {
    return element.merge({
      attributes: map(element.attributes)(loopAttribute(chainOptions))
    });
  };
}

function Element () {
  return seamlessImmutable.from({
    attributes: seamlessImmutable.from({})
  });
}

var HOOK_DEFAULTS = {
  looping: false,
  called: false,
  wait: 0
};

function stepHook(timescale) {
  return function (hook) {
    var output = hook.asMutable();

    if (output.currentIteration <= output.wait) {
      output.currentIteration = output.currentIteration + timescale;
    }

    if (output.currentIteration > 0 && !output.called) {
      output.hook();
      output.called = true;
    } else if (output.currentIteration === hook.currentIteration && output.looping) {
      output.currentIteration = 0 - output.delay;
      output.called = false;
    }

    return seamlessImmutable.from(output);
  };
}

function loopHook(chainOptions) {
  return function (hook) {
    return hook.merge({
      looping: true,
      wait: chainOptions.totalDuration - hook.delay
    });
  };
}

function Hook (hook, currentIteration, delay) {
  return seamlessImmutable.from(_extends({}, HOOK_DEFAULTS, {
    hook: hook, currentIteration: currentIteration, delay: delay
  }));
}

var PluginRegistry = function () {
  function PluginRegistry() {
    classCallCheck(this, PluginRegistry);

    this.renderRegistry = {};
    this.attributePluginMapping = {};
    this.timingPlugin = null;
  }

  createClass(PluginRegistry, [{
    key: 'addRenderPlugin',
    value: function addRenderPlugin(_ref) {
      var _this = this;

      var name = _ref.name,
          attributes = _ref.attributes,
          render = _ref.render;

      this.renderRegistry[name] = render;
      attributes.forEach(function (attribute) {
        if (_this.attributePluginMapping[attribute] == null) _this.attributePluginMapping[attribute] = [];
        _this.attributePluginMapping[attribute].push(name);
      });
    }
  }, {
    key: 'callRenderPlugins',
    value: function callRenderPlugins(target, element) {
      var _this2 = this;

      var renderValues = reduce(element.attributes)(function (output, attr, name) {
        var mappings = _this2.attributePluginMapping[name];

        if (mappings == null) return output;
        mappings.forEach(function (mapping) {
          if (output[mapping] == null) output[mapping] = {};
          output[mapping][name] = calculateAttributeDisplayValue(attr);
        });

        return output;
      }, {});

      entries(renderValues).forEach(function (_ref2) {
        var _ref3 = slicedToArray(_ref2, 2),
            pluginName = _ref3[0],
            attrValues = _ref3[1];

        _this2.renderRegistry[pluginName](target, attrValues);
      });
    }
  }, {
    key: 'addTimingPlugin',
    value: function addTimingPlugin(timingPlugin) {
      if (this.timingPlugin != null) {
        throw new Error('A timing plugin was already installed');
      }
      this.timingPlugin = timingPlugin;
    }
  }, {
    key: 'addPreset',
    value: function addPreset(_ref4) {
      var _this3 = this;

      var _ref4$renderPlugins = _ref4.renderPlugins,
          renderPlugins = _ref4$renderPlugins === undefined ? [] : _ref4$renderPlugins,
          timingPlugin = _ref4.timingPlugin;

      renderPlugins.forEach(function (renderPlugin) {
        _this3.addRenderPlugin(renderPlugin);
      });
      if (timingPlugin != null) {
        this.addTimingPlugin(timingPlugin);
      }
    }
  }]);
  return PluginRegistry;
}();

// ========== CONSTANTS ==========

var DEFAULT_EASING_FUNCTION = function DEFAULT_EASING_FUNCTION(t, b, c, d) {
  return c * t / d + b;
}; // linear
var DEFAULT_DELAY = 0;
var DEFAULT_DURATION = 60;

var initialChainOptions = function initialChainOptions() {
  return {
    delay: 0,
    currentDuration: 0,
    totalDuration: 0
  };
};

var EMPTY_ANIMATION_OPTIONS = {
  delay: null,
  easingFunction: null,
  duration: null
};

var TARGET_FRAME_DELAY = 16.67;

// ========== STATIC FUNCTIONS ==========

function resolveConstructorOptions() {
  var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaultDelay = defaults.delay == null ? DEFAULT_DELAY : defaults.delay;
  var defaultEase = defaults.easingFunction == null ? DEFAULT_EASING_FUNCTION : defaults.easingFunction;
  var defaultDuration = defaults.duration == null ? DEFAULT_DURATION : defaults.duration;

  return { defaultDelay: defaultDelay, defaultEase: defaultEase, defaultDuration: defaultDuration };
}

// ========== TYPES ==========


// ========== STATIC FUNCTIONS ==========

function addAnimationToChain(start, destination, options, chainOptions, attrName, element, currentChain) {
  start -= destination;
  var newAnimation = Animation(0 - (options.delay + chainOptions.delay), start, 0 - start, options.duration, options.easingFunction, options.delay + chainOptions.delay);

  var newAttribute = addAnimationToAttribute(newAnimation)(Attribute(destination));
  var newElement = addAttributeToElement(attrName, newAttribute)(Element());
  var tempEMap = new Map();
  tempEMap.set(element, newElement);

  return mergeElementMaps(tempEMap)(currentChain);
}

function mergeElementMaps(target) {
  return function (source) {
    var result = new Map(source.entries());
    target.forEach(function (element, key) {
      if (result.has(key)) {
        result.set(key, mergeElements(element)(result.get(key)));
      } else {
        result.set(key, element);
      }
    });
    return result;
  };
}

// ========== FACTORY ==========

function Animar(constructorOptions) {
  var _resolveConstructorOp = resolveConstructorOptions(constructorOptions),
      defaultDelay = _resolveConstructorOp.defaultDelay,
      defaultEase = _resolveConstructorOp.defaultEase,
      defaultDuration = _resolveConstructorOp.defaultDuration;

  var state = {
    ticking: false,
    firstFrame: true,
    previousTime: 0,
    elementMap: new Map(),
    defaults: { delay: defaultDelay, easingFunction: defaultEase, duration: defaultDuration },
    hooks: [],
    registry: new PluginRegistry()
  };

  // ========== MEMBER FUNCTIONS ==========

  function resolveAnimationOptions(options) {
    return {
      delay: options.delay == null ? state.defaults.delay : options.delay,
      easingFunction: options.easingFunction == null ? state.defaults.easingFunction : options.easingFunction,
      duration: options.duration == null ? state.defaults.duration : options.duration
    };
  }

  function set(element, attributes) {
    var tempEMap = new Map();

    var addedElement = reduce(attributes)(function (output, model, attrName) {
      return addAttributeToElement(attrName, Attribute(model))(output);
    }, Element());

    tempEMap.set(element, addedElement);
    state.elementMap = mergeElementMaps(tempEMap)(state.elementMap);

    return { add: add, set: set };
  }

  function add(element, attributes) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EMPTY_ANIMATION_OPTIONS;

    return _add(element, attributes, options, initialChainOptions(), new Map(), []);
  }

  function _add(element, attributes, options, chainOptions, currentChain, hooks) {
    var resolvedOptions = resolveAnimationOptions(options);
    Object.keys(attributes).forEach(function (attrName) {
      var destination = attributes[attrName];

      var start = getStartValue(element, attrName, currentChain);

      if (start != null) {
        currentChain = addAnimationToChain(start, destination, resolvedOptions, chainOptions, attrName, element, currentChain);
      }
    });

    chainOptions.currentDuration = Math.max(chainOptions.currentDuration, resolvedOptions.delay + resolvedOptions.duration);
    return fullChainObjectFactory(chainOptions, currentChain, hooks);
  }

  function getStartValue(element, attrName, currentChain) {
    var currentChainElement = currentChain.get(element);
    var stateElement = state.elementMap.get(element);

    if (currentChainElement != null && currentChainElement.attributes != null && currentChainElement.attributes[attrName] != null) {
      var currentChainAttribute = currentChainElement.attributes[attrName];
      if (currentChainAttribute != null) {
        return currentChainAttribute.model;
      }
    } else if (stateElement != null && stateElement.attributes != null && stateElement.attributes[attrName] != null) {
      var stateAttribute = stateElement.attributes[attrName];
      if (stateAttribute != null) {
        return stateAttribute.model;
      }
    } else {
      throw new Error(element + ' does not have ' + attrName + ' set');
    }
  }

  function addHook(hook, chainOptions, chain, hooks) {
    var newHook = Hook(hook, 0 - chainOptions.delay, chainOptions.delay);
    return fullChainObjectFactory(chainOptions, chain, hooks.concat([newHook]));
  }

  function fullChainObjectFactory(chainOptions, chain, hooks) {
    return {
      start: startChainFunctionFactory(chain, hooks),
      loop: loopChainFunctionFactory(chainOptions, chain, hooks),
      add: addChainFunctionFactory(chainOptions, chain, hooks),
      then: thenChainFunctionFactory(chainOptions, chain, hooks),
      hook: hookChainFunctionFactory(chainOptions, chain, hooks)
    };
  }

  function thenChainFunctionFactory(chainOptions, chain, hooks) {
    return function () {
      var wait = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var newTotalDuration = chainOptions.totalDuration + chainOptions.currentDuration + wait;
      var newChainOptions = {
        totalDuration: newTotalDuration,
        delay: newTotalDuration,
        currentDuration: 0
      };
      return {
        add: addChainFunctionFactory(newChainOptions, chain, hooks),
        hook: hookChainFunctionFactory(newChainOptions, chain, hooks)
      };
    };
  }

  function addChainFunctionFactory(chainOptions, chain, hooks) {
    return function (element, attributes) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EMPTY_ANIMATION_OPTIONS;
      return _add(element, attributes, options, chainOptions, chain, hooks);
    };
  }

  function loopChainFunctionFactory(chainOptions, chain, hooks) {
    return function () {
      var newChainOptions = Object.assign(chainOptions, { totalDuration: chainOptions.totalDuration + chainOptions.currentDuration });
      var loopedChain = Array.from(chain.entries()).reduce(function (output, _ref) {
        var _ref2 = slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        output.set(key, loopElement(newChainOptions)(value));
        return output;
      }, new Map());

      var loopedHooks = hooks.map(loopHook(newChainOptions));

      return { start: startChainFunctionFactory(loopedChain, loopedHooks) };
    };
  }

  function hookChainFunctionFactory(chainOptions, chain, hooks) {
    return function (hook) {
      return addHook(hook, chainOptions, chain, hooks);
    };
  }

  function startChainFunctionFactory(chain, hooks) {
    return function () {
      state.elementMap = mergeElementMaps(chain)(state.elementMap);
      state.hooks = state.hooks.concat(hooks);
      requestTick();
    };
  }

  function update(timestamp) {
    var changeInTime = timestamp - state.previousTime;
    if (state.firstFrame) {
      changeInTime = TARGET_FRAME_DELAY;
      state.firstFrame = false;
    }
    var timescale = changeInTime / TARGET_FRAME_DELAY;
    state.previousTime = timestamp;

    state.ticking = false;

    var _step = step(timescale, state.elementMap, state.hooks),
        _step2 = slicedToArray(_step, 2),
        steppedElementMap = _step2[0],
        steppedHooks = _step2[1];

    // TODO: determine if nothing has changed to conditionally continue animating


    state.hooks = steppedHooks;
    state.elementMap = steppedElementMap;

    render();
    requestTick();
  }

  function render() {
    state.elementMap.forEach(function (element, target) {
      state.registry.callRenderPlugins(target, element);
    });
  }

  function requestTick() {
    if (!state.ticking) {
      var timingPlugin = state.registry.timingPlugin;

      if (timingPlugin != null) {
        timingPlugin(update);
      } else {
        throw new Error('Attempted to animate without providing a Timing Plugin');
      }

      state.ticking = true;
    }
  }

  function step(timescale, elementMap, hooks) {
    var steppedHooks = hooks.map(stepHook(timescale)).filter(function (hook, index) {
      return hook !== hooks[index];
    });

    var steppedElementMap = Array.from(elementMap.entries()).reduce(function (output, _ref3) {
      var _ref4 = slicedToArray(_ref3, 2),
          domRef = _ref4[0],
          element = _ref4[1];

      output.set(domRef, stepElement(timescale)(element));
      return output;
    }, new Map());

    return [steppedElementMap, steppedHooks];
  }

  // expose public functions
  var factoryOutput = {
    add: add,
    set: set,
    addPreset: state.registry.addPreset.bind(state.registry),
    addRenderPlugin: state.registry.addRenderPlugin.bind(state.registry),
    addTimingPlugin: state.registry.addTimingPlugin.bind(state.registry)
  };

  // expose the state for testing
  if ("development" === 'test') {}

  return factoryOutput;
}

// entrypoint for creating proper es5 default exports

export default Animar;