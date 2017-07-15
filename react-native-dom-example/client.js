(function(global) {"use strict";

global.__DEV__ = true;

global.__BUNDLE_START_TIME__ = global.nativePerformanceNow ? global.nativePerformanceNow() : Date.now();
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {

'use strict';

global.require = _require;
global.__d = define;

const modules = Object.create(null);
if (__DEV__) {
  var verboseNamesToModuleIds = Object.create(null);
}

function define(factory, moduleId, dependencyMap) {
  if (moduleId in modules) {
    return;
  }
  modules[moduleId] = {
    dependencyMap,
    exports: undefined,
    factory,
    hasError: false,
    isInitialized: false };

  if (__DEV__) {
    modules[moduleId].hot = createHotReloadingObject();

    const verboseName = arguments[3];
    if (verboseName) {
      modules[moduleId].verboseName = verboseName;
      verboseNamesToModuleIds[verboseName] = moduleId;
    }
  }
}

function _require(moduleId) {
  if (__DEV__ && typeof moduleId === 'string') {
    const verboseName = moduleId;
    moduleId = verboseNamesToModuleIds[moduleId];
    if (moduleId == null) {
      throw new Error(`Unknown named module: '${verboseName}'`);
    } else {
      console.warn(`Requiring module '${verboseName}' by name is only supported for ` + 'debugging purposes and will BREAK IN PRODUCTION!');
    }
  }

  const moduleIdReallyIsNumber = moduleId;
  const module = modules[moduleIdReallyIsNumber];
  return module && module.isInitialized ? module.exports : guardedLoadModule(moduleIdReallyIsNumber, module);
}

let inGuard = false;
function guardedLoadModule(moduleId, module) {
  if (!inGuard && global.ErrorUtils) {
    inGuard = true;
    let returnValue;
    try {
      returnValue = loadModuleImplementation(moduleId, module);
    } catch (e) {
      global.ErrorUtils.reportFatalError(e);
    }
    inGuard = false;
    return returnValue;
  } else {
    return loadModuleImplementation(moduleId, module);
  }
}

function loadModuleImplementation(moduleId, module) {
  const nativeRequire = global.nativeRequire;
  if (!module && nativeRequire) {
    nativeRequire(moduleId);
    module = modules[moduleId];
  }

  if (!module) {
    throw unknownModuleError(moduleId);
  }

  if (module.hasError) {
    throw moduleThrewError(moduleId, module.error);
  }

  if (__DEV__) {
    var Systrace = _require.Systrace;
  }

  module.isInitialized = true;
  const exports = module.exports = {};var _module = module;const factory = _module.factory,
        dependencyMap = _module.dependencyMap;
  try {
    if (__DEV__) {
      Systrace.beginEvent('JS_require_' + (module.verboseName || moduleId));
    }

    const moduleObject = { exports };
    if (__DEV__ && module.hot) {
      moduleObject.hot = module.hot;
    }

    factory(global, _require, moduleObject, exports, dependencyMap);

    if (!__DEV__) {
      module.factory = undefined;
      module.dependencyMap = undefined;
    }

    if (__DEV__) {
      Systrace.endEvent();
    }
    return module.exports = moduleObject.exports;
  } catch (e) {
    module.hasError = true;
    module.error = e;
    module.isInitialized = false;
    module.exports = undefined;
    throw e;
  }
}

function unknownModuleError(id) {
  let message = 'Requiring unknown module "' + id + '".';
  if (__DEV__) {
    message += 'If you are sure the module is there, try restarting the packager. ' + 'You may also want to run `npm install`, or `yarn` (depending on your environment).';
  }
  return Error(message);
}

function moduleThrewError(id, error) {
  const displayName = __DEV__ && modules[id] && modules[id].verboseName || id;
  return Error('Requiring module "' + displayName + '", which threw an exception: ' + error);
}

if (__DEV__) {
  _require.Systrace = { beginEvent: () => {}, endEvent: () => {} };

  var createHotReloadingObject = function () {
    const hot = {
      acceptCallback: null,
      accept: callback => {
        hot.acceptCallback = callback;
      } };

    return hot;
  };

  const acceptAll = function (dependentModules, inverseDependencies) {
    if (!dependentModules || dependentModules.length === 0) {
      return true;
    }

    const notAccepted = dependentModules.filter(module => !accept(module, undefined, inverseDependencies));

    const parents = [];
    for (let i = 0; i < notAccepted.length; i++) {
      if (inverseDependencies[notAccepted[i]].length === 0) {
        return false;
      }

      parents.push(...inverseDependencies[notAccepted[i]]);
    }

    return acceptAll(parents, inverseDependencies);
  };

  const accept = function (id, factory, inverseDependencies) {
    const mod = modules[id];

    if (!mod && factory) {
      define(factory, id);
      return true;
    }const hot = mod.hot;
    if (!hot) {
      console.warn('Cannot accept module because Hot Module Replacement ' + 'API was not installed.');

      return false;
    }

    if (factory) {
      mod.factory = factory;
    }
    mod.hasError = false;
    mod.isInitialized = false;
    _require(id);

    if (hot.acceptCallback) {
      hot.acceptCallback();
      return true;
    } else {
      if (!inverseDependencies) {
        throw new Error('Undefined `inverseDependencies`');
      }

      return acceptAll(inverseDependencies[id], inverseDependencies);
    }
  };

  global.__accept = accept;
}
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

Object.assign = function (target, sources) {
  if (__DEV__) {
    if (target == null) {
      throw new TypeError('Object.assign target cannot be null or undefined');
    }
    if (typeof target !== 'object' && typeof target !== 'function') {
      throw new TypeError('In this environment the target of assign MUST be an object.' + 'This error is a performance optimization and not spec compliant.');
    }
  }

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    if (__DEV__) {
      if (typeof nextSource !== 'object' && typeof nextSource !== 'function') {
        throw new TypeError('In this environment the sources for assign MUST be an object.' + 'This error is a performance optimization and not spec compliant.');
      }
    }

    for (var key in nextSource) {
      if (__DEV__) {
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        if (!hasOwnProperty.call(nextSource, key)) {
          throw new TypeError('One of the sources for assign has an enumerable key on the ' + 'prototype chain. Are you trying to assign a prototype property? ' + 'We don\'t allow it, as this is an edge case that we do not support. ' + 'This error is a performance optimization and not spec compliant.');
        }
      }
      target[key] = nextSource[key];
    }
  }

  return target;
};
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

const inspect = function () {

  function inspect(obj, opts) {
    var ctx = {
      seen: [],
      stylize: stylizeNoColor };

    return formatValue(ctx, obj, opts.depth);
  }

  function stylizeNoColor(str, styleType) {
    return str;
  }

  function arrayToHash(array) {
    var hash = {};

    array.forEach(function (val, idx) {
      hash[val] = true;
    });

    return hash;
  }

  function formatValue(ctx, value, recurseTimes) {
    var primitive = formatPrimitive(ctx, value);
    if (primitive) {
      return primitive;
    }

    var keys = Object.keys(value);
    var visibleKeys = arrayToHash(keys);

    if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
      return formatError(value);
    }

    if (keys.length === 0) {
      if (isFunction(value)) {
        var name = value.name ? ': ' + value.name : '';
        return ctx.stylize('[Function' + name + ']', 'special');
      }
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      }
      if (isDate(value)) {
        return ctx.stylize(Date.prototype.toString.call(value), 'date');
      }
      if (isError(value)) {
        return formatError(value);
      }
    }

    var base = '',
        array = false,
        braces = ['{', '}'];

    if (isArray(value)) {
      array = true;
      braces = ['[', ']'];
    }

    if (isFunction(value)) {
      var n = value.name ? ': ' + value.name : '';
      base = ' [Function' + n + ']';
    }

    if (isRegExp(value)) {
      base = ' ' + RegExp.prototype.toString.call(value);
    }

    if (isDate(value)) {
      base = ' ' + Date.prototype.toUTCString.call(value);
    }

    if (isError(value)) {
      base = ' ' + formatError(value);
    }

    if (keys.length === 0 && (!array || value.length == 0)) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      } else {
        return ctx.stylize('[Object]', 'special');
      }
    }

    ctx.seen.push(value);

    var output;
    if (array) {
      output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
    } else {
      output = keys.map(function (key) {
        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
      });
    }

    ctx.seen.pop();

    return reduceToSingleString(output, base, braces);
  }

  function formatPrimitive(ctx, value) {
    if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
    if (isString(value)) {
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');
    }
    if (isNumber(value)) return ctx.stylize('' + value, 'number');
    if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');

    if (isNull(value)) return ctx.stylize('null', 'null');
  }

  function formatError(value) {
    return '[' + Error.prototype.toString.call(value) + ']';
  }

  function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
    var output = [];
    for (var i = 0, l = value.length; i < l; ++i) {
      if (hasOwnProperty(value, String(i))) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
      } else {
        output.push('');
      }
    }
    keys.forEach(function (key) {
      if (!key.match(/^\d+$/)) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
      }
    });
    return output;
  }

  function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
    var name, str, desc;
    desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
    if (desc.get) {
      if (desc.set) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (desc.set) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
    if (!hasOwnProperty(visibleKeys, key)) {
      name = '[' + key + ']';
    }
    if (!str) {
      if (ctx.seen.indexOf(desc.value) < 0) {
        if (isNull(recurseTimes)) {
          str = formatValue(ctx, desc.value, null);
        } else {
          str = formatValue(ctx, desc.value, recurseTimes - 1);
        }
        if (str.indexOf('\n') > -1) {
          if (array) {
            str = str.split('\n').map(function (line) {
              return '  ' + line;
            }).join('\n').substr(2);
          } else {
            str = '\n' + str.split('\n').map(function (line) {
              return '   ' + line;
            }).join('\n');
          }
        }
      } else {
        str = ctx.stylize('[Circular]', 'special');
      }
    }
    if (isUndefined(name)) {
      if (array && key.match(/^\d+$/)) {
        return str;
      }
      name = JSON.stringify('' + key);
      if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
        name = name.substr(1, name.length - 2);
        name = ctx.stylize(name, 'name');
      } else {
        name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
        name = ctx.stylize(name, 'string');
      }
    }

    return name + ': ' + str;
  }

  function reduceToSingleString(output, base, braces) {
    var numLinesEst = 0;
    var length = output.reduce(function (prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
    }, 0);

    if (length > 60) {
      return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
    }

    return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
  }

  function isArray(ar) {
    return Array.isArray(ar);
  }

  function isBoolean(arg) {
    return typeof arg === 'boolean';
  }

  function isNull(arg) {
    return arg === null;
  }

  function isNullOrUndefined(arg) {
    return arg == null;
  }

  function isNumber(arg) {
    return typeof arg === 'number';
  }

  function isString(arg) {
    return typeof arg === 'string';
  }

  function isSymbol(arg) {
    return typeof arg === 'symbol';
  }

  function isUndefined(arg) {
    return arg === void 0;
  }

  function isRegExp(re) {
    return isObject(re) && objectToString(re) === '[object RegExp]';
  }

  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }

  function isDate(d) {
    return isObject(d) && objectToString(d) === '[object Date]';
  }

  function isError(e) {
    return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
  }

  function isFunction(arg) {
    return typeof arg === 'function';
  }

  function isPrimitive(arg) {
    return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'symbol' || typeof arg === 'undefined';
  }

  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }

  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  return inspect;
}();

const OBJECT_COLUMN_NAME = '(index)';
const LOG_LEVELS = {
  trace: 0,
  info: 1,
  warn: 2,
  error: 3 };

const INSPECTOR_LEVELS = [];
INSPECTOR_LEVELS[LOG_LEVELS.trace] = 'debug';
INSPECTOR_LEVELS[LOG_LEVELS.info] = 'log';
INSPECTOR_LEVELS[LOG_LEVELS.warn] = 'warning';
INSPECTOR_LEVELS[LOG_LEVELS.error] = 'error';

const INSPECTOR_FRAMES_TO_SKIP = __DEV__ ? 2 : 1;

function setupConsole(global) {
  if (!global.nativeLoggingHook) {
    return;
  }

  function getNativeLogFunction(level) {
    return function () {
      let str;
      if (arguments.length === 1 && typeof arguments[0] === 'string') {
        str = arguments[0];
      } else {
        str = Array.prototype.map.call(arguments, function (arg) {
          return inspect(arg, { depth: 10 });
        }).join(', ');
      }

      let logLevel = level;
      if (str.slice(0, 9) === 'Warning: ' && logLevel >= LOG_LEVELS.error) {
        logLevel = LOG_LEVELS.warn;
      }
      if (global.__inspectorLog) {
        global.__inspectorLog(INSPECTOR_LEVELS[logLevel], str, [].slice.call(arguments), INSPECTOR_FRAMES_TO_SKIP);
      }
      global.nativeLoggingHook(str, logLevel);
    };
  }

  function repeat(element, n) {
    return Array.apply(null, Array(n)).map(function () {
      return element;
    });
  };

  function consoleTablePolyfill(rows) {
    if (!Array.isArray(rows)) {
      var data = rows;
      rows = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var row = data[key];
          row[OBJECT_COLUMN_NAME] = key;
          rows.push(row);
        }
      }
    }
    if (rows.length === 0) {
      global.nativeLoggingHook('', LOG_LEVELS.info);
      return;
    }

    var columns = Object.keys(rows[0]).sort();
    var stringRows = [];
    var columnWidths = [];

    columns.forEach(function (k, i) {
      columnWidths[i] = k.length;
      for (var j = 0; j < rows.length; j++) {
        var cellStr = (rows[j][k] || '?').toString();
        stringRows[j] = stringRows[j] || [];
        stringRows[j][i] = cellStr;
        columnWidths[i] = Math.max(columnWidths[i], cellStr.length);
      }
    });

    function joinRow(row, space) {
      var cells = row.map(function (cell, i) {
        var extraSpaces = repeat(' ', columnWidths[i] - cell.length).join('');
        return cell + extraSpaces;
      });
      space = space || ' ';
      return cells.join(space + '|' + space);
    };

    var separators = columnWidths.map(function (columnWidth) {
      return repeat('-', columnWidth).join('');
    });
    var separatorRow = joinRow(separators, '-');
    var header = joinRow(columns);
    var table = [header, separatorRow];

    for (var i = 0; i < rows.length; i++) {
      table.push(joinRow(stringRows[i]));
    }

    global.nativeLoggingHook('\n' + table.join('\n'), LOG_LEVELS.info);
  }

  var originalConsole = global.console;
  var descriptor = Object.getOwnPropertyDescriptor(global, 'console');
  if (descriptor) {
    Object.defineProperty(global, 'originalConsole', descriptor);
  }

  global.console = {
    error: getNativeLogFunction(LOG_LEVELS.error),
    info: getNativeLogFunction(LOG_LEVELS.info),
    log: getNativeLogFunction(LOG_LEVELS.info),
    warn: getNativeLogFunction(LOG_LEVELS.warn),
    trace: getNativeLogFunction(LOG_LEVELS.trace),
    debug: getNativeLogFunction(LOG_LEVELS.trace),
    table: consoleTablePolyfill };

  if (__DEV__ && originalConsole) {
    Object.keys(console).forEach(methodName => {
      var reactNativeMethod = console[methodName];
      if (originalConsole[methodName]) {
        console[methodName] = function () {
          originalConsole[methodName](...arguments);
          reactNativeMethod.apply(console, arguments);
        };
      }
    });
  }
}

if (typeof module !== 'undefined') {
  module.exports = setupConsole;
} else {
  setupConsole(global);
}
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

let _inGuard = 0;

let _globalHandler = function onError(e) {
  throw e;
};

const ErrorUtils = {
  setGlobalHandler(fun) {
    _globalHandler = fun;
  },
  getGlobalHandler() {
    return _globalHandler;
  },
  reportError(error) {
    _globalHandler && _globalHandler(error);
  },
  reportFatalError(error) {
    _globalHandler && _globalHandler(error, true);
  },
  applyWithGuard(fun, context, args) {
    try {
      _inGuard++;
      return fun.apply(context, args);
    } catch (e) {
      ErrorUtils.reportError(e);
    } finally {
      _inGuard--;
    }
    return null;
  },
  applyWithGuardIfNeeded(fun, context, args) {
    if (ErrorUtils.inGuard()) {
      return fun.apply(context, args);
    } else {
      ErrorUtils.applyWithGuard(fun, context, args);
    }
    return null;
  },
  inGuard() {
    return _inGuard;
  },
  guard(fun, name, context) {
    if (typeof fun !== 'function') {
      console.warn('A function must be passed to ErrorUtils.guard, got ', fun);
      return null;
    }
    name = name || fun.name || '<generated guard>';
    function guarded() {
      return ErrorUtils.applyWithGuard(fun, context || this, arguments, null, name);
    }

    return guarded;
  } };

global.ErrorUtils = ErrorUtils;
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

if (Number.EPSILON === undefined) {
  Object.defineProperty(Number, 'EPSILON', {
    value: Math.pow(2, -52) });
}
if (Number.MAX_SAFE_INTEGER === undefined) {
  Object.defineProperty(Number, 'MAX_SAFE_INTEGER', {
    value: Math.pow(2, 53) - 1 });
}
if (Number.MIN_SAFE_INTEGER === undefined) {
  Object.defineProperty(Number, 'MIN_SAFE_INTEGER', {
    value: -(Math.pow(2, 53) - 1) });
}
if (!Number.isNaN) {
  const globalIsNaN = global.isNaN;
  Object.defineProperty(Number, 'isNaN', {
    configurable: true,
    enumerable: false,
    value: function isNaN(value) {
      return typeof value === 'number' && globalIsNaN(value);
    },
    writable: true });
}
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (search) {
    'use strict';

    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var pos = arguments.length > 1 ? Number(arguments[1]) || 0 : 0;
    var start = Math.min(Math.max(pos, 0), string.length);
    return string.indexOf(String(search), pos) === start;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search) {
    'use strict';

    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var pos = arguments.length > 1 ? Number(arguments[1]) || 0 : stringLength;
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchString.length;
    if (start < 0) {
      return false;
    }
    return string.lastIndexOf(searchString, start) === start;
  };
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function (count) {
    'use strict';

    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    count = Number(count) || 0;
    if (count < 0 || count === Infinity) {
      throw RangeError();
    }
    if (count === 1) {
      return string;
    }
    var result = '';
    while (count) {
      if (count & 1) {
        result += string;
      }
      if (count >>= 1) {
        string += string;
      }
    }
    return result;
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';

    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

function findIndex(predicate, context) {
  if (this == null) {
    throw new TypeError('Array.prototype.findIndex called on null or undefined');
  }
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }
  var list = Object(this);
  var length = list.length >>> 0;
  for (var i = 0; i < length; i++) {
    if (predicate.call(context, list[i], i, list)) {
      return i;
    }
  }
  return -1;
}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: findIndex });
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function (predicate, context) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      var index = findIndex.call(this, predicate, context);
      return index === -1 ? undefined : this[index];
    } });
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function (searchElement) {
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) {
        return false;
      }
      var n = parseInt(arguments[1]) || 0;
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) {
          k = 0;
        }
      }
      var currentElement;
      while (k < len) {
        currentElement = O[k];
        if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
          return true;
        }
        k++;
      }
      return false;
    } });
}
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

if (!Array.from) {
  Array.from = function (arrayLike) {
    if (arrayLike == null) {
      throw new TypeError('Object is null or undefined');
    }

    var mapFn = arguments[1];
    var thisArg = arguments[2];

    var C = this;
    var items = Object(arrayLike);
    var symbolIterator = typeof Symbol === 'function' ? Symbol.iterator : '@@iterator';
    var mapping = typeof mapFn === 'function';
    var usingIterator = typeof items[symbolIterator] === 'function';
    var key = 0;
    var ret;
    var value;

    if (usingIterator) {
      ret = typeof C === 'function' ? new C() : [];
      var it = items[symbolIterator]();
      var next;

      while (!(next = it.next()).done) {
        value = next.value;

        if (mapping) {
          value = mapFn.call(thisArg, value, key);
        }

        ret[key] = value;
        key += 1;
      }

      ret.length = key;
      return ret;
    }

    var len = items.length;
    if (isNaN(len) || len < 0) {
      len = 0;
    }

    ret = typeof C === 'function' ? new C(len) : new Array(len);

    while (key < len) {
      value = items[key];

      if (mapping) {
        value = mapFn.call(thisArg, value, key);
      }

      ret[key] = value;

      key += 1;
    }

    ret.length = key;
    return ret;
  };
}
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {'use strict';

(function () {
  'use strict';

  const hasOwnProperty = Object.prototype.hasOwnProperty;

  if (typeof Object.entries !== 'function') {
    Object.entries = function (object) {
      if (object == null) {
        throw new TypeError('Object.entries called on non-object');
      }

      const entries = [];
      for (const key in object) {
        if (hasOwnProperty.call(object, key)) {
          entries.push([key, object[key]]);
        }
      }
      return entries;
    };
  }

  if (typeof Object.values !== 'function') {
    Object.values = function (object) {
      if (object == null) {
        throw new TypeError('Object.values called on non-object');
      }

      const values = [];
      for (const key in object) {
        if (hasOwnProperty.call(object, key)) {
          values.push(object[key]);
        }
      }
      return values;
    };
  }
})();
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function(global) {"use strict";

var babelHelpers = global.babelHelpers = {};

babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

babelHelpers.createRawReactElement = function () {
  var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  return function createRawReactElement(type, key, props) {
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key,
      ref: null,
      props: props,
      _owner: null };
  };
}();

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
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

babelHelpers.defineEnumerableProperties = function (obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ('value' in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }
  return obj;
};

babelHelpers.defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true });
  } else {
    obj[key] = value;
  }

  return obj;
};

babelHelpers._extends = babelHelpers.extends = Object.assign || function (target) {
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

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true } });

  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.interopRequireDefault = function (obj) {
  return obj && obj.__esModule ? obj : {
    default: obj };
};

babelHelpers.interopRequireWildcard = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj.default = obj;
    return newObj;
  }
};

babelHelpers.objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers.slicedToArray = function () {
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

babelHelpers.taggedTemplateLiteral = function (strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw) } }));
};

babelHelpers.toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

babelHelpers.toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};
})(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
__d(/* layout-animations-example/web/client.js */function(global, require, module, exports) {"use strict";

var _reactNativeWeb = require(12                ); // 12 = react-native-web

function init(bundle, parent, options) {
  const web = new _reactNativeWeb.RNWebInstance(bundle, "layoutanimations", parent, babelHelpers.extends({}, options));

  web.start();
  return web;
}

window.ReactWeb = { init };
}, 0, null, "layout-animations-example/web/client.js");
__d(/* react-native-webapp/ReactWeb/index.js */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RNWebInstance = undefined;

require(13              ); // 13 = proxy-polyfill

var _RCTRootView = require(14           ); // 14 = RCTRootView

var _RCTRootView2 = babelHelpers.interopRequireDefault(_RCTRootView);

var _BundleFromRoot = require(48              ); // 48 = BundleFromRoot

var _BundleFromRoot2 = babelHelpers.interopRequireDefault(_BundleFromRoot);

require(33                  ); // 33 = RCTEventDispatcher

require(34             ); // 34 = RCTDeviceInfo

require(49           ); // 49 = RCTPlatform

require(44         ); // 44 = RCTTiming

require(20            ); // 20 = RCTUIManager

require(22              ); // 22 = RCTViewManager

require(50              ); // 50 = RCTTextManager

require(54                 ); // 54 = RCTRawTextManager

let RNWebInstance = exports.RNWebInstance = class RNWebInstance {

  constructor(bundle, moduleName, parent) {
    this.rootView = new _RCTRootView2.default((0, _BundleFromRoot2.default)(bundle), moduleName, parent);
  }

  start() {
    this.rootView.render();
  }
};
}, 12, null, "react-native-webapp/ReactWeb/index.js");
__d(/* proxy-polyfill/proxy.js */function(global, require, module, exports) {

'use strict';

(function (scope) {
  if (scope['Proxy']) {
    return;
  }
  let lastRevokeFn = null;

  function isObject(o) {
    return o ? typeof o == 'object' || typeof o == 'function' : false;
  }

  scope.Proxy = function (target, handler) {
    if (!isObject(target) || !isObject(handler)) {
      throw new TypeError('Cannot create proxy with a non-object as target or handler');
    }

    let throwRevoked = function () {};
    lastRevokeFn = function () {
      throwRevoked = function (trap) {
        throw new TypeError(`Cannot perform '${trap}' on a proxy that has been revoked`);
      };
    };

    const unsafeHandler = handler;
    handler = { 'get': null, 'set': null, 'apply': null, 'construct': null };
    for (let k in unsafeHandler) {
      if (!(k in handler)) {
        throw new TypeError(`Proxy polyfill does not support trap '${k}'`);
      }
      handler[k] = unsafeHandler[k];
    }
    if (typeof unsafeHandler == 'function') {
      handler.apply = unsafeHandler.apply.bind(unsafeHandler);
    }

    let proxy = this;
    let isMethod = false;
    const targetIsFunction = typeof target == 'function';
    if (handler.apply || handler['construct'] || targetIsFunction) {
      proxy = function Proxy() {
        const usingNew = this && this.constructor === proxy;
        const args = Array.prototype.slice.call(arguments);
        throwRevoked(usingNew ? 'construct' : 'apply');

        if (usingNew && handler['construct']) {
          return handler['construct'].call(this, target, args);
        } else if (!usingNew && handler.apply) {
          return handler.apply(target, this, args);
        } else if (targetIsFunction) {
          if (usingNew) {
            args.unshift(target);
            const f = target.bind.apply(target, args);
            return new f();
          }
          return target.apply(this, args);
        }
        throw new TypeError(usingNew ? 'not a constructor' : 'not a function');
      };
      isMethod = true;
    }

    const getter = handler.get ? function (prop) {
      throwRevoked('get');
      return handler.get(this, prop, proxy);
    } : function (prop) {
      throwRevoked('get');
      return this[prop];
    };
    const setter = handler.set ? function (prop, value) {
      throwRevoked('set');
      const status = handler.set(this, prop, value, proxy);
      if (!status) {}
    } : function (prop, value) {
      throwRevoked('set');
      this[prop] = value;
    };

    const propertyNames = Object.getOwnPropertyNames(target);
    const propertyMap = {};
    propertyNames.forEach(function (prop) {
      if (isMethod && prop in proxy) {
        return;
      }
      const real = Object.getOwnPropertyDescriptor(target, prop);
      const desc = {
        enumerable: !!real.enumerable,
        get: getter.bind(target, prop),
        set: setter.bind(target, prop)
      };
      Object.defineProperty(proxy, prop, desc);
      propertyMap[prop] = true;
    });

    let prototypeOk = true;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
    } else if (proxy.__proto__) {
      proxy.__proto__ = target.__proto__;
    } else {
      prototypeOk = false;
    }
    if (handler.get || !prototypeOk) {
      for (let k in target) {
        if (propertyMap[k]) {
          continue;
        }
        Object.defineProperty(proxy, k, { get: getter.bind(target, k) });
      }
    }

    Object.seal(target);
    Object.seal(proxy);

    return proxy;
  };

  scope.Proxy.revocable = function (target, handler) {
    const p = new scope.Proxy(target, handler);
    return { 'proxy': p, 'revoke': lastRevokeFn };
  };

  scope.Proxy['revocable'] = scope.Proxy.revocable;
  scope['Proxy'] = scope.Proxy;
})(typeof process !== 'undefined' && {}.toString.call(process) == '[object process]' ? global : self);
}, 13, null, "proxy-polyfill/proxy.js");
__d(/* RCTRootView */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _class;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _RCTUIManager = require(20            ); // 20 = RCTUIManager

var _RCTUIManager2 = babelHelpers.interopRequireDefault(_RCTUIManager);

var _UIView = require(23      ); // 23 = UIView

var _UIView2 = babelHelpers.interopRequireDefault(_UIView);

var _NotificationCenter = require(36                  ); // 36 = NotificationCenter

var _NotificationCenter2 = babelHelpers.interopRequireDefault(_NotificationCenter);

var _RCTDeviceInfo = require(34             ); // 34 = RCTDeviceInfo

var _RCTDeviceInfo2 = babelHelpers.interopRequireDefault(_RCTDeviceInfo);

var _RCTTiming = require(44         ); // 44 = RCTTiming

var _RCTTiming2 = babelHelpers.interopRequireDefault(_RCTTiming);

var _RCTTouchHandler = require(45               ); // 45 = RCTTouchHandler

var _RCTTouchHandler2 = babelHelpers.interopRequireDefault(_RCTTouchHandler);

var _CustomElement = require(24             ); // 24 = CustomElement

var _CustomElement2 = babelHelpers.interopRequireDefault(_CustomElement);

function getAvailableSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

let RCTRootView = (_dec = (0, _CustomElement2.default)("rct-root-view"), _dec(_class = class RCTRootView extends _UIView2.default {

  constructor(bundle, moduleName, parent) {
    super();

    this.moduleName = moduleName;
    this.parent = parent;

    this.bridge = new _RCTBridge2.default(moduleName, bundle);
    this.bridge.bundleFinishedLoading = this.bundleFinishedLoading.bind(this);
    this.bridge.initializeModules();

    const deviceInfoModule = this.bridge.modulesByName["DeviceInfo"];

    const dimensions = deviceInfoModule.exportedDimensions().window;
    this.availableSize = {
      width: dimensions.width,
      height: dimensions.height
    };

    this.width = this.availableSize.width;
    this.height = this.availableSize.height;

    this.uiManager = this.bridge.modulesByName["UIManager"];
    this.timing = this.bridge.modulesByName["Timing"];

    this.touchHandler = new _RCTTouchHandler2.default(this.bridge);
    this.touchHandler.attachToView(this);

    this.style.webkitTapHighlightColor = "transparent";
  }

  set width(value) {
    this._width = value;
    this.style.width = `${value}px`;
  }

  set height(value) {
    this._height = value;
    this.style.height = `${value}px`;
  }

  get reactTag() {
    if (!this._reactTag) {
      this._reactTag = this.uiManager.allocateRootTag;
      this.uiManager.registerRootView(this);
    }
    return this._reactTag;
  }

  bundleFinishedLoading() {
    this.runApplication();
  }

  runApplication() {
    const appParameters = {
      rootTag: this.reactTag,
      initialProps: {}
    };

    this.bridge.enqueueJSCall("AppRegistry", "runApplication", [this.moduleName, appParameters]);
  }

  renderLoop() {
    this.timing.frame();
    this.bridge.frame();
    this.uiManager.frame();

    window.requestAnimationFrame(this.renderLoop.bind(this));
  }

  render() {
    this.parent.appendChild(this);
    this.bridge.loadBridgeConfig();
    this.renderLoop();
  }
}) || _class);
exports.default = RCTRootView;
}, 14, null, "RCTRootView");
__d(/* RCTBridge */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RCT_EXPORT_MODULE = exports.default = exports.RCTFunctionType = exports.RCTFunctionTypeSync = exports.RCTFunctionTypePromise = exports.RCTFunctionTypeNormal = undefined;

var _class, _temp, _initialiseProps;

exports.getPropertyNames = getPropertyNames;
exports.bridgeModuleNameForClass = bridgeModuleNameForClass;
exports.RCT_EXPORT_METHOD = RCT_EXPORT_METHOD;

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTModuleConfig = require(18               ); // 18 = RCTModuleConfig

var _RCTBridgeMethod = require(19               ); // 19 = RCTBridgeMethod

exports.RCTFunctionTypeNormal = _RCTBridgeMethod.RCTFunctionTypeNormal;
exports.RCTFunctionTypePromise = _RCTBridgeMethod.RCTFunctionTypePromise;
exports.RCTFunctionTypeSync = _RCTBridgeMethod.RCTFunctionTypeSync;
exports.RCTFunctionType = _RCTBridgeMethod.RCTFunctionType;


const MODULE_IDS = 0;
const METHOD_IDS = 1;
const PARAMS = 2;

const DEVTOOLS_FLAG = /\bdevtools\b/;
const HOTRELOAD_FLAG = /\bhotreload\b/;

let WORKER_SRC = "ErrorUtils = {\n  setGlobalHandler: () => {},\n  reportFatalError: console.error,\n};\n\nfunction sendMessage(topic, payload) {\n  postMessage(JSON.stringify({ topic, payload }));\n}\n\nvar Status = undefined;\n\nonmessage = ({ data }) => {\n  const { topic, payload } = JSON.parse(data);\n  //console.log(\"Recieved message from main thread:\", topic, payload);\n\n  switch (topic) {\n    case \"loadBridgeConfig\": {\n      const { config, bundle } = payload;\n\n      __fbBatchedBridgeConfig = config;\n      importScripts(bundle);\n\n      sendMessage(\"bundleFinishedLoading\");\n      break;\n    }\n    case \"callFunctionReturnFlushedQueue\": {\n      const flushedQueue = __fbBatchedBridge.callFunctionReturnFlushedQueue(\n        ...payload\n      );\n      sendMessage(\"flushedQueue\", flushedQueue);\n      break;\n    }\n    case \"invokeCallbackAndReturnFlushedQueue\": {\n      const flushedQueue = __fbBatchedBridge.invokeCallbackAndReturnFlushedQueue(\n        ...payload\n      );\n      sendMessage(\"flushedQueue\", flushedQueue);\n      break;\n    }\n    case \"flush\":{\n      const flushedQueue = __fbBatchedBridge.flushedQueue.apply(null);\n      sendMessage(\"flushedQueue\", flushedQueue);\n      break;\n    }\n  }\n};";

if (__DEV__) {
  if (DEVTOOLS_FLAG.test(location.search)) {
    WORKER_SRC += "__DEVTOOLS__ = true;\n";
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log("We detected that you have the React Devtools extension installed. " + "Please note that at this time, React VR is only compatible with the " + "standalone React Native Inspector that ships with Nuclide.");
    }
  }
}

function getPropertyNames(obj) {
  if (obj == null) return [];

  const currentPropertyNames = Object.getOwnPropertyNames(obj);
  return currentPropertyNames.concat(getPropertyNames(Object.getPrototypeOf(obj)));
}

function bridgeModuleNameForClass(cls) {
  let name = cls.__moduleName;

  if (name != null) {
    if (name.startsWith("RK")) {
      name = name.substring(2);
    } else if (name.startsWith("RCT")) {
      name = name.substring(3);
    }
    return name;
  }

  return "";
}

function generateModuleConfig(name, bridgeModule) {
  const methodNames = [...new Set(getPropertyNames(bridgeModule))].filter(methodName => methodName.startsWith("__rct_export__"));

  const constants = bridgeModule.constantsToExport ? bridgeModule.constantsToExport() : undefined;

  const allMethods = [];
  const promiseMethods = [];
  const syncMethods = [];

  methodNames.forEach(rctName => {
    if (bridgeModule[rctName]) {
      const [methodName, methodType] = bridgeModule[rctName].call(bridgeModule);
      allMethods.push(methodName);

      if (methodType === _RCTBridgeMethod.RCTFunctionTypePromise) {
        promiseMethods.push(allMethods.length - 1);
      }

      if (methodType === _RCTBridgeMethod.RCTFunctionTypeSync) {
        syncMethods.push(allMethods.length - 1);
      }
    }
  });

  return [name, constants, allMethods, promiseMethods, syncMethods];
}

let RCTBridge = (_temp = _class = class RCTBridge {

  constructor(moduleName, bundle) {
    _initialiseProps.call(this);

    this.moduleName = moduleName;
    this.bundleLocation = bundle;

    const bridgeCodeBlob = new Blob([WORKER_SRC]);
    const worker = new Worker(URL.createObjectURL(bridgeCodeBlob));
    this.setThread(worker);
  }

  moduleForClass(cls) {
    (0, _Invariant2.default)(cls.__moduleName, "Class does not seem to be exported");
    return this.modulesByName[bridgeModuleNameForClass(cls)];
  }

  setThread(thread) {
    this.thread = thread;
    thread.onmessage = this.onMessage.bind(this);
  }

  sendMessage(topic, payload) {
    if (this.thread) {
      this.thread.postMessage(JSON.stringify({ topic, payload }));
    }
  }

  callNativeModule(moduleId, methodId, params) {
    const moduleConfig = this.moduleConfigs[moduleId];

    (0, _Invariant2.default)(moduleConfig, `No such module with id: ${moduleId}`);
    const [name,, functions] = moduleConfig;

    (0, _Invariant2.default)(functions, `Module ${name} has no methods to call`);
    const functionName = functions[methodId];

    (0, _Invariant2.default)(functionName, `No such function in module ${name} with id ${methodId}`);
    const nativeModule = this.modulesByName[name];

    (0, _Invariant2.default)(nativeModule, `No such module with name ${name}`);
    (0, _Invariant2.default)(nativeModule[functionName], `No such method ${functionName} on module ${name}`);

    nativeModule[functionName].apply(nativeModule, params);
  }

  onMessage(message) {
    const { topic, payload } = JSON.parse(message.data);

    switch (topic) {
      case "bundleFinishedLoading":
        {
          if (this.bundleFinishedLoading) {
            this.bundleFinishedLoading();
          }
          break;
        }
      case "flushedQueue":
        {
          if (payload != null && Array.isArray(payload)) {
            const [moduleIds, methodIds, params] = payload;
            for (let i = 0; i < moduleIds.length; i++) {
              this.messages.push({
                moduleId: moduleIds[i],
                methodId: methodIds[i],
                args: params[i]
              });
            }
          }
          break;
        }
      default:
        {
          console.log(`Unknown topic: ${topic}`);
        }
    }
  }

  generateModuleConfig(name, bridgeModule) {
    const methodNames = [...new Set(getPropertyNames(bridgeModule))].filter(methodName => methodName.startsWith("__rct_export__"));

    const constants = bridgeModule.constantsToExport ? bridgeModule.constantsToExport() : undefined;

    const allMethods = [];
    const promiseMethods = [];
    const syncMethods = [];

    methodNames.forEach(rctName => {
      if (bridgeModule[rctName]) {
        const [methodName, methodType] = bridgeModule[rctName].call(bridgeModule);
        allMethods.push(methodName);

        if (methodType === _RCTBridgeMethod.RCTFunctionTypePromise) {
          promiseMethods.push(allMethods.length - 1);
        }

        if (methodType === _RCTBridgeMethod.RCTFunctionTypeSync) {
          syncMethods.push(allMethods.length - 1);
        }
      }
    });
    this.moduleConfigs.push((0, _RCTModuleConfig.moduleConfigFactory)(name, constants, allMethods, promiseMethods, syncMethods));
    return [name, constants, allMethods, promiseMethods, syncMethods];
  }

  loadBridgeConfig() {
    const config = this.getInitialModuleConfig();
    this.sendMessage("loadBridgeConfig", {
      config,
      bundle: this.bundleLocation
    });
  }

  enqueueJSCall(moduleName, methodName, args) {
    this.sendMessage("callFunctionReturnFlushedQueue", [moduleName, methodName, args]);
  }

  enqueueJSCallWithDotMethod(moduleDotMethod, args) {
    const ids = moduleDotMethod.split(".");
    const module = ids[0];
    const method = ids[1];
    this.enqueueJSCall(module, method, args);
  }

  enqueueJSCallback(id, args) {
    this.sendMessage("invokeCallbackAndReturnFlushedQueue", [id, args]);
  }

  callbackFromId(id) {
    return (...args) => {
      this.enqueueJSCallback(id, args);
    };
  }

  frame() {
    this.sendMessage("flush");

    const messages = [...this.messages];
    this.messages = [];

    messages.forEach(({ moduleId, methodId, args }) => {
      this.callNativeModule(moduleId, methodId, args);
    });
  }
}, _class.RCTModuleClasses = [], _class.RCTRegisterModule = cls => {
  RCTBridge.RCTModuleClasses.push(cls);
}, _initialiseProps = function () {
  this.modulesByName = {};
  this.moduleClasses = [];
  this.moduleConfigs = [];
  this.messages = [];
  this.queue = [];
  this.executing = false;

  this.initializeModules = () => {
    this.moduleClasses = [...RCTBridge.RCTModuleClasses];
    RCTBridge.RCTModuleClasses.forEach(moduleClass => {
      const module = new moduleClass(this);
      const moduleName = bridgeModuleNameForClass(moduleClass);
      this.modulesByName[moduleName] = module;
    });
  };

  this.getInitialModuleConfig = () => {
    const remoteModuleConfig = Object.keys(this.modulesByName).map(moduleName => {
      const bridgeModule = this.modulesByName[moduleName];
      return this.generateModuleConfig(moduleName, bridgeModule);
    });
    return { remoteModuleConfig };
  };
}, _temp);
exports.default = RCTBridge;
function RCT_EXPORT_METHOD(type) {
  return (target, key, descriptor) => {
    if (typeof descriptor.value === "function") {
      Object.defineProperty(target, `__rct_export__${key}`, babelHelpers.extends({}, descriptor, {
        value: () => [key, type]
      }));
    }

    return descriptor;
  };
}

const RCT_EXPORT_MODULE = exports.RCT_EXPORT_MODULE = target => {
  target.__moduleName = target.prototype.constructor.name;
  RCTBridge.RCTRegisterModule(target);
};
}, 15, null, "RCTBridge");
__d(/* Invariant */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _invariant = require(17                  ); // 17 = fbjs/lib/invariant

var _invariant2 = babelHelpers.interopRequireDefault(_invariant);

exports.default = _invariant2.default;
}, 16, null, "Invariant");
__d(/* fbjs/lib/invariant.js */function(global, require, module, exports) {

'use strict';

var validateFormat = function validateFormat(format) {};

if ('development' !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1;
    throw error;
  }
}

module.exports = invariant;
}, 17, null, "fbjs/lib/invariant.js");
__d(/* RCTModuleConfig */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moduleConfigFactory = moduleConfigFactory;
function moduleConfigFactory(name, constants, functions, promiseMethodIDs, syncMethodIDs) {
  return [name, constants, functions, promiseMethodIDs, syncMethodIDs];
}
}, 18, null, "RCTModuleConfig");
__d(/* RCTBridgeMethod */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const RCTFunctionTypeNormal = exports.RCTFunctionTypeNormal = "async";
const RCTFunctionTypePromise = exports.RCTFunctionTypePromise = "promise";
const RCTFunctionTypeSync = exports.RCTFunctionTypeSync = "sync";
}, 19, null, "RCTBridgeMethod");
__d(/* RCTUIManager */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _desc, _value, _class2;

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _RCTComponentData = require(21                ); // 21 = RCTComponentData

var _RCTComponentData2 = babelHelpers.interopRequireDefault(_RCTComponentData);

var _RCTViewManager = require(22              ); // 22 = RCTViewManager

var _RCTViewManager2 = babelHelpers.interopRequireDefault(_RCTViewManager);

var _UIView = require(23      ); // 23 = UIView

var _UIView2 = babelHelpers.interopRequireDefault(_UIView);

var _RCTRootView = require(14           ); // 14 = RCTRootView

var _RCTRootView2 = babelHelpers.interopRequireDefault(_RCTRootView);

var _RCTDeviceInfo = require(34             ); // 34 = RCTDeviceInfo

var _RCTDeviceInfo2 = babelHelpers.interopRequireDefault(_RCTDeviceInfo);

var _RCTRootShadowView = require(38                 ); // 38 = RCTRootShadowView

var _RCTRootShadowView2 = babelHelpers.interopRequireDefault(_RCTRootShadowView);

var _RCTLayoutAnimationManager = require(39                         ); // 39 = RCTLayoutAnimationManager

var _RCTLayoutAnimationManager2 = babelHelpers.interopRequireDefault(_RCTLayoutAnimationManager);

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let rootTagCounter = 0;

let RCTUIManager = (_dec = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec2 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec3 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec4 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec5 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec6 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec7 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec8 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = (_class2 = class RCTUIManager {

  constructor(bridge) {
    this.pendingUIBlocks = [];

    this.didUpdateDimensions = ({ window: { width, height } }) => {
      for (let rootViewTag of this.rootViewTags) {
        const rootView = this.viewRegistry.get(rootViewTag);

        (0, _Invariant2.default)(rootView, "Root view must exist");
        (0, _Invariant2.default)(rootView instanceof _RCTRootView2.default, "View must be an RCTRootView");
        this.addUIBlock(() => {
          this.setAvailableSize({ width, height }, rootView);
        });
      }
    };

    this.bridge = bridge;

    this.shadowViewRegistry = new Map();
    this.viewRegistry = new Map();

    this.rootViewTags = new Set();

    this.componentDataByName = new Map();
    this.bridge.moduleClasses.forEach(moduleClass => {
      if (moduleClass.__isViewManager) {
        const componentData = new _RCTComponentData2.default(moduleClass, this.bridge);
        this.componentDataByName.set(componentData.name, componentData);
      }
    });

    this.layoutAnimationManager = new _RCTLayoutAnimationManager2.default(this);

    (0, _Invariant2.default)(this.bridge, "Bridge must be set");
    const deviceInfoModule = this.bridge.modulesByName["DeviceInfo"];
    deviceInfoModule.addListener("didUpdateDimensions", this.didUpdateDimensions);
  }

  get allocateRootTag() {
    const tag = rootTagCounter;
    rootTagCounter++;
    return tag * 10 + 1;
  }

  registerRootView(rootView) {
    const reactTag = rootView.reactTag;
    const availableSize = rootView.availableSize;

    this.viewRegistry.set(reactTag, rootView);

    const shadowView = new _RCTRootShadowView2.default();
    shadowView.availableSize = availableSize;
    shadowView.reactTag = reactTag;
    shadowView.backgroundColor = rootView.backgroundColor;
    shadowView.viewName = rootView.constructor.name;

    this.shadowViewRegistry.set(reactTag, shadowView);
    this.rootViewTags.add(reactTag);
  }

  setAvailableSize(size, rootView) {
    this.pendingUIBlocks.push(() => {
      const reactTag = rootView.reactTag;
      const rootShadowView = this.shadowViewRegistry.get(reactTag);
      if (rootShadowView && rootShadowView instanceof _RCTRootShadowView2.default) rootShadowView.updateAvailableSize(size);
    });
  }

  rootViewForReactTag(reactTag, completion) {}

  purgeView(reactTag) {
    const shadowView = this.shadowViewRegistry.get(reactTag);
    if (shadowView) {
      this.shadowViewRegistry.delete(reactTag);
      shadowView.purge();
    }

    if (this.layoutAnimationManager.isPending()) {
      this.layoutAnimationManager.queueRemovedNode(reactTag);
    } else {
      this.addUIBlock((uiManager, viewRegistry) => {
        const view = viewRegistry.get(reactTag);
        viewRegistry.delete(reactTag);
        view.purge();
      });
    }
  }

  frame() {
    if (this.pendingUIBlocks.length > 0) {
      const uiBlocks = [...this.pendingUIBlocks];
      this.pendingUIBlocks = [];

      uiBlocks.forEach(block => {
        block.call(null, this, this.viewRegistry);
      });
    }

    this.rootViewTags.forEach(rootTag => {
      const rootShadowView = this.shadowViewRegistry.get(rootTag);
      if (rootShadowView != null && rootShadowView.isDirty) {
        (0, _Invariant2.default)(rootShadowView instanceof _RCTRootShadowView2.default, "attempting to recalculate from shadowView that isn't root");
        const layoutChanges = rootShadowView.recalculateLayout();

        if (this.layoutAnimationManager.isPending()) {
          this.layoutAnimationManager.addLayoutChanges(layoutChanges);
        } else {
          this.addUIBlock(() => {
            this.applyLayoutChanges(layoutChanges);
          });
        }
      }
    });

    if (this.layoutAnimationManager.isPending()) {
      this.layoutAnimationManager.applyLayoutChanges();
    }
  }

  applyLayoutChanges(layoutChanges) {
    layoutChanges.forEach(layoutChange => {
      const { reactTag, layout } = layoutChange;
      const view = this.viewRegistry.get(reactTag);
      (0, _Invariant2.default)(view, `View with reactTag ${reactTag} does not exist`);
      view.frame = layout;
    });
  }

  measure(reactTag, callbackId) {
    const cb = this.bridge.callbackFromId(callbackId);

    let shadowView = this.shadowViewRegistry.get(reactTag);

    if (!shadowView || !shadowView.measurement) {
      cb();
      return;
    }

    let { left, top, width, height } = shadowView.measurement;

    cb(left, top, width, height);
  }

  setJSResponder(reactTag) {
    this.addUIBlock(() => {
      this.jsResponder = this.viewRegistry.get(reactTag);
      if (!this.jsResponder) {
        console.error(`Invalid view set to be the JS responder - tag ${reactTag}`);
      }
    });
  }

  clearJSResponder() {
    this.jsResponder = null;
  }

  configureNextLayoutAnimation(config, onAnimationDidEnd) {
    this.addUIBlock(() => {
      this.layoutAnimationManager.configureNext(config, this.bridge.callbackFromId(onAnimationDidEnd));
    });
  }

  addUIBlock(block) {
    if (block == null || this.viewRegistry == null) {
      return;
    }
    this.pendingUIBlocks.push(block);
  }

  setChildren(containerTag, reactTags) {
    RCTUIManager.RCTSetChildren(containerTag, reactTags, this.shadowViewRegistry);

    this.addUIBlock((uiManager, viewRegistry) => {
      RCTUIManager.RCTSetChildren(containerTag, reactTags, viewRegistry);
    });
  }

  static RCTSetChildren(containerTag, reactTags, registry) {
    const container = registry.get(containerTag);
    let index = 0;
    reactTags.forEach(reactTag => {
      const view = registry.get(reactTag);
      (0, _Invariant2.default)(container, `No container view found with id: ${containerTag}`);
      (0, _Invariant2.default)(view, `No view found with id: ${reactTag}`);
      container.insertReactSubviewAtIndex(view, index++);
    });
  }

  createView(reactTag, viewName, rootTag, props) {
    const componentData = this.componentDataByName.get(viewName);
    (0, _Invariant2.default)(componentData, `No component found for view with name ${viewName}`);

    const shadowView = componentData.createShadowView(reactTag);
    if (shadowView != null) {
      componentData.setPropsForShadowView(props, shadowView);
      this.shadowViewRegistry.set(reactTag, shadowView);
    }

    const backgroundColor = shadowView.backgroundColor;

    const view = componentData.createView(reactTag);
    if (view != null) {
      componentData.setPropsForView(props, view);

      if (typeof view.setBackgroundColor === "function") {
        view.setBackgroundColor(backgroundColor);
      }

      this.viewRegistry.set(reactTag, view);
    }
  }

  updateView(reactTag, viewName, updatedProps) {
    const componentData = this.componentDataByName.get(viewName);
    (0, _Invariant2.default)(componentData, `No component found for view with name ${viewName}`);

    const shadowView = this.shadowViewRegistry.get(reactTag);
    if (shadowView) {
      componentData.setPropsForShadowView(updatedProps, shadowView);
    }

    const view = this.viewRegistry.get(reactTag);
    if (view) {
      componentData.setPropsForView(updatedProps, view);
    }
  }

  manageChildren(tag, moveFrom, moveTo, addChildTags, addAtIndices, removeFrom) {
    const viewToManage = this.viewRegistry.get(tag);
    const shadowViewToManage = this.shadowViewRegistry.get(tag);

    if (!viewToManage || !shadowViewToManage) return;

    const numToMove = !moveFrom ? 0 : moveFrom.length;

    const viewsToAdd = [];
    const indicesToRemove = [];
    const tagsToRemove = [];
    const tagsToDelete = [];

    if (moveFrom && moveTo) {
      for (let i = 0; i < moveFrom.length; i++) {
        const moveFromIndex = moveFrom[i];
        const tagToMove = viewToManage.reactSubviews[moveFromIndex].reactTag;
        viewsToAdd[i] = {
          tag: tagToMove,
          index: moveTo[i]
        };
        indicesToRemove[i] = moveFromIndex;
        tagsToRemove[i] = tagToMove;
      }
    }

    if (addChildTags) {
      for (let i = 0; i < addChildTags.length; i++) {
        const viewTagToAdd = addChildTags[i];
        const indexToAddAt = addAtIndices[i];
        viewsToAdd[numToMove + i] = {
          tag: viewTagToAdd,
          index: indexToAddAt
        };
      }
    }

    if (removeFrom) {
      for (let i = 0; i < removeFrom.length; i++) {
        const indexToRemove = removeFrom[i];
        const tagToRemove = viewToManage.reactSubviews[indexToRemove].reactTag;
        indicesToRemove[numToMove + i] = indexToRemove;
        tagsToRemove[numToMove + i] = tagToRemove;
        tagsToDelete[i] = tagToRemove;
      }
    }

    viewsToAdd.sort(function (a, b) {
      return a.index - b.index;
    });
    indicesToRemove.sort(function (a, b) {
      return a - b;
    });

    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const childIndex = indicesToRemove[i];

      const shadowSubView = shadowViewToManage.reactSubviews[childIndex];
      if (shadowSubView) shadowViewToManage.removeReactSubview(shadowSubView);

      this.addUIBlock((uiManager, viewRegistry) => {
        const subView = viewToManage.reactSubviews[childIndex];
        viewToManage.removeReactSubview(subView);
      });
    }

    for (let i = 0; i < viewsToAdd.length; i++) {
      const { tag: tagToAdd, index: indexToAdd } = viewsToAdd[i];

      const shadowSubView = this.shadowViewRegistry.get(tagToAdd);
      if (shadowSubView) {
        shadowViewToManage.insertReactSubviewAtIndex(shadowSubView, indexToAdd);
        shadowSubView.makeDirty();
      }

      this.addUIBlock((uiManager, viewRegistry) => {
        const subView = viewRegistry.get(tagToAdd);
        viewToManage.insertReactSubviewAtIndex(subView, indexToAdd);
      });
    }

    const postShadowChildren = shadowViewToManage.reactSubviews.length;

    for (let i = 0; i < tagsToDelete.length; i++) {
      this.purgeView(tagsToDelete[i]);
    }
  }

  constantsToExport() {
    const constants = {};
    const bubblingEvents = {};

    for (const [name, componentData] of this.componentDataByName) {
      const moduleConstants = {};

      moduleConstants.Manager = (0, _RCTBridge.bridgeModuleNameForClass)(componentData.managerClass);

      const viewConfig = componentData.viewConfig;
      moduleConstants.NativeProps = viewConfig.propTypes;

      for (let eventName of viewConfig.bubblingEvents) {
        if (!bubblingEvents[eventName]) {
          const bubbleName = `on${eventName.substring(3)}`;
          bubblingEvents[eventName] = {
            phasedRegistrationNames: {
              bubbled: bubbleName,
              captured: `${bubbleName}Capture`
            }
          };
        }
      }

      constants[name] = moduleConstants;
    }

    constants["customBubblingEventTypes"] = bubblingEvents;
    constants["customDirectEventTypes"] = {};

    return constants;
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "measure", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "measure"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setJSResponder", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "setJSResponder"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clearJSResponder", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "clearJSResponder"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "configureNextLayoutAnimation", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "configureNextLayoutAnimation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setChildren", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "setChildren"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createView", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "createView"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateView", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "updateView"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "manageChildren", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "manageChildren"), _class2.prototype)), _class2)) || _class);
exports.default = RCTUIManager;
}, 20, null, "RCTUIManager");
__d(/* RCTComponentData */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _RCTUIManager = require(20            ); // 20 = RCTUIManager

var _RCTUIManager2 = babelHelpers.interopRequireDefault(_RCTUIManager);

var _RCTViewManager = require(22              ); // 22 = RCTViewManager

var _RCTViewManager2 = babelHelpers.interopRequireDefault(_RCTViewManager);

var _RCTShadowView = require(25             ); // 25 = RCTShadowView

var _RCTShadowView2 = babelHelpers.interopRequireDefault(_RCTShadowView);

var _RCTComponent = require(32            ); // 32 = RCTComponent

var _RCTComponent2 = babelHelpers.interopRequireDefault(_RCTComponent);

var _UIView = require(23      ); // 23 = UIView

var _UIView2 = babelHelpers.interopRequireDefault(_UIView);

var _RCTEventDispatcher = require(33                  ); // 33 = RCTEventDispatcher

let RCTComponentData = class RCTComponentData {

  constructor(managerClass, bridge) {
    this.bridge = bridge;
    this.managerClass = managerClass;
    this.viewPropBlocks = {};
    this.shadowPropBlocks = {};

    this.name = (() => {
      const moduleName = managerClass.__moduleName;

      if (moduleName.endsWith("Manager")) {
        return moduleName.substring(0, moduleName.length - "Manager".length);
      }

      return moduleName;
    })();
  }

  get manager() {
    if (this._manager == null) {
      this._manager = this.bridge.moduleForClass(this.managerClass);
    }
    (0, _Invariant2.default)(this._manager, "RCTComponentData's view manager must be set");
    return this._manager;
  }

  get viewConfig() {
    const count = 0;
    const propTypes = {};
    const bubblingEvents = [];

    if (this.manager.customBubblingEventTypes) {
      const events = this.manager.customBubblingEventTypes();
      for (let event of events) {
        bubblingEvents.push((0, _RCTEventDispatcher.normalizeInputEventName)(event));
      }
    }

    this.manager.__props.forEach(({ name, type, exported }) => {
      if (exported) {
        if (type === "RCTBubblingEventBlock") {
          bubblingEvents.push((0, _RCTEventDispatcher.normalizeInputEventName)(name));
          propTypes[name] = "BOOL";
        } else {
          propTypes[name] = type;
        }
      }
    });

    return {
      propTypes,
      bubblingEvents,
      uiClassViewName: (0, _RCTBridge.bridgeModuleNameForClass)(this.manager.constructor)
    };
  }

  generatePropConfig(rawPropConfig) {
    return rawPropConfig.reduce((propConfig, raw) => babelHelpers.extends({}, propConfig, {
      [raw.name]: {
        type: raw.type,
        setter: raw.setter ? raw.setter : (view, value) => {
          view[raw.name] = value;
        }
      }
    }), {});
  }

  get propConfig() {
    if (this._propConfig == null) {
      this._propConfig = this.generatePropConfig(this.manager.__props);
    }

    return this._propConfig;
  }

  get shadowPropConfig() {
    if (this._shadowPropConfig == null) {
      this._shadowPropConfig = this.generatePropConfig(this.manager.__shadowProps);
    }

    return this._shadowPropConfig;
  }

  createView(tag) {
    const view = this.manager.view();
    view.reactTag = tag;
    return view;
  }

  createShadowView(tag) {
    const shadowView = this.manager.shadowView();
    shadowView.reactTag = tag;
    return shadowView;
  }

  setPropsForView(props, view) {
    if (props) {
      Object.keys(props).forEach(propName => {
        if (this.propConfig.hasOwnProperty(propName)) {
          const propConfig = this.propConfig[propName];
          const propValue = props[propName];
          const setter = propConfig.setter;

          setter(view, propValue);
        }
      });
    }
  }

  setPropsForShadowView(props, shadowView) {
    if (props) {
      Object.keys(props).forEach(propName => {
        if (this.shadowPropConfig.hasOwnProperty(propName)) {
          const propConfig = this.shadowPropConfig[propName];
          const propValue = props[propName];
          const setter = propConfig.setter;

          setter(shadowView, propValue);
        }
      });
    }
  }
};
exports.default = RCTComponentData;
}, 21, null, "RCTComponentData");
__d(/* RCTViewManager */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _dec2, _dec3, _dec4, _dec5, _class, _desc, _value, _class2, _class3, _temp;

exports.RCT_EXPORT_VIEW_PROP = RCT_EXPORT_VIEW_PROP;
exports.RCT_EXPORT_SHADOW_PROP = RCT_EXPORT_SHADOW_PROP;
exports.RCT_EXPORT_MIRRORED_PROP = RCT_EXPORT_MIRRORED_PROP;
exports.RCT_EXPORT_DIRECT_SHADOW_PROPS = RCT_EXPORT_DIRECT_SHADOW_PROPS;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _UIView = require(23      ); // 23 = UIView

var _UIView2 = babelHelpers.interopRequireDefault(_UIView);

var _RCTShadowView = require(25             ); // 25 = RCTShadowView

var _RCTShadowView2 = babelHelpers.interopRequireDefault(_RCTShadowView);

var _RCTView = require(31       ); // 31 = RCTView

var _RCTView2 = babelHelpers.interopRequireDefault(_RCTView);

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function RCT_EXPORT_VIEW_PROP(name, type, exported = true) {
  return (target, key, descriptor) => {
    if (typeof descriptor.value === "function") {
      if (target.__props == null) {
        target.__props = [];
      }

      target.__props = target.__props.concat([{
        name,
        type,
        setter: descriptor.value,
        exported
      }]);
    }

    return descriptor;
  };
}

function RCT_EXPORT_SHADOW_PROP(name, type, exported = true) {
  return (target, key, descriptor) => {
    if (typeof descriptor.value === "function") {
      if (target.__shadowProps == null) {
        target.__shadowProps = [];
      }

      target.__shadowProps = target.__shadowProps.concat([{
        name,
        type,
        setter: descriptor.value,
        exported
      }]);
    }

    return descriptor;
  };
}

function RCT_EXPORT_MIRRORED_PROP(...exportArgs) {
  return (...descriptorArgs) => {
    RCT_EXPORT_VIEW_PROP(...exportArgs)(...descriptorArgs);
    RCT_EXPORT_SHADOW_PROP(...exportArgs)(...descriptorArgs);
    return descriptorArgs[2];
  };
}

function RCT_EXPORT_DIRECT_SHADOW_PROPS(target, key, descriptor) {
  if (typeof descriptor.value === "function") {
    if (target.__shadowProps == null) {
      target.__shadowProps = [];
    }

    const directPropConfigs = descriptor.value().map(([name, type]) => ({
      name,
      type,
      exported: false
    }));

    target.__shadowProps = target.__shadowProps.concat(directPropConfigs);
  }

  return descriptor;
}

let RCTViewManager = (_dec = RCT_EXPORT_VIEW_PROP("backgroundColor", "Color"), _dec2 = RCT_EXPORT_VIEW_PROP("opacity", "number"), _dec3 = RCT_EXPORT_MIRRORED_PROP("transform", "array"), _dec4 = RCT_EXPORT_VIEW_PROP("borderRadius", "number"), _dec5 = RCT_EXPORT_VIEW_PROP("onStartShouldSetResponder", "bool"), (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = (_class2 = (_temp = _class3 = class RCTViewManager {

  view() {
    return new _RCTView2.default();
  }

  shadowView() {
    return new _RCTShadowView2.default();
  }

  customBubblingEventTypes() {
    return ["press", "change", "focus", "blur", "submitEditing", "endEditing", "keyPress", "touchStart", "touchMove", "touchCancel", "touchEnd"];
  }

  setBackgroundColor(view, value) {
    view.backgroundColor = value;
  }

  setOpacity(view, value) {
    view.opacity = value;
  }

  setTransform(view, value) {
    view.transform = value;
  }

  setBorderRadius(view, value) {
    view.borderRadius = value;
  }

  setOnStartShouldSetResponder(view, value) {
    view.touchable = value;
  }

  getDirectShadowViewProps() {
    return [["top", "string"], ["right", "string"], ["bottom", "string"], ["left", "string"], ["width", "string"], ["height", "string"], ["minWidth", "string"], ["maxWidth", "string"], ["minHeight", "string"], ["minWidth", "string"], ["borderTopWidth", "string"], ["borderRightWidth", "string"], ["borderBottomWidth", "string"], ["borderLeftWidth", "string"], ["borderWidth", "string"], ["marginTop", "string"], ["marginRight", "string"], ["marginBottom", "string"], ["marginLeft", "string"], ["marginVertical", "string"], ["marginHorizontal", "string"], ["margin", "string"], ["paddingTop", "string"], ["paddingRight", "string"], ["paddingBottom", "string"], ["paddingLeft", "string"], ["paddingVertical", "string"], ["paddingHorizontal", "string"], ["padding", "string"], ["flex", "string"], ["flexGrow", "string"], ["flexShrink", "string"], ["flexBasis", "string"], ["flexDirection", "string"], ["flexWrap", "string"], ["justifyContent", "string"], ["alignItems", "string"], ["alignSelf", "string"], ["alignContent", "string"], ["position", "string"], ["aspectRatio", "string"], ["overflow", "string"], ["display", "string"]];
  }
}, _class3.__isViewManager = true, _class3.__props = [], _temp), (_applyDecoratedDescriptor(_class2.prototype, "setBackgroundColor", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "setBackgroundColor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setOpacity", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "setOpacity"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setTransform", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "setTransform"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setBorderRadius", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "setBorderRadius"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setOnStartShouldSetResponder", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "setOnStartShouldSetResponder"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getDirectShadowViewProps", [RCT_EXPORT_DIRECT_SHADOW_PROPS], Object.getOwnPropertyDescriptor(_class2.prototype, "getDirectShadowViewProps"), _class2.prototype)), _class2)) || _class);
exports.default = RCTViewManager;
}, 22, null, "RCTViewManager");
__d(/* UIView */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FrameZero = undefined;

var _dec, _class;

var _CustomElement = require(24             ); // 24 = CustomElement

var _CustomElement2 = babelHelpers.interopRequireDefault(_CustomElement);

(function () {
  var typesToPatch = ["DocumentType", "Element", "CharacterData"],
      remove = function () {
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  };

  for (var i = 0; i < typesToPatch.length; i++) {
    var type = typesToPatch[i];
    if (window[type] && !window[type].prototype.remove) {
      window[type].prototype.remove = remove;
    }
  }
})();

const FrameZero = exports.FrameZero = {
  top: 0,
  left: 0,
  width: 0,
  height: 0
};

const ColorArrayFromHexARGB = function (hex) {
  hex = Math.floor(hex);
  return [(hex >> 24 & 255) / 255, hex >> 16 & 255, hex >> 8 & 255, hex & 255];
};

const baseDimension = 1000;

let UIView = (_dec = (0, _CustomElement2.default)("ui-view"), _dec(_class = class UIView extends HTMLElement {

  constructor() {
    super();

    this.reactSubviews = [];
    this.hasBeenFramed = false;
    this.opacity = 0;

    this.position = "absolute";
    this.backgroundColor = "transparent";
    this.style.overflow = "hidden";
    this.borderRadius = 0;
  }

  get frame() {
    return {
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height
    };
  }

  set frame(value) {
    Object.assign(this, value);
    if (!this.hasBeenFramed) {
      this.hasBeenFramed = true;
      this.opacity = 1;
    }
  }

  get position() {
    return this.style.position;
  }

  set position(value) {
    this.style.position = value;
  }

  get top() {
    return this._top;
  }

  set top(value) {
    this._top = value;
    this.updatePosition();
  }

  get left() {
    return this._left;
  }

  set left(value) {
    this._left = value;
    this.updatePosition();
  }

  get bottom() {
    return this._bottom;
  }

  set bottom(value) {
    this._bottom = value;
    this.style.bottom = `${value}px`;
  }

  get right() {
    return this._right;
  }

  set right(value) {
    this._right = value;
    this.style.right = `${value}px`;
  }

  updatePosition() {
    let transformString = "";

    if (this._left) transformString += `translateX(${this._left}px)`;
    if (this._top) transformString += `translateY(${this._top}px)`;

    this.style.transform = transformString;
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = value;
    this.style.width = `${value}px`;
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = value;
    this.style.height = `${value}px`;
  }

  get backgroundColor() {
    return this.style.backgroundColor;
  }

  set backgroundColor(value) {
    if (typeof value === "number") {
      const [a, r, g, b] = ColorArrayFromHexARGB(value);
      const stringValue = `rgba(${r},${g},${b},${a})`;
      this.style.backgroundColor = stringValue;
    } else {
      this.style.backgroundColor = value;
    }
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value) {
    this._opacity = value;
    this.style.opacity = `${value}`;
  }

  get borderRadius() {
    return this._borderRadius;
  }

  set borderRadius(value) {
    this._borderRadius = value;
    this.style.borderRadius = `${value}px`;
  }

  get touchable() {
    return this._touchable;
  }

  set touchable(value) {
    this._touchable = value;
    this.style.cursor = value ? "pointer" : "auto";
  }

  insertReactSubviewAtIndex(subview, index) {
    if (index === this.reactSubviews.length) {
      this.appendChild(subview);
    } else {
      const beforeElement = this.reactSubviews[index];
      this.insertBefore(subview, beforeElement);
    }

    this.reactSubviews.splice(index, 0, subview);
    subview.reactSuperview = this;
  }

  removeReactSubview(subview) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
  }

  purge() {
    this.remove();
  }

  addGestureRecognizer(handler) {
    this.addEventListener("mousedown", handler.mouseClickBegan.bind(handler));
  }

  removeGestureRecognizer(handler) {}
}) || _class);
exports.default = UIView;
}, 23, null, "UIView");
__d(/* CustomElement */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CustomElement;
function CustomElement(name) {
  return function (target) {
    customElements.define(name, target);
  };
}
}, 24, null, "CustomElement");
__d(/* RCTShadowView */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SHADOW_PROPS = undefined;

var _yogaJs = require(26       ); // 26 = yoga-js

var _yogaJs2 = babelHelpers.interopRequireDefault(_yogaJs);

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

const SHADOW_PROPS = exports.SHADOW_PROPS = ["top", "right", "bottom", "left", "width", "height", "minWidth", "maxWidth", "minHeight", "minWidth", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderWidth", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginVertical", "marginHorizontal", "margin", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingVertical", "paddingHorizontal", "padding", "flex", "flexGrow", "flexShrink", "flexBasis", "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignSelf", "alignContent", "position", "aspectRatio", "overflow", "display"];

const LAYOUT_PROPS = ["top", "left", "width", "height"];

let RCTShadowView = class RCTShadowView {

  constructor() {
    this.isDirty = true;
    this.reactSubviews = [];

    this.yogaNode = new _yogaJs2.default();

    SHADOW_PROPS.forEach(shadowPropName => {
      Object.defineProperty(this, shadowPropName, {
        configurable: true,
        get: () => this.yogaNode.style[shadowPropName],
        set: value => {
          this.yogaNode.style[shadowPropName] = value;
          this.makeDirty();
          return true;
        }
      });
    });

    this.previousLayout = undefined;
    this.measurement = undefined;
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(value) {
    this._backgroundColor = value;
  }

  getLayoutChanges(previousPosition) {
    let layoutChanges = [];

    const newLayout = this.yogaNode.layout;

    const currentPosition = {
      top: previousPosition.top + newLayout.top,
      left: previousPosition.left + newLayout.left
    };

    const previousMeasurement = this.measurement ? babelHelpers.extends({}, this.measurement) : null;

    const nextMeasurement = babelHelpers.extends({}, currentPosition, {
      width: newLayout.width,
      height: newLayout.height
    });

    if (JSON.stringify(newLayout) !== JSON.stringify(this.previousLayout)) {
      layoutChanges.push({
        reactTag: this.reactTag,
        layout: newLayout,
        previousMeasurement,
        nextMeasurement
      });

      this.previousLayout = newLayout;

      this.reactSubviews.forEach(subView => {
        layoutChanges = layoutChanges.concat(subView.getLayoutChanges(currentPosition));
      });
    } else {
      const shouldUpdateChildren = (() => {
        let result = false;
        this.reactSubviews.forEach(subView => {
          if (subView.isDirty) {
            result = true;
          }
        });
        return result;
      })();

      if (shouldUpdateChildren) {
        this.reactSubviews.forEach(subView => {
          layoutChanges = layoutChanges.concat(subView.getLayoutChanges(currentPosition));
        });
      }
    }

    this.measurement = babelHelpers.extends({}, nextMeasurement);
    this.isDirty = false;
    return layoutChanges;
  }

  makeDirty() {
    this.isDirty = true;

    let view = this;
    while (view.reactSuperview) {
      view = view.reactSuperview;
      view.isDirty = true;
    }
  }

  makeDirtyRecursive() {
    this.reactSubviews.forEach(subView => {
      subView.makeDirtyRecursive();
    });
    this.isDirty = true;
  }

  insertReactSubviewAtIndex(subview, index) {
    subview.reactSuperview = this;
    this.reactSubviews.splice(index, 0, subview);
    this.yogaNode.insertChild(subview.yogaNode, index);
    this.makeDirty();
  }

  removeReactSubview(subview) {
    subview.reactSuperview = undefined;
    this.reactSubviews = this.reactSubviews.filter(s => s !== subview);
    this.yogaNode.removeChild(subview.yogaNode);
    this.makeDirty();
  }

  purge() {
    this.yogaNode.freeRecursive();
  }

  didSetProps(changedProps) {}
  didUpdateReactSubviews() {}
  reactTagAtPoint(point) {
    return 0;
  }
};
exports.default = RCTShadowView;
}, 25, null, "RCTShadowView");
__d(/* yoga-js/dist/yogajs.cjs.js */function(global, require, module, exports) {'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Yoga = _interopDefault(require(27           )); // 27 = yoga-layout

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MEASURE_MODE_EXACTLY = Yoga.MEASURE_MODE_EXACTLY;
var MEASURE_MODE_UNDEFINED = Yoga.MEASURE_MODE_UNDEFINED;
var MEASURE_MODE_COUNT = Yoga.MEASURE_MODE_COUNT;
var MEASURE_MODE_AT_MOST = Yoga.MEASURE_MODE_AT_MOST;

var BASE_NODE = Yoga.Node.create();

var positionEdgeMapping = {
  left: Yoga.EDGE_LEFT,
  right: Yoga.EDGE_RIGHT,
  top: Yoga.EDGE_TOP,
  bottom: Yoga.EDGE_BOTTOM
};

var marginEdgeMapping = {
  marginBottom: Yoga.EDGE_BOTTOM,
  marginHorizontal: Yoga.EDGE_HORIZONTAL,
  marginLeft: Yoga.EDGE_LEFT,
  marginRight: Yoga.EDGE_RIGHT,
  marginTop: Yoga.EDGE_TOP,
  marginVertical: Yoga.EDGE_VERTICAL
};

var paddingEdgeMapping = {
  paddingBottom: Yoga.EDGE_BOTTOM,
  paddingHorizontal: Yoga.EDGE_HORIZONTAL,
  paddingLeft: Yoga.EDGE_LEFT,
  paddingRight: Yoga.EDGE_RIGHT,
  paddingTop: Yoga.EDGE_TOP,
  paddingVertical: Yoga.EDGE_VERTICAL
};

var borderEdgeMapping = {
  borderBottomWdith: Yoga.EDGE_BOTTOM,
  borderLeftWidth: Yoga.EDGE_LEFT,
  borderRightWidth: Yoga.EDGE_RIGHT,
  borderTopWidth: Yoga.EDGE_TOP
};

var alignEnumMapping = {
  auto: Yoga.ALIGN_AUTO,
  "flex-start": Yoga.ALIGN_FLEX_START,
  center: Yoga.ALIGN_CENTER,
  "flex-end": Yoga.ALIGN_FLEX_END,
  stretch: Yoga.ALIGN_STRETCH,
  baseline: Yoga.ALIGN_BASELINE,
  "space-between": Yoga.ALIGN_SPACE_BETWEEN,
  "space-around": Yoga.ALIGN_SPACE_AROUND
};

var flexDirectionEnumMapping = {
  column: Yoga.FLEX_DIRECTION_COLUMN,
  "column-reverse": Yoga.FLEX_DIRECTION_COLUMN_REVERSE,
  row: Yoga.FLEX_DIRECTION_ROW,
  "row-reverse": Yoga.FLEX_DIRECTION_ROW_REVERSE
};

var flexWrapEnumMapping = {
  "no-wrap": Yoga.WRAP_NO_WRAP,
  wrap: Yoga.WRAP_WRAP,
  "wrap-reverse": Yoga.WRAP_WRAP_REVERSE
};

var justifyContentEnumMapping = {
  "flex-start": Yoga.JUSTIFY_FLEX_START,
  center: Yoga.JUSTIFY_CENTER,
  "flex-end": Yoga.JUSTIFY_FLEX_END,
  "space-between": Yoga.JUSTIFY_SPACE_BETWEEN,
  "space-around": Yoga.JUSTIFY_SPACE_AROUND
};

var overflowEnumMapping = {
  visible: Yoga.OVERFLOW_VISIBLE,
  hidden: Yoga.OVERFLOW_HIDDEN,
  scroll: Yoga.OVERFLOW_SCROLL
};

var displayEnumMapping = {
  flex: Yoga.DISPLAY_FLEX,
  none: Yoga.DISPLAY_NONE
};

var positionTypeEnumMapping = {
  relative: Yoga.POSITION_TYPE_RELATIVE,
  absolute: Yoga.POSITION_TYPE_ABSOLUTE
};

function checkMappingValue(mapping, value) {
  if (!mapping.hasOwnProperty(value)) {
    throw new Error("invalid value");
  }
}

function shorthandSetter(node, target, property, value, nodeEdgeSetter) {
  if (typeof value === "string") {
    var valueList = value.split(" ");

    if (valueList.length < 1 || valueList.length > 4) return false;

    switch (valueList.length) {
      case 1:
        {
          nodeEdgeSetter(Yoga.EDGE_ALL, valueList[0]);
        }
      case 2:
        {
          nodeEdgeSetter(Yoga.EDGE_VERTICAL, valueList[0]);
          nodeEdgeSetter(Yoga.EDGE_HORIZONTAL, valueList[1]);
        }
      case 3:
        {
          nodeEdgeSetter(Yoga.EDGE_TOP, valueList[0]);
          nodeEdgeSetter(Yoga.EDGE_HORIZONTAL, valueList[1]);
          nodeEdgeSetter(Yoga.EDGE_BOTTOM, valueList[2]);
        }
      case 4:
        {
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

function edgeSetters(edgeMapping, nodeEdgeSetter) {
  return Object.keys(edgeMapping).reduce(function (prev, propName) {
    return _extends({}, prev, _defineProperty({}, propName, function (node, target, property, value) {
      var edge = edgeMapping[property];
      return setterBase(node, target, property, value, nodeEdgeSetter, edge, value);
    }));
  }, {});
}

function setterBase(node, target, property, value, setterName) {
  var nodeSetter = node[setterName];
  if (typeof nodeSetter === "function") {
    for (var _len = arguments.length, setterArgs = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
      setterArgs[_key - 5] = arguments[_key];
    }

    nodeSetter.call.apply(nodeSetter, [node].concat(setterArgs));
    return Reflect.set(target, property, value);
  } else {
    return false;
  }
}

function valueSetter(setterName) {
  return function (node, target, property, value) {
    return setterBase(node, target, property, value, setterName, value);
  };
}

function enumSetter(enumMapping, setterName) {
  return function (node, target, property, value) {
    checkMappingValue(enumMapping, value);
    return setterBase(node, target, property, value, setterName, enumMapping[value]);
  };
}

function YGRemoveAllChildren(node) {
  var childCount = node.getChildCount();
  for (var i = childCount - 1; i >= 0; i--) {
    node.removeChild(node.getChild(i));
  }
}

var styleSetterMap = _extends({}, edgeSetters(positionEdgeMapping, "setPosition"), {

  alignContent: enumSetter(alignEnumMapping, "setAlignContent"),
  alignItems: enumSetter(alignEnumMapping, "setAlignItems"),
  alignSelf: enumSetter(alignEnumMapping, "setAlignSelf"),
  flexDirection: enumSetter(flexDirectionEnumMapping, "setFlexDirection"),
  flexWrap: enumSetter(flexWrapEnumMapping, "setFlexWrap"),
  justifyContent: enumSetter(justifyContentEnumMapping, "setJustifyContent")

}, edgeSetters(marginEdgeMapping, "setMargin"), {
  margin: function margin(node) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return shorthandSetter.apply(undefined, [node].concat(args, [node.setMargin.bind(node)]));
  },

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
  maxHeight: valueSetter("setMaxHeight")

}, edgeSetters(borderEdgeMapping, "setBorder"), {
  borderWidth: function borderWidth(node) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    return shorthandSetter.apply(undefined, [node].concat(args, [node.setBorder.bind(node)]));
  }

}, edgeSetters(paddingEdgeMapping, "setPadding"), {
  padding: function padding(node) {
    for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    return shorthandSetter.apply(undefined, [node].concat(args, [node.setPadding.bind(node)]));
  },

  position: enumSetter(positionTypeEnumMapping, "setPositionType")
});

var STYLE_PROPS = Object.keys(styleSetterMap);

function styleHandlerFactory(node) {
  return {
    get: function get(target, name) {
      if (STYLE_PROPS.includes(name)) {
        return Reflect.get(target, name);
      } else {
        return undefined;
      }
    },
    set: function set(target, property, value) {
      if (styleSetterMap.hasOwnProperty(property)) {
        return styleSetterMap[property](node, target, property, value);
      }
      return false;
    }
  };
}

var YogaNode = function () {
  function YogaNode() {
    _classCallCheck(this, YogaNode);

    this._node = Yoga.Node.create();

    // this.children = Object.freeze([]);
    this.children = [];
    this.style = new Proxy({}, styleHandlerFactory(this._node));

    // return proxied instance
    return new Proxy(this, {
      get: function get(target, name) {
        switch (name) {
          case "layout":
            {
              var _target$_node$getComp = target._node.getComputedLayout(),
                  _top = _target$_node$getComp.top,
                  _left = _target$_node$getComp.left,
                  _width = _target$_node$getComp.width,
                  _height = _target$_node$getComp.height;

              return { top: _top, left: _left, width: _width, height: _height };
            }
          default:
            {
              return Reflect.get(target, name);
            }
        }
      },
      set: function set(target, property, value) {
        if (property === "style") {
          if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
            target._node.copyStyle(BASE_NODE);

            var processedValue = new Proxy({}, styleHandlerFactory(target._node));

            Object.keys(value).forEach(function (propName) {
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

            value.forEach(function (child, index) {
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
      ownKeys: function ownKeys(target) {
        return ["style", "layout", "children"];
      },
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, property) {
        if (["style", "children"].includes(property)) {
          return Reflect.getOwnPropertyDescriptor(target, property);
        }

        if (property === "layout") {
          var _target$_node$getComp2 = target._node.getComputedLayout(),
              _top2 = _target$_node$getComp2.top,
              _left2 = _target$_node$getComp2.left,
              _width2 = _target$_node$getComp2.width,
              _height2 = _target$_node$getComp2.height;

          return {
            configurable: true,
            enumerable: true,
            writable: false,
            value: {
              top: _top2,
              left: _left2,
              width: _width2,
              height: _height2
            }
          };
        }
      }
    });
  }

  _createClass(YogaNode, [{
    key: "calculateLayout",
    value: function calculateLayout(width, height, direction) {
      return this._node.calculateLayout(width, height, direction);
    }
  }, {
    key: "insertChild",
    value: function insertChild(child, index) {
      this.children[index] = child;
      this._node.insertChild(child._node, index);
    }
  }, {
    key: "removeChild",
    value: function removeChild(child) {
      var childIndex = this.children.indexOf(child);
      this.children[childIndex] = undefined;
      this._node.removeChild(child._node);
    }
  }, {
    key: "getChildCount",
    value: function getChildCount() {
      return this._node.getChildCount();
    }
  }, {
    key: "getParent",
    value: function getParent() {
      return this._node.getParent();
    }
  }, {
    key: "getChild",
    value: function getChild(index) {
      return this._node.getChild(index);
    }
  }, {
    key: "free",
    value: function free() {
      this._node.free();
    }
  }, {
    key: "freeRecursive",
    value: function freeRecursive() {
      this._node.freeRecursive();
    }
  }, {
    key: "setMeasureFunc",
    value: function setMeasureFunc(func) {
      this._node.setMeasureFunc(func);
    }
  }, {
    key: "unsetMeasureFunc",
    value: function unsetMeasureFunc() {
      this._node.unsetMeasureFunc();
    }
  }, {
    key: "markDirty",
    value: function markDirty() {
      this._node.markDirty();
    }
  }, {
    key: "isDirty",
    value: function isDirty() {
      return this._node.isDirty();
    }
  }]);

  return YogaNode;
}();

exports.MEASURE_MODE_EXACTLY = MEASURE_MODE_EXACTLY;
exports.MEASURE_MODE_UNDEFINED = MEASURE_MODE_UNDEFINED;
exports.MEASURE_MODE_COUNT = MEASURE_MODE_COUNT;
exports.MEASURE_MODE_AT_MOST = MEASURE_MODE_AT_MOST;
exports['default'] = YogaNode;

}, 26, null, "yoga-js/dist/yogajs.cjs.js");
__d(/* yoga-layout/sources/entry-browser.js */function(global, require, module, exports) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var nbind = require(28                         ); // 28 = ../build/Release/nbind.js

var ran = false;
var ret = null;

nbind({}, function (err, result) {

    if (ran)
        return;

    ran = true;

    if (err)
        throw err;

    ret = result;

});

if (!ran)
    throw new Error('Failed to load the yoga module - it needed to be loaded synchronously, but didn\'t');

module.exports = require(29              )(ret.bind, ret.lib); // 29 = ./entry-common

}, 27, null, "yoga-layout/sources/entry-browser.js");
__d(/* yoga-layout/build/Release/nbind.js */function(global, require, module, exports) {(function (root, wrapper) {
  if (typeof define == "function" && define.amd) define([], function () {
    return wrapper;
  });else if (typeof module == "object" && module.exports) module.exports = wrapper;else (root.nbind = root.nbind || {}).init = wrapper;
})(this, function (Module, cb) {
  if (typeof Module == "function") {
    cb = Module;Module = {};
  }Module.onRuntimeInitialized = function (init, cb) {
    return function () {
      if (init) init.apply(this, arguments);try {
        Module.ccall("nbind_init");
      } catch (err) {
        cb(err);return;
      }cb(null, { bind: Module._nbind_value, reflect: Module.NBind.reflect, queryType: Module.NBind.queryType, toggleLightGC: Module.toggleLightGC, lib: Module });
    };
  }(Module.onRuntimeInitialized, cb);var Module;if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};var moduleOverrides = {};for (var key in Module) {
    if (Module.hasOwnProperty(key)) {
      moduleOverrides[key] = Module[key];
    }
  }var ENVIRONMENT_IS_WEB = typeof window === "object";var ENVIRONMENT_IS_WORKER = typeof importScripts === "function";var ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;if (ENVIRONMENT_IS_NODE) {
    if (!Module["print"]) Module["print"] = function print(x) {
      process["stdout"].write(x + "\n");
    };if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
      process["stderr"].write(x + "\n");
    };var nodeFS = {}("");var nodePath = {}("");Module["read"] = function read(filename, binary) {
      filename = nodePath["normalize"](filename);var ret = nodeFS["readFileSync"](filename);if (!ret && filename != nodePath["resolve"](filename)) {
        filename = path.join(__dirname, "..", "src", filename);ret = nodeFS["readFileSync"](filename);
      }if (ret && !binary) ret = ret.toString();return ret;
    };Module["readBinary"] = function readBinary(filename) {
      var ret = Module["read"](filename, true);if (!ret.buffer) {
        ret = new Uint8Array(ret);
      }assert(ret.buffer);return ret;
    };Module["load"] = function load(f) {
      globalEval(read(f));
    };if (!Module["thisProgram"]) {
      if (process["argv"].length > 1) {
        Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
      } else {
        Module["thisProgram"] = "unknown-program";
      }
    }Module["arguments"] = process["argv"].slice(2);if (typeof module !== "undefined") {
      module["exports"] = Module;
    }process["on"]("uncaughtException", function (ex) {
      if (!(ex instanceof ExitStatus)) {
        throw ex;
      }
    });Module["inspect"] = function () {
      return "[Emscripten Module object]";
    };
  } else if (ENVIRONMENT_IS_SHELL) {
    if (!Module["print"]) Module["print"] = print;if (typeof printErr != "undefined") Module["printErr"] = printErr;if (typeof read != "undefined") {
      Module["read"] = read;
    } else {
      Module["read"] = function read() {
        throw "no read() available (jsc?)";
      };
    }Module["readBinary"] = function readBinary(f) {
      if (typeof readbuffer === "function") {
        return new Uint8Array(readbuffer(f));
      }var data = read(f, "binary");assert(typeof data === "object");return data;
    };if (typeof scriptArgs != "undefined") {
      Module["arguments"] = scriptArgs;
    } else if (typeof arguments != "undefined") {
      Module["arguments"] = arguments;
    }
  } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module["read"] = function read(url) {
      var xhr = new XMLHttpRequest();xhr.open("GET", url, false);xhr.send(null);return xhr.responseText;
    };if (typeof arguments != "undefined") {
      Module["arguments"] = arguments;
    }if (typeof console !== "undefined") {
      if (!Module["print"]) Module["print"] = function print(x) {
        console.log(x);
      };if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
        console.log(x);
      };
    } else {
      var TRY_USE_DUMP = false;if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? function (x) {
        dump(x);
      } : function (x) {};
    }if (ENVIRONMENT_IS_WORKER) {
      Module["load"] = importScripts;
    }if (typeof Module["setWindowTitle"] === "undefined") {
      Module["setWindowTitle"] = function (title) {
        document.title = title;
      };
    }
  } else {
    throw "Unknown runtime environment. Where are we?";
  }function globalEval(x) {
    eval.call(null, x);
  }if (!Module["load"] && Module["read"]) {
    Module["load"] = function load(f) {
      globalEval(Module["read"](f));
    };
  }if (!Module["print"]) {
    Module["print"] = function () {};
  }if (!Module["printErr"]) {
    Module["printErr"] = Module["print"];
  }if (!Module["arguments"]) {
    Module["arguments"] = [];
  }if (!Module["thisProgram"]) {
    Module["thisProgram"] = "./this.program";
  }Module.print = Module["print"];Module.printErr = Module["printErr"];Module["preRun"] = [];Module["postRun"] = [];for (var key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
      Module[key] = moduleOverrides[key];
    }
  }var Runtime = { setTempRet0: function (value) {
      tempRet0 = value;
    }, getTempRet0: function () {
      return tempRet0;
    }, stackSave: function () {
      return STACKTOP;
    }, stackRestore: function (stackTop) {
      STACKTOP = stackTop;
    }, getNativeTypeSize: function (type) {
      switch (type) {case "i1":case "i8":
          return 1;case "i16":
          return 2;case "i32":
          return 4;case "i64":
          return 8;case "float":
          return 4;case "double":
          return 8;default:
          {
            if (type[type.length - 1] === "*") {
              return Runtime.QUANTUM_SIZE;
            } else if (type[0] === "i") {
              var bits = parseInt(type.substr(1));assert(bits % 8 === 0);return bits / 8;
            } else {
              return 0;
            }
          }}
    }, getNativeFieldSize: function (type) {
      return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
    }, STACK_ALIGN: 16, prepVararg: function (ptr, type) {
      if (type === "double" || type === "i64") {
        if (ptr & 7) {
          assert((ptr & 7) === 4);ptr += 4;
        }
      } else {
        assert((ptr & 3) === 0);
      }return ptr;
    }, getAlignSize: function (type, size, vararg) {
      if (!vararg && (type == "i64" || type == "double")) return 8;if (!type) return Math.min(size, 8);return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
    }, dynCall: function (sig, ptr, args) {
      if (args && args.length) {
        if (!args.splice) args = Array.prototype.slice.call(args);args.splice(0, 0, ptr);return Module["dynCall_" + sig].apply(null, args);
      } else {
        return Module["dynCall_" + sig].call(null, ptr);
      }
    }, functionPointers: [], addFunction: function (func) {
      for (var i = 0; i < Runtime.functionPointers.length; i++) {
        if (!Runtime.functionPointers[i]) {
          Runtime.functionPointers[i] = func;return 2 * (1 + i);
        }
      }throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
    }, removeFunction: function (index) {
      Runtime.functionPointers[(index - 2) / 2] = null;
    }, warnOnce: function (text) {
      if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};if (!Runtime.warnOnce.shown[text]) {
        Runtime.warnOnce.shown[text] = 1;Module.printErr(text);
      }
    }, funcWrappers: {}, getFuncWrapper: function (func, sig) {
      assert(sig);if (!Runtime.funcWrappers[sig]) {
        Runtime.funcWrappers[sig] = {};
      }var sigCache = Runtime.funcWrappers[sig];if (!sigCache[func]) {
        sigCache[func] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func, arguments);
        };
      }return sigCache[func];
    }, getCompilerSetting: function (name) {
      throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
    }, stackAlloc: function (size) {
      var ret = STACKTOP;STACKTOP = STACKTOP + size | 0;STACKTOP = STACKTOP + 15 & -16;return ret;
    }, staticAlloc: function (size) {
      var ret = STATICTOP;STATICTOP = STATICTOP + size | 0;STATICTOP = STATICTOP + 15 & -16;return ret;
    }, dynamicAlloc: function (size) {
      var ret = DYNAMICTOP;DYNAMICTOP = DYNAMICTOP + size | 0;DYNAMICTOP = DYNAMICTOP + 15 & -16;if (DYNAMICTOP >= TOTAL_MEMORY) {
        var success = enlargeMemory();if (!success) {
          DYNAMICTOP = ret;return 0;
        }
      }return ret;
    }, alignMemory: function (size, quantum) {
      var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);return ret;
    }, makeBigInt: function (low, high, unsigned) {
      var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;return ret;
    }, GLOBAL_BASE: 8, QUANTUM_SIZE: 4, __dummy__: 0 };Module["Runtime"] = Runtime;var __THREW__ = 0;var ABORT = false;var EXITSTATUS = 0;var undef = 0;var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;var tempI64, tempI64b;var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;function assert(condition, text) {
    if (!condition) {
      abort("Assertion failed: " + text);
    }
  }var globalScope = this;function getCFunc(ident) {
    var func = Module["_" + ident];if (!func) {
      try {
        func = eval("_" + ident);
      } catch (e) {}
    }assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");return func;
  }var cwrap, ccall;(function () {
    var JSfuncs = { "stackSave": function () {
        Runtime.stackSave();
      }, "stackRestore": function () {
        Runtime.stackRestore();
      }, "arrayToC": function (arr) {
        var ret = Runtime.stackAlloc(arr.length);writeArrayToMemory(arr, ret);return ret;
      }, "stringToC": function (str) {
        var ret = 0;if (str !== null && str !== undefined && str !== 0) {
          ret = Runtime.stackAlloc((str.length << 2) + 1);writeStringToMemory(str, ret);
        }return ret;
      } };var toC = { "string": JSfuncs["stringToC"], "array": JSfuncs["arrayToC"] };ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
      var func = getCFunc(ident);var cArgs = [];var stack = 0;if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];if (converter) {
            if (stack === 0) stack = Runtime.stackSave();cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }var ret = func.apply(null, cArgs);if (returnType === "string") ret = Pointer_stringify(ret);if (stack !== 0) {
        if (opts && opts.async) {
          EmterpreterAsync.asyncFinalizers.push(function () {
            Runtime.stackRestore(stack);
          });return;
        }Runtime.stackRestore(stack);
      }return ret;
    };var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc) {
      var parsed = jsfunc.toString().match(sourceRegex).slice(1);return { arguments: parsed[0], body: parsed[1], returnValue: parsed[2] };
    }var JSsource = {};for (var fun in JSfuncs) {
      if (JSfuncs.hasOwnProperty(fun)) {
        JSsource[fun] = parseJSFunc(JSfuncs[fun]);
      }
    }cwrap = function cwrap(ident, returnType, argTypes) {
      argTypes = argTypes || [];var cfunc = getCFunc(ident);var numericArgs = argTypes.every(function (type) {
        return type === "number";
      });var numericRet = returnType !== "string";if (numericRet && numericArgs) {
        return cfunc;
      }var argNames = argTypes.map(function (x, i) {
        return "$" + i;
      });var funcstr = "(function(" + argNames.join(",") + ") {";var nargs = argTypes.length;if (!numericArgs) {
        funcstr += "var stack = " + JSsource["stackSave"].body + ";";for (var i = 0; i < nargs; i++) {
          var arg = argNames[i],
              type = argTypes[i];if (type === "number") continue;var convertCode = JSsource[type + "ToC"];funcstr += "var " + convertCode.arguments + " = " + arg + ";";funcstr += convertCode.body + ";";funcstr += arg + "=" + convertCode.returnValue + ";";
        }
      }var cfuncname = parseJSFunc(function () {
        return cfunc;
      }).returnValue;funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";if (!numericRet) {
        var strgfy = parseJSFunc(function () {
          return Pointer_stringify;
        }).returnValue;funcstr += "ret = " + strgfy + "(ret);";
      }if (!numericArgs) {
        funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
      }funcstr += "return ret})";return eval(funcstr);
    };
  })();Module["ccall"] = ccall;Module["cwrap"] = cwrap;function setValue(ptr, value, type, noSafe) {
    type = type || "i8";if (type.charAt(type.length - 1) === "*") type = "i32";switch (type) {case "i1":
        HEAP8[ptr >> 0] = value;break;case "i8":
        HEAP8[ptr >> 0] = value;break;case "i16":
        HEAP16[ptr >> 1] = value;break;case "i32":
        HEAP32[ptr >> 2] = value;break;case "i64":
        tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];break;case "float":
        HEAPF32[ptr >> 2] = value;break;case "double":
        HEAPF64[ptr >> 3] = value;break;default:
        abort("invalid type for setValue: " + type);}
  }Module["setValue"] = setValue;function getValue(ptr, type, noSafe) {
    type = type || "i8";if (type.charAt(type.length - 1) === "*") type = "i32";switch (type) {case "i1":
        return HEAP8[ptr >> 0];case "i8":
        return HEAP8[ptr >> 0];case "i16":
        return HEAP16[ptr >> 1];case "i32":
        return HEAP32[ptr >> 2];case "i64":
        return HEAP32[ptr >> 2];case "float":
        return HEAPF32[ptr >> 2];case "double":
        return HEAPF64[ptr >> 3];default:
        abort("invalid type for setValue: " + type);}return null;
  }Module["getValue"] = getValue;var ALLOC_NORMAL = 0;var ALLOC_STACK = 1;var ALLOC_STATIC = 2;var ALLOC_DYNAMIC = 3;var ALLOC_NONE = 4;Module["ALLOC_NORMAL"] = ALLOC_NORMAL;Module["ALLOC_STACK"] = ALLOC_STACK;Module["ALLOC_STATIC"] = ALLOC_STATIC;Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;Module["ALLOC_NONE"] = ALLOC_NONE;function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;if (typeof slab === "number") {
      zeroinit = true;size = slab;
    } else {
      zeroinit = false;size = slab.length;
    }var singleType = typeof types === "string" ? types : null;var ret;if (allocator == ALLOC_NONE) {
      ret = ptr;
    } else {
      ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
    }if (zeroinit) {
      var ptr = ret,
          stop;assert((ret & 3) == 0);stop = ret + (size & ~3);for (; ptr < stop; ptr += 4) {
        HEAP32[ptr >> 2] = 0;
      }stop = ret + size;while (ptr < stop) {
        HEAP8[ptr++ >> 0] = 0;
      }return ret;
    }if (singleType === "i8") {
      if (slab.subarray || slab.slice) {
        HEAPU8.set(slab, ret);
      } else {
        HEAPU8.set(new Uint8Array(slab), ret);
      }return ret;
    }var i = 0,
        type,
        typeSize,
        previousType;while (i < size) {
      var curr = slab[i];if (typeof curr === "function") {
        curr = Runtime.getFunctionIndex(curr);
      }type = singleType || types[i];if (type === 0) {
        i++;continue;
      }if (type == "i64") type = "i32";setValue(ret + i, curr, type);if (previousType !== type) {
        typeSize = Runtime.getNativeTypeSize(type);previousType = type;
      }i += typeSize;
    }return ret;
  }Module["allocate"] = allocate;function getMemory(size) {
    if (!staticSealed) return Runtime.staticAlloc(size);if (typeof _sbrk !== "undefined" && !_sbrk.called || !runtimeInitialized) return Runtime.dynamicAlloc(size);return _malloc(size);
  }Module["getMemory"] = getMemory;function Pointer_stringify(ptr, length) {
    if (length === 0 || !ptr) return "";var hasUtf = 0;var t;var i = 0;while (1) {
      t = HEAPU8[ptr + i >> 0];hasUtf |= t;if (t == 0 && !length) break;i++;if (length && i == length) break;
    }if (!length) length = i;var ret = "";if (hasUtf < 128) {
      var MAX_CHUNK = 1024;var curr;while (length > 0) {
        curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));ret = ret ? ret + curr : curr;ptr += MAX_CHUNK;length -= MAX_CHUNK;
      }return ret;
    }return Module["UTF8ToString"](ptr);
  }Module["Pointer_stringify"] = Pointer_stringify;function AsciiToString(ptr) {
    var str = "";while (1) {
      var ch = HEAP8[ptr++ >> 0];if (!ch) return str;str += String.fromCharCode(ch);
    }
  }Module["AsciiToString"] = AsciiToString;function stringToAscii(str, outPtr) {
    return writeAsciiToMemory(str, outPtr, false);
  }Module["stringToAscii"] = stringToAscii;function UTF8ArrayToString(u8Array, idx) {
    var u0, u1, u2, u3, u4, u5;var str = "";while (1) {
      u0 = u8Array[idx++];if (!u0) return str;if (!(u0 & 128)) {
        str += String.fromCharCode(u0);continue;
      }u1 = u8Array[idx++] & 63;if ((u0 & 224) == 192) {
        str += String.fromCharCode((u0 & 31) << 6 | u1);continue;
      }u2 = u8Array[idx++] & 63;if ((u0 & 240) == 224) {
        u0 = (u0 & 15) << 12 | u1 << 6 | u2;
      } else {
        u3 = u8Array[idx++] & 63;if ((u0 & 248) == 240) {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
        } else {
          u4 = u8Array[idx++] & 63;if ((u0 & 252) == 248) {
            u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
          } else {
            u5 = u8Array[idx++] & 63;u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
          }
        }
      }if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
      }
    }
  }Module["UTF8ArrayToString"] = UTF8ArrayToString;function UTF8ToString(ptr) {
    return UTF8ArrayToString(HEAPU8, ptr);
  }Module["UTF8ToString"] = UTF8ToString;function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;var startIdx = outIdx;var endIdx = outIdx + maxBytesToWrite - 1;for (var i = 0; i < str.length; ++i) {
      var u = str.charCodeAt(i);if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;if (u <= 127) {
        if (outIdx >= endIdx) break;outU8Array[outIdx++] = u;
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) break;outU8Array[outIdx++] = 192 | u >> 6;outU8Array[outIdx++] = 128 | u & 63;
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) break;outU8Array[outIdx++] = 224 | u >> 12;outU8Array[outIdx++] = 128 | u >> 6 & 63;outU8Array[outIdx++] = 128 | u & 63;
      } else if (u <= 2097151) {
        if (outIdx + 3 >= endIdx) break;outU8Array[outIdx++] = 240 | u >> 18;outU8Array[outIdx++] = 128 | u >> 12 & 63;outU8Array[outIdx++] = 128 | u >> 6 & 63;outU8Array[outIdx++] = 128 | u & 63;
      } else if (u <= 67108863) {
        if (outIdx + 4 >= endIdx) break;outU8Array[outIdx++] = 248 | u >> 24;outU8Array[outIdx++] = 128 | u >> 18 & 63;outU8Array[outIdx++] = 128 | u >> 12 & 63;outU8Array[outIdx++] = 128 | u >> 6 & 63;outU8Array[outIdx++] = 128 | u & 63;
      } else {
        if (outIdx + 5 >= endIdx) break;outU8Array[outIdx++] = 252 | u >> 30;outU8Array[outIdx++] = 128 | u >> 24 & 63;outU8Array[outIdx++] = 128 | u >> 18 & 63;outU8Array[outIdx++] = 128 | u >> 12 & 63;outU8Array[outIdx++] = 128 | u >> 6 & 63;outU8Array[outIdx++] = 128 | u & 63;
      }
    }outU8Array[outIdx] = 0;return outIdx - startIdx;
  }Module["stringToUTF8Array"] = stringToUTF8Array;function stringToUTF8(str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
  }Module["stringToUTF8"] = stringToUTF8;function lengthBytesUTF8(str) {
    var len = 0;for (var i = 0; i < str.length; ++i) {
      var u = str.charCodeAt(i);if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;if (u <= 127) {
        ++len;
      } else if (u <= 2047) {
        len += 2;
      } else if (u <= 65535) {
        len += 3;
      } else if (u <= 2097151) {
        len += 4;
      } else if (u <= 67108863) {
        len += 5;
      } else {
        len += 6;
      }
    }return len;
  }Module["lengthBytesUTF8"] = lengthBytesUTF8;function UTF16ToString(ptr) {
    var i = 0;var str = "";while (1) {
      var codeUnit = HEAP16[ptr + i * 2 >> 1];if (codeUnit == 0) return str;++i;str += String.fromCharCode(codeUnit);
    }
  }Module["UTF16ToString"] = UTF16ToString;function stringToUTF16(str, outPtr, maxBytesToWrite) {
    if (maxBytesToWrite === undefined) {
      maxBytesToWrite = 2147483647;
    }if (maxBytesToWrite < 2) return 0;maxBytesToWrite -= 2;var startPtr = outPtr;var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;for (var i = 0; i < numCharsToWrite; ++i) {
      var codeUnit = str.charCodeAt(i);HEAP16[outPtr >> 1] = codeUnit;outPtr += 2;
    }HEAP16[outPtr >> 1] = 0;return outPtr - startPtr;
  }Module["stringToUTF16"] = stringToUTF16;function lengthBytesUTF16(str) {
    return str.length * 2;
  }Module["lengthBytesUTF16"] = lengthBytesUTF16;function UTF32ToString(ptr) {
    var i = 0;var str = "";while (1) {
      var utf32 = HEAP32[ptr + i * 4 >> 2];if (utf32 == 0) return str;++i;if (utf32 >= 65536) {
        var ch = utf32 - 65536;str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
      } else {
        str += String.fromCharCode(utf32);
      }
    }
  }Module["UTF32ToString"] = UTF32ToString;function stringToUTF32(str, outPtr, maxBytesToWrite) {
    if (maxBytesToWrite === undefined) {
      maxBytesToWrite = 2147483647;
    }if (maxBytesToWrite < 4) return 0;var startPtr = outPtr;var endPtr = startPtr + maxBytesToWrite - 4;for (var i = 0; i < str.length; ++i) {
      var codeUnit = str.charCodeAt(i);if (codeUnit >= 55296 && codeUnit <= 57343) {
        var trailSurrogate = str.charCodeAt(++i);codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
      }HEAP32[outPtr >> 2] = codeUnit;outPtr += 4;if (outPtr + 4 > endPtr) break;
    }HEAP32[outPtr >> 2] = 0;return outPtr - startPtr;
  }Module["stringToUTF32"] = stringToUTF32;function lengthBytesUTF32(str) {
    var len = 0;for (var i = 0; i < str.length; ++i) {
      var codeUnit = str.charCodeAt(i);if (codeUnit >= 55296 && codeUnit <= 57343) ++i;len += 4;
    }return len;
  }Module["lengthBytesUTF32"] = lengthBytesUTF32;function demangle(func) {
    var hasLibcxxabi = !!Module["___cxa_demangle"];if (hasLibcxxabi) {
      try {
        var buf = _malloc(func.length);writeStringToMemory(func.substr(1), buf);var status = _malloc(4);var ret = Module["___cxa_demangle"](buf, 0, 0, status);if (getValue(status, "i32") === 0 && ret) {
          return Pointer_stringify(ret);
        }
      } catch (e) {} finally {
        if (buf) _free(buf);if (status) _free(status);if (ret) _free(ret);
      }
    }var i = 3;var basicTypes = { "v": "void", "b": "bool", "c": "char", "s": "short", "i": "int", "l": "long", "f": "float", "d": "double", "w": "wchar_t", "a": "signed char", "h": "unsigned char", "t": "unsigned short", "j": "unsigned int", "m": "unsigned long", "x": "long long", "y": "unsigned long long", "z": "..." };var subs = [];var first = true;function dump(x) {
      if (x) Module.print(x);Module.print(func);var pre = "";for (var a = 0; a < i; a++) pre += " ";Module.print(pre + "^");
    }function parseNested() {
      i++;if (func[i] === "K") i++;var parts = [];while (func[i] !== "E") {
        if (func[i] === "S") {
          i++;var next = func.indexOf("_", i);var num = func.substring(i, next) || 0;parts.push(subs[num] || "?");i = next + 1;continue;
        }if (func[i] === "C") {
          parts.push(parts[parts.length - 1]);i += 2;continue;
        }var size = parseInt(func.substr(i));var pre = size.toString().length;if (!size || !pre) {
          i--;break;
        }var curr = func.substr(i + pre, size);parts.push(curr);subs.push(curr);i += pre + size;
      }i++;return parts;
    }function parse(rawList, limit, allowVoid) {
      limit = limit || Infinity;var ret = "",
          list = [];function flushList() {
        return "(" + list.join(", ") + ")";
      }var name;if (func[i] === "N") {
        name = parseNested().join("::");limit--;if (limit === 0) return rawList ? [name] : name;
      } else {
        if (func[i] === "K" || first && func[i] === "L") i++;var size = parseInt(func.substr(i));if (size) {
          var pre = size.toString().length;name = func.substr(i + pre, size);i += pre + size;
        }
      }first = false;if (func[i] === "I") {
        i++;var iList = parse(true);var iRet = parse(true, 1, true);ret += iRet[0] + " " + name + "<" + iList.join(", ") + ">";
      } else {
        ret = name;
      }paramLoop: while (i < func.length && limit-- > 0) {
        var c = func[i++];if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {case "P":
              list.push(parse(true, 1, true)[0] + "*");break;case "R":
              list.push(parse(true, 1, true)[0] + "&");break;case "L":
              {
                i++;var end = func.indexOf("E", i);var size = end - i;list.push(func.substr(i, size));i += size + 2;break;
              };case "A":
              {
                var size = parseInt(func.substr(i));i += size.toString().length;if (func[i] !== "_") throw "?";i++;list.push(parse(true, 1, true)[0] + " [" + size + "]");break;
              };case "E":
              break paramLoop;default:
              ret += "?" + c;break paramLoop;}
        }
      }if (!allowVoid && list.length === 1 && list[0] === "void") list = [];if (rawList) {
        if (ret) {
          list.push(ret + "?");
        }return list;
      } else {
        return ret + flushList();
      }
    }var parsed = func;try {
      if (func == "Object._main" || func == "_main") {
        return "main()";
      }if (typeof func === "number") func = Pointer_stringify(func);if (func[0] !== "_") return func;if (func[1] !== "_") return func;if (func[2] !== "Z") return func;switch (func[3]) {case "n":
          return "operator new()";case "d":
          return "operator delete()";}parsed = parse();
    } catch (e) {
      parsed += "?";
    }if (parsed.indexOf("?") >= 0 && !hasLibcxxabi) {
      Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
    }return parsed;
  }function demangleAll(text) {
    return text.replace(/__Z[\w\d_]+/g, function (x) {
      var y = demangle(x);return x === y ? x : x + " [" + y + "]";
    });
  }function jsStackTrace() {
    var err = new Error();if (!err.stack) {
      try {
        throw new Error(0);
      } catch (e) {
        err = e;
      }if (!err.stack) {
        return "(no stack trace available)";
      }
    }return err.stack.toString();
  }function stackTrace() {
    return demangleAll(jsStackTrace());
  }Module["stackTrace"] = stackTrace;var PAGE_SIZE = 4096;function alignMemoryPage(x) {
    if (x % 4096 > 0) {
      x += 4096 - x % 4096;
    }return x;
  }var HEAP;var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;var STATIC_BASE = 0,
      STATICTOP = 0,
      staticSealed = false;var STACK_BASE = 0,
      STACKTOP = 0,
      STACK_MAX = 0;var DYNAMIC_BASE = 0,
      DYNAMICTOP = 0;function abortOnCannotGrowMemory() {
    abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
  }function enlargeMemory() {
    abortOnCannotGrowMemory();
  }var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 134217728;var totalMemory = 64 * 1024;while (totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK) {
    if (totalMemory < 16 * 1024 * 1024) {
      totalMemory *= 2;
    } else {
      totalMemory += 16 * 1024 * 1024;
    }
  }if (totalMemory !== TOTAL_MEMORY) {
    TOTAL_MEMORY = totalMemory;
  }assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && !!new Int32Array(1)["subarray"] && !!new Int32Array(1)["set"], "JS engine does not provide full typed array support");var buffer;buffer = new ArrayBuffer(TOTAL_MEMORY);HEAP8 = new Int8Array(buffer);HEAP16 = new Int16Array(buffer);HEAP32 = new Int32Array(buffer);HEAPU8 = new Uint8Array(buffer);HEAPU16 = new Uint16Array(buffer);HEAPU32 = new Uint32Array(buffer);HEAPF32 = new Float32Array(buffer);HEAPF64 = new Float64Array(buffer);HEAP32[0] = 255;assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, "Typed arrays 2 must be run on a little-endian system");Module["HEAP"] = HEAP;Module["buffer"] = buffer;Module["HEAP8"] = HEAP8;Module["HEAP16"] = HEAP16;Module["HEAP32"] = HEAP32;Module["HEAPU8"] = HEAPU8;Module["HEAPU16"] = HEAPU16;Module["HEAPU32"] = HEAPU32;Module["HEAPF32"] = HEAPF32;Module["HEAPF64"] = HEAPF64;function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
      var callback = callbacks.shift();if (typeof callback == "function") {
        callback();continue;
      }var func = callback.func;if (typeof func === "number") {
        if (callback.arg === undefined) {
          Runtime.dynCall("v", func);
        } else {
          Runtime.dynCall("vi", func, [callback.arg]);
        }
      } else {
        func(callback.arg === undefined ? null : callback.arg);
      }
    }
  }var __ATPRERUN__ = [];var __ATINIT__ = [];var __ATMAIN__ = [];var __ATEXIT__ = [];var __ATPOSTRUN__ = [];var runtimeInitialized = false;var runtimeExited = false;function preRun() {
    if (Module["preRun"]) {
      if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];while (Module["preRun"].length) {
        addOnPreRun(Module["preRun"].shift());
      }
    }callRuntimeCallbacks(__ATPRERUN__);
  }function ensureInitRuntime() {
    if (runtimeInitialized) return;runtimeInitialized = true;callRuntimeCallbacks(__ATINIT__);
  }function preMain() {
    callRuntimeCallbacks(__ATMAIN__);
  }function exitRuntime() {
    callRuntimeCallbacks(__ATEXIT__);runtimeExited = true;
  }function postRun() {
    if (Module["postRun"]) {
      if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];while (Module["postRun"].length) {
        addOnPostRun(Module["postRun"].shift());
      }
    }callRuntimeCallbacks(__ATPOSTRUN__);
  }function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
  }Module["addOnPreRun"] = addOnPreRun;function addOnInit(cb) {
    __ATINIT__.unshift(cb);
  }Module["addOnInit"] = addOnInit;function addOnPreMain(cb) {
    __ATMAIN__.unshift(cb);
  }Module["addOnPreMain"] = addOnPreMain;function addOnExit(cb) {
    __ATEXIT__.unshift(cb);
  }Module["addOnExit"] = addOnExit;function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
  }Module["addOnPostRun"] = addOnPostRun;function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;var u8array = new Array(len);var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);if (dontAddNull) u8array.length = numBytesWritten;return u8array;
  }Module["intArrayFromString"] = intArrayFromString;function intArrayToString(array) {
    var ret = [];for (var i = 0; i < array.length; i++) {
      var chr = array[i];if (chr > 255) {
        chr &= 255;
      }ret.push(String.fromCharCode(chr));
    }return ret.join("");
  }Module["intArrayToString"] = intArrayToString;function writeStringToMemory(string, buffer, dontAddNull) {
    var array = intArrayFromString(string, dontAddNull);var i = 0;while (i < array.length) {
      var chr = array[i];HEAP8[buffer + i >> 0] = chr;i = i + 1;
    }
  }Module["writeStringToMemory"] = writeStringToMemory;function writeArrayToMemory(array, buffer) {
    for (var i = 0; i < array.length; i++) {
      HEAP8[buffer++ >> 0] = array[i];
    }
  }Module["writeArrayToMemory"] = writeArrayToMemory;function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
      HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    }if (!dontAddNull) HEAP8[buffer >> 0] = 0;
  }Module["writeAsciiToMemory"] = writeAsciiToMemory;function unSign(value, bits, ignore) {
    if (value >= 0) {
      return value;
    }return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
  }function reSign(value, bits, ignore) {
    if (value <= 0) {
      return value;
    }var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);if (value >= half && (bits <= 32 || value > half)) {
      value = -2 * half + value;
    }return value;
  }if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
    var ah = a >>> 16;var al = a & 65535;var bh = b >>> 16;var bl = b & 65535;return al * bl + (ah * bl + al * bh << 16) | 0;
  };Math.imul = Math["imul"];if (!Math["fround"]) {
    var froundBuffer = new Float32Array(1);Math["fround"] = function (x) {
      froundBuffer[0] = x;return froundBuffer[0];
    };
  }Math.fround = Math["fround"];if (!Math["clz32"]) Math["clz32"] = function (x) {
    x = x >>> 0;for (var i = 0; i < 32; i++) {
      if (x & 1 << 31 - i) return i;
    }return 32;
  };Math.clz32 = Math["clz32"];var Math_abs = Math.abs;var Math_cos = Math.cos;var Math_sin = Math.sin;var Math_tan = Math.tan;var Math_acos = Math.acos;var Math_asin = Math.asin;var Math_atan = Math.atan;var Math_atan2 = Math.atan2;var Math_exp = Math.exp;var Math_log = Math.log;var Math_sqrt = Math.sqrt;var Math_ceil = Math.ceil;var Math_floor = Math.floor;var Math_pow = Math.pow;var Math_imul = Math.imul;var Math_fround = Math.fround;var Math_min = Math.min;var Math_clz32 = Math.clz32;var runDependencies = 0;var runDependencyWatcher = null;var dependenciesFulfilled = null;function getUniqueRunDependency(id) {
    return id;
  }function addRunDependency(id) {
    runDependencies++;if (Module["monitorRunDependencies"]) {
      Module["monitorRunDependencies"](runDependencies);
    }
  }Module["addRunDependency"] = addRunDependency;function removeRunDependency(id) {
    runDependencies--;if (Module["monitorRunDependencies"]) {
      Module["monitorRunDependencies"](runDependencies);
    }if (runDependencies == 0) {
      if (runDependencyWatcher !== null) {
        clearInterval(runDependencyWatcher);runDependencyWatcher = null;
      }if (dependenciesFulfilled) {
        var callback = dependenciesFulfilled;dependenciesFulfilled = null;callback();
      }
    }
  }Module["removeRunDependency"] = removeRunDependency;Module["preloadedImages"] = {};Module["preloadedAudios"] = {};var memoryInitializer = null;var ASM_CONSTS = [function ($0, $1, $2, $3, $4, $5, $6, $7) {
    {
      return _nbind.callbackSignatureList[$0].apply(this, arguments);
    }
  }];function _emscripten_asm_const_3(code, a0, a1, a2) {
    return ASM_CONSTS[code](a0, a1, a2);
  }function _emscripten_asm_const_4(code, a0, a1, a2, a3) {
    return ASM_CONSTS[code](a0, a1, a2, a3);
  }function _emscripten_asm_const_5(code, a0, a1, a2, a3, a4) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4);
  }function _emscripten_asm_const_6(code, a0, a1, a2, a3, a4, a5) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4, a5);
  }function _emscripten_asm_const_7(code, a0, a1, a2, a3, a4, a5, a6) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4, a5, a6);
  }function _emscripten_asm_const_8(code, a0, a1, a2, a3, a4, a5, a6, a7) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4, a5, a6, a7);
  }STATIC_BASE = 8;STATICTOP = STATIC_BASE + 12528;__ATINIT__.push({ func: function () {
      __GLOBAL__sub_I_nbind_cc();
    } }, { func: function () {
      __GLOBAL__sub_I_common_cc();
    } }, { func: function () {
      __GLOBAL__sub_I_Binding_cc();
    } });allocate([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 18, 0, 0, 69, 34, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 248, 17, 0, 0, 82, 34, 0, 0, 248, 17, 0, 0, 95, 34, 0, 0, 32, 18, 0, 0, 108, 34, 0, 0, 8, 2, 0, 0, 0, 0, 0, 0, 32, 18, 0, 0, 141, 34, 0, 0, 16, 2, 0, 0, 0, 0, 0, 0, 32, 18, 0, 0, 175, 34, 0, 0, 32, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 192, 127, 0, 0, 192, 127, 0, 0, 192, 127, 3, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 3, 0, 0, 0, 0, 0, 192, 127, 3, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 128, 191, 0, 0, 128, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 140, 6, 0, 0, 140, 6, 0, 0, 0, 0, 0, 0, 0, 0, 128, 63, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 80, 26, 0, 0, 94, 26, 0, 0, 106, 26, 0, 0, 54, 26, 0, 0, 64, 26, 0, 0, 72, 26, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 127, 0, 0, 0, 0, 0, 0, 192, 127, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 28, 0, 0, 49, 28, 0, 0, 50, 28, 0, 0, 49, 28, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 225, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 226, 32, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 228, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 40, 8, 0, 0, 3, 0, 0, 0, 229, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 92, 8, 0, 0, 230, 32, 0, 0, 2, 0, 0, 0, 231, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 92, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 230, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 92, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 92, 8, 0, 0, 230, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 28, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 232, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 226, 32, 0, 0, 50, 28, 0, 0, 49, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 232, 32, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 49, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 50, 28, 0, 0, 49, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 244, 10, 0, 0, 3, 0, 0, 0, 252, 10, 0, 0, 1, 0, 0, 0, 231, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 92, 8, 0, 0, 124, 11, 0, 0, 2, 0, 0, 0, 233, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 228, 32, 0, 0, 50, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 50, 28, 0, 0, 228, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 124, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 124, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 13, 0, 0, 50, 28, 0, 0, 49, 28, 0, 0, 2, 0, 0, 0, 232, 32, 0, 0, 12, 13, 0, 0, 51, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 13, 0, 0, 2, 0, 0, 0, 225, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 168, 13, 0, 0, 49, 28, 0, 0, 49, 28, 0, 0, 2, 0, 0, 0, 48, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 2, 0, 0, 0, 11, 0, 0, 0, 168, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 14, 0, 0, 159, 33, 0, 0, 73, 33, 0, 0, 227, 32, 0, 0, 86, 33, 0, 0, 228, 32, 0, 0, 91, 33, 0, 0, 96, 33, 0, 0, 97, 33, 0, 0, 40, 8, 0, 0, 109, 33, 0, 0, 80, 14, 0, 0, 122, 33, 0, 0, 141, 33, 0, 0, 142, 33, 0, 0, 151, 33, 0, 0, 152, 33, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 88, 14, 0, 0, 1, 0, 0, 0, 229, 32, 0, 0, 172, 33, 0, 0, 173, 33, 0, 0, 174, 33, 0, 0, 175, 33, 0, 0, 176, 33, 0, 0, 230, 32, 0, 0, 50, 28, 0, 0, 177, 33, 0, 0, 178, 33, 0, 0, 179, 33, 0, 0, 180, 33, 0, 0, 181, 33, 0, 0, 49, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 188, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 2, 0, 0, 0, 14, 0, 0, 0, 141, 33, 0, 0, 172, 33, 0, 0, 189, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 141, 33, 0, 0, 172, 33, 0, 0, 189, 33, 0, 0, 76, 15, 0, 0, 7, 0, 0, 0, 189, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 141, 33, 0, 0, 172, 33, 0, 0, 189, 33, 0, 0, 230, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 141, 33, 0, 0, 172, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 189, 33, 0, 0, 76, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 189, 33, 0, 0, 180, 15, 0, 0, 2, 0, 0, 0, 188, 15, 0, 0, 1, 0, 0, 0, 174, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 189, 33, 0, 0, 172, 33, 0, 0, 172, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 189, 33, 0, 0, 180, 15, 0, 0, 230, 32, 0, 0, 76, 15, 0, 0, 4, 16, 0, 0, 7, 0, 0, 0, 180, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 226, 32, 0, 0, 230, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 16, 0, 0, 230, 32, 0, 0, 2, 0, 0, 0, 189, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 230, 32, 0, 0, 230, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 230, 32, 0, 0, 230, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 141, 33, 0, 0, 189, 33, 0, 0, 40, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 40, 8, 0, 0, 40, 8, 0, 0, 40, 8, 0, 0, 40, 8, 0, 0, 40, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 227, 32, 0, 0, 180, 15, 0, 0, 40, 8, 0, 0, 136, 17, 0, 0, 2, 0, 0, 0, 68, 34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 2, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 1, 0, 0, 18, 0, 0, 0, 19, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 2, 0, 0, 20, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 23, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 48, 2, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 22, 0, 0, 0, 23, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 232, 18, 0, 0, 88, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 217, 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0, 209, 42, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 67, 111, 117, 108, 100, 32, 110, 111, 116, 32, 97, 108, 108, 111, 99, 97, 116, 101, 32, 109, 101, 109, 111, 114, 121, 32, 102, 111, 114, 32, 108, 105, 115, 116, 0, 67, 111, 117, 108, 100, 32, 110, 111, 116, 32, 97, 108, 108, 111, 99, 97, 116, 101, 32, 109, 101, 109, 111, 114, 121, 32, 102, 111, 114, 32, 105, 116, 101, 109, 115, 0, 67, 111, 117, 108, 100, 32, 110, 111, 116, 32, 101, 120, 116, 101, 110, 100, 32, 97, 108, 108, 111, 99, 97, 116, 105, 111, 110, 32, 102, 111, 114, 32, 105, 116, 101, 109, 115, 0, 0, 0, 0, 37, 115, 10, 0, 67, 111, 117, 108, 100, 32, 110, 111, 116, 32, 97, 108, 108, 111, 99, 97, 116, 101, 32, 109, 101, 109, 111, 114, 121, 32, 102, 111, 114, 32, 110, 111, 100, 101, 0, 67, 97, 110, 110, 111, 116, 32, 114, 101, 115, 101, 116, 32, 97, 32, 110, 111, 100, 101, 32, 119, 104, 105, 99, 104, 32, 115, 116, 105, 108, 108, 32, 104, 97, 115, 32, 99, 104, 105, 108, 100, 114, 101, 110, 32, 97, 116, 116, 97, 99, 104, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 114, 101, 115, 101, 116, 32, 97, 32, 110, 111, 100, 101, 32, 115, 116, 105, 108, 108, 32, 97, 116, 116, 97, 99, 104, 101, 100, 32, 116, 111, 32, 97, 32, 112, 97, 114, 101, 110, 116, 0, 67, 111, 117, 108, 100, 32, 110, 111, 116, 32, 97, 108, 108, 111, 99, 97, 116, 101, 32, 109, 101, 109, 111, 114, 121, 32, 102, 111, 114, 32, 99, 111, 110, 102, 105, 103, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 116, 32, 109, 101, 97, 115, 117, 114, 101, 32, 102, 117, 110, 99, 116, 105, 111, 110, 58, 32, 78, 111, 100, 101, 115, 32, 119, 105, 116, 104, 32, 109, 101, 97, 115, 117, 114, 101, 32, 102, 117, 110, 99, 116, 105, 111, 110, 115, 32, 99, 97, 110, 110, 111, 116, 32, 104, 97, 118, 101, 32, 99, 104, 105, 108, 100, 114, 101, 110, 46, 0, 67, 104, 105, 108, 100, 32, 97, 108, 114, 101, 97, 100, 121, 32, 104, 97, 115, 32, 97, 32, 112, 97, 114, 101, 110, 116, 44, 32, 105, 116, 32, 109, 117, 115, 116, 32, 98, 101, 32, 114, 101, 109, 111, 118, 101, 100, 32, 102, 105, 114, 115, 116, 46, 0, 67, 97, 110, 110, 111, 116, 32, 97, 100, 100, 32, 99, 104, 105, 108, 100, 58, 32, 78, 111, 100, 101, 115, 32, 119, 105, 116, 104, 32, 109, 101, 97, 115, 117, 114, 101, 32, 102, 117, 110, 99, 116, 105, 111, 110, 115, 32, 99, 97, 110, 110, 111, 116, 32, 104, 97, 118, 101, 32, 99, 104, 105, 108, 100, 114, 101, 110, 46, 0, 79, 110, 108, 121, 32, 108, 101, 97, 102, 32, 110, 111, 100, 101, 115, 32, 119, 105, 116, 104, 32, 99, 117, 115, 116, 111, 109, 32, 109, 101, 97, 115, 117, 114, 101, 32, 102, 117, 110, 99, 116, 105, 111, 110, 115, 115, 104, 111, 117, 108, 100, 32, 109, 97, 110, 117, 97, 108, 108, 121, 32, 109, 97, 114, 107, 32, 116, 104, 101, 109, 115, 101, 108, 118, 101, 115, 32, 97, 115, 32, 100, 105, 114, 116, 121, 0, 67, 97, 110, 110, 111, 116, 32, 103, 101, 116, 32, 108, 97, 121, 111, 117, 116, 32, 112, 114, 111, 112, 101, 114, 116, 105, 101, 115, 32, 111, 102, 32, 109, 117, 108, 116, 105, 45, 101, 100, 103, 101, 32, 115, 104, 111, 114, 116, 104, 97, 110, 100, 115, 0, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 0, 37, 115, 37, 100, 46, 123, 91, 115, 107, 105, 112, 112, 101, 100, 93, 32, 0, 0, 119, 109, 58, 32, 37, 115, 44, 32, 104, 109, 58, 32, 37, 115, 44, 32, 97, 119, 58, 32, 37, 102, 32, 97, 104, 58, 32, 37, 102, 32, 61, 62, 32, 100, 58, 32, 40, 37, 102, 44, 32, 37, 102, 41, 32, 37, 115, 10, 0, 42, 0, 37, 115, 37, 100, 46, 123, 37, 115, 0, 119, 109, 58, 32, 37, 115, 44, 32, 104, 109, 58, 32, 37, 115, 44, 32, 97, 119, 58, 32, 37, 102, 32, 97, 104, 58, 32, 37, 102, 32, 37, 115, 10, 0, 37, 115, 37, 100, 46, 125, 37, 115, 0, 119, 109, 58, 32, 37, 115, 44, 32, 104, 109, 58, 32, 37, 115, 44, 32, 100, 58, 32, 40, 37, 102, 44, 32, 37, 102, 41, 32, 37, 115, 10, 0, 79, 117, 116, 32, 111, 102, 32, 99, 97, 99, 104, 101, 32, 101, 110, 116, 114, 105, 101, 115, 33, 0, 105, 110, 105, 116, 105, 97, 108, 0, 97, 118, 97, 105, 108, 97, 98, 108, 101, 87, 105, 100, 116, 104, 32, 105, 115, 32, 105, 110, 100, 101, 102, 105, 110, 105, 116, 101, 32, 115, 111, 32, 119, 105, 100, 116, 104, 77, 101, 97, 115, 117, 114, 101, 77, 111, 100, 101, 32, 109, 117, 115, 116, 32, 98, 101, 32, 89, 71, 77, 101, 97, 115, 117, 114, 101, 77, 111, 100, 101, 85, 110, 100, 101, 102, 105, 110, 101, 100, 0, 97, 118, 97, 105, 108, 97, 98, 108, 101, 72, 101, 105, 103, 104, 116, 32, 105, 115, 32, 105, 110, 100, 101, 102, 105, 110, 105, 116, 101, 32, 115, 111, 32, 104, 101, 105, 103, 104, 116, 77, 101, 97, 115, 117, 114, 101, 77, 111, 100, 101, 32, 109, 117, 115, 116, 32, 98, 101, 32, 89, 71, 77, 101, 97, 115, 117, 114, 101, 77, 111, 100, 101, 85, 110, 100, 101, 102, 105, 110, 101, 100, 0, 109, 101, 97, 115, 117, 114, 101, 0, 102, 108, 101, 120, 0, 115, 116, 114, 101, 116, 99, 104, 0, 109, 117, 108, 116, 105, 108, 105, 110, 101, 45, 115, 116, 114, 101, 116, 99, 104, 0, 97, 98, 115, 45, 109, 101, 97, 115, 117, 114, 101, 0, 97, 98, 115, 45, 108, 97, 121, 111, 117, 116, 0, 69, 120, 112, 101, 99, 116, 32, 99, 117, 115, 116, 111, 109, 32, 98, 97, 115, 101, 108, 105, 110, 101, 32, 102, 117, 110, 99, 116, 105, 111, 110, 32, 116, 111, 32, 110, 111, 116, 32, 114, 101, 116, 117, 114, 110, 32, 78, 97, 78, 0, 85, 78, 68, 69, 70, 73, 78, 69, 68, 0, 69, 88, 65, 67, 84, 76, 89, 0, 65, 84, 95, 77, 79, 83, 84, 0, 76, 65, 89, 95, 85, 78, 68, 69, 70, 73, 78, 69, 68, 0, 76, 65, 89, 95, 69, 88, 65, 67, 84, 76, 89, 0, 76, 65, 89, 95, 65, 84, 95, 77, 79, 83, 84, 0, 32, 32, 0, 60, 100, 105, 118, 32, 0, 108, 97, 121, 111, 117, 116, 61, 34, 0, 119, 105, 100, 116, 104, 58, 32, 37, 103, 59, 32, 0, 104, 101, 105, 103, 104, 116, 58, 32, 37, 103, 59, 32, 0, 116, 111, 112, 58, 32, 37, 103, 59, 32, 0, 108, 101, 102, 116, 58, 32, 37, 103, 59, 0, 34, 32, 0, 115, 116, 121, 108, 101, 61, 34, 0, 102, 108, 101, 120, 45, 100, 105, 114, 101, 99, 116, 105, 111, 110, 58, 32, 37, 115, 59, 32, 0, 106, 117, 115, 116, 105, 102, 121, 45, 99, 111, 110, 116, 101, 110, 116, 58, 32, 37, 115, 59, 32, 0, 97, 108, 105, 103, 110, 45, 105, 116, 101, 109, 115, 58, 32, 37, 115, 59, 32, 0, 97, 108, 105, 103, 110, 45, 99, 111, 110, 116, 101, 110, 116, 58, 32, 37, 115, 59, 32, 0, 97, 108, 105, 103, 110, 45, 115, 101, 108, 102, 58, 32, 37, 115, 59, 32, 0, 37, 115, 58, 32, 37, 103, 59, 32, 0, 102, 108, 101, 120, 45, 103, 114, 111, 119, 0, 102, 108, 101, 120, 45, 115, 104, 114, 105, 110, 107, 0, 102, 108, 101, 120, 45, 98, 97, 115, 105, 115, 0, 102, 108, 101, 120, 87, 114, 97, 112, 58, 32, 37, 115, 59, 32, 0, 111, 118, 101, 114, 102, 108, 111, 119, 58, 32, 37, 115, 59, 32, 0, 100, 105, 115, 112, 108, 97, 121, 58, 32, 37, 115, 59, 32, 0, 109, 97, 114, 103, 105, 110, 0, 112, 97, 100, 100, 105, 110, 103, 0, 98, 111, 114, 100, 101, 114, 0, 119, 105, 100, 116, 104, 0, 104, 101, 105, 103, 104, 116, 0, 109, 97, 120, 45, 119, 105, 100, 116, 104, 0, 109, 97, 120, 45, 104, 101, 105, 103, 104, 116, 0, 109, 105, 110, 45, 119, 105, 100, 116, 104, 0, 109, 105, 110, 45, 104, 101, 105, 103, 104, 116, 0, 112, 111, 115, 105, 116, 105, 111, 110, 58, 32, 37, 115, 59, 32, 0, 108, 101, 102, 116, 0, 114, 105, 103, 104, 116, 0, 116, 111, 112, 0, 98, 111, 116, 116, 111, 109, 0, 104, 97, 115, 45, 99, 117, 115, 116, 111, 109, 45, 109, 101, 97, 115, 117, 114, 101, 61, 34, 116, 114, 117, 101, 34, 0, 62, 0, 10, 0, 60, 47, 100, 105, 118, 62, 0, 37, 115, 45, 37, 115, 0, 37, 115, 58, 32, 97, 117, 116, 111, 59, 32, 0, 112, 120, 0, 37, 0, 37, 115, 58, 32, 37, 103, 37, 115, 59, 32, 0, 0, 0, 0, 103, 101, 116, 73, 110, 115, 116, 97, 110, 99, 101, 67, 111, 117, 110, 116, 0, 78, 111, 100, 101, 0, 99, 114, 101, 97, 116, 101, 68, 101, 102, 97, 117, 108, 116, 0, 99, 114, 101, 97, 116, 101, 87, 105, 116, 104, 67, 111, 110, 102, 105, 103, 0, 100, 101, 115, 116, 114, 111, 121, 0, 114, 101, 115, 101, 116, 0, 99, 111, 112, 121, 83, 116, 121, 108, 101, 0, 115, 101, 116, 80, 111, 115, 105, 116, 105, 111, 110, 84, 121, 112, 101, 0, 115, 101, 116, 80, 111, 115, 105, 116, 105, 111, 110, 0, 115, 101, 116, 80, 111, 115, 105, 116, 105, 111, 110, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 65, 108, 105, 103, 110, 67, 111, 110, 116, 101, 110, 116, 0, 115, 101, 116, 65, 108, 105, 103, 110, 73, 116, 101, 109, 115, 0, 115, 101, 116, 65, 108, 105, 103, 110, 83, 101, 108, 102, 0, 115, 101, 116, 70, 108, 101, 120, 68, 105, 114, 101, 99, 116, 105, 111, 110, 0, 115, 101, 116, 70, 108, 101, 120, 87, 114, 97, 112, 0, 115, 101, 116, 74, 117, 115, 116, 105, 102, 121, 67, 111, 110, 116, 101, 110, 116, 0, 115, 101, 116, 77, 97, 114, 103, 105, 110, 0, 115, 101, 116, 77, 97, 114, 103, 105, 110, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 77, 97, 114, 103, 105, 110, 65, 117, 116, 111, 0, 115, 101, 116, 79, 118, 101, 114, 102, 108, 111, 119, 0, 115, 101, 116, 68, 105, 115, 112, 108, 97, 121, 0, 115, 101, 116, 70, 108, 101, 120, 0, 115, 101, 116, 70, 108, 101, 120, 66, 97, 115, 105, 115, 0, 115, 101, 116, 70, 108, 101, 120, 66, 97, 115, 105, 115, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 70, 108, 101, 120, 71, 114, 111, 119, 0, 115, 101, 116, 70, 108, 101, 120, 83, 104, 114, 105, 110, 107, 0, 115, 101, 116, 87, 105, 100, 116, 104, 0, 115, 101, 116, 87, 105, 100, 116, 104, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 87, 105, 100, 116, 104, 65, 117, 116, 111, 0, 115, 101, 116, 72, 101, 105, 103, 104, 116, 0, 115, 101, 116, 72, 101, 105, 103, 104, 116, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 72, 101, 105, 103, 104, 116, 65, 117, 116, 111, 0, 115, 101, 116, 77, 105, 110, 87, 105, 100, 116, 104, 0, 115, 101, 116, 77, 105, 110, 87, 105, 100, 116, 104, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 77, 105, 110, 72, 101, 105, 103, 104, 116, 0, 115, 101, 116, 77, 105, 110, 72, 101, 105, 103, 104, 116, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 77, 97, 120, 87, 105, 100, 116, 104, 0, 115, 101, 116, 77, 97, 120, 87, 105, 100, 116, 104, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 77, 97, 120, 72, 101, 105, 103, 104, 116, 0, 115, 101, 116, 77, 97, 120, 72, 101, 105, 103, 104, 116, 80, 101, 114, 99, 101, 110, 116, 0, 115, 101, 116, 65, 115, 112, 101, 99, 116, 82, 97, 116, 105, 111, 0, 115, 101, 116, 66, 111, 114, 100, 101, 114, 0, 115, 101, 116, 80, 97, 100, 100, 105, 110, 103, 0, 115, 101, 116, 80, 97, 100, 100, 105, 110, 103, 80, 101, 114, 99, 101, 110, 116, 0, 103, 101, 116, 80, 111, 115, 105, 116, 105, 111, 110, 84, 121, 112, 101, 0, 103, 101, 116, 80, 111, 115, 105, 116, 105, 111, 110, 0, 103, 101, 116, 65, 108, 105, 103, 110, 67, 111, 110, 116, 101, 110, 116, 0, 103, 101, 116, 65, 108, 105, 103, 110, 73, 116, 101, 109, 115, 0, 103, 101, 116, 65, 108, 105, 103, 110, 83, 101, 108, 102, 0, 103, 101, 116, 70, 108, 101, 120, 68, 105, 114, 101, 99, 116, 105, 111, 110, 0, 103, 101, 116, 70, 108, 101, 120, 87, 114, 97, 112, 0, 103, 101, 116, 74, 117, 115, 116, 105, 102, 121, 67, 111, 110, 116, 101, 110, 116, 0, 103, 101, 116, 77, 97, 114, 103, 105, 110, 0, 103, 101, 116, 70, 108, 101, 120, 66, 97, 115, 105, 115, 0, 103, 101, 116, 70, 108, 101, 120, 71, 114, 111, 119, 0, 103, 101, 116, 70, 108, 101, 120, 83, 104, 114, 105, 110, 107, 0, 103, 101, 116, 87, 105, 100, 116, 104, 0, 103, 101, 116, 72, 101, 105, 103, 104, 116, 0, 103, 101, 116, 77, 105, 110, 87, 105, 100, 116, 104, 0, 103, 101, 116, 77, 105, 110, 72, 101, 105, 103, 104, 116, 0, 103, 101, 116, 77, 97, 120, 87, 105, 100, 116, 104, 0, 103, 101, 116, 77, 97, 120, 72, 101, 105, 103, 104, 116, 0, 103, 101, 116, 65, 115, 112, 101, 99, 116, 82, 97, 116, 105, 111, 0, 103, 101, 116, 66, 111, 114, 100, 101, 114, 0, 103, 101, 116, 79, 118, 101, 114, 102, 108, 111, 119, 0, 103, 101, 116, 68, 105, 115, 112, 108, 97, 121, 0, 103, 101, 116, 80, 97, 100, 100, 105, 110, 103, 0, 105, 110, 115, 101, 114, 116, 67, 104, 105, 108, 100, 0, 114, 101, 109, 111, 118, 101, 67, 104, 105, 108, 100, 0, 103, 101, 116, 67, 104, 105, 108, 100, 67, 111, 117, 110, 116, 0, 103, 101, 116, 80, 97, 114, 101, 110, 116, 0, 103, 101, 116, 67, 104, 105, 108, 100, 0, 115, 101, 116, 77, 101, 97, 115, 117, 114, 101, 70, 117, 110, 99, 0, 117, 110, 115, 101, 116, 77, 101, 97, 115, 117, 114, 101, 70, 117, 110, 99, 0, 109, 97, 114, 107, 68, 105, 114, 116, 121, 0, 105, 115, 68, 105, 114, 116, 121, 0, 99, 97, 108, 99, 117, 108, 97, 116, 101, 76, 97, 121, 111, 117, 116, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 76, 101, 102, 116, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 82, 105, 103, 104, 116, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 84, 111, 112, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 66, 111, 116, 116, 111, 109, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 87, 105, 100, 116, 104, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 72, 101, 105, 103, 104, 116, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 76, 97, 121, 111, 117, 116, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 77, 97, 114, 103, 105, 110, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 66, 111, 114, 100, 101, 114, 0, 103, 101, 116, 67, 111, 109, 112, 117, 116, 101, 100, 80, 97, 100, 100, 105, 110, 103, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 67, 111, 110, 102, 105, 103, 0, 99, 114, 101, 97, 116, 101, 0, 115, 101, 116, 69, 120, 112, 101, 114, 105, 109, 101, 110, 116, 97, 108, 70, 101, 97, 116, 117, 114, 101, 69, 110, 97, 98, 108, 101, 100, 0, 105, 115, 69, 120, 112, 101, 114, 105, 109, 101, 110, 116, 97, 108, 70, 101, 97, 116, 117, 114, 101, 69, 110, 97, 98, 108, 101, 100, 0, 86, 97, 108, 117, 101, 0, 76, 97, 121, 111, 117, 116, 0, 83, 105, 122, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 118, 111, 105, 100, 0, 98, 111, 111, 108, 0, 0, 115, 116, 100, 58, 58, 115, 116, 114, 105, 110, 103, 0, 99, 98, 70, 117, 110, 99, 116, 105, 111, 110, 32, 38, 0, 99, 111, 110, 115, 116, 32, 99, 98, 70, 117, 110, 99, 116, 105, 111, 110, 32, 38, 0, 0, 69, 120, 116, 101, 114, 110, 97, 108, 0, 0, 66, 117, 102, 102, 101, 114, 0, 1, 1, 1, 2, 2, 4, 4, 4, 4, 8, 8, 4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 73, 110, 116, 54, 52, 0, 0, 0, 95, 110, 98, 105, 110, 100, 95, 110, 101, 119, 0, 123, 114, 101, 116, 117, 114, 110, 40, 95, 110, 98, 105, 110, 100, 46, 99, 97, 108, 108, 98, 97, 99, 107, 83, 105, 103, 110, 97, 116, 117, 114, 101, 76, 105, 115, 116, 91, 36, 48, 93, 46, 97, 112, 112, 108, 121, 40, 116, 104, 105, 115, 44, 97, 114, 103, 117, 109, 101, 110, 116, 115, 41, 41, 59, 125, 0, 78, 66, 105, 110, 100, 73, 68, 0, 78, 66, 105, 110, 100, 0, 98, 105, 110, 100, 95, 118, 97, 108, 117, 101, 0, 114, 101, 102, 108, 101, 99, 116, 0, 113, 117, 101, 114, 121, 84, 121, 112, 101, 0, 108, 97, 108, 108, 111, 99, 0, 108, 114, 101, 115, 101, 116, 0, 0, 83, 116, 57, 98, 97, 100, 95, 97, 108, 108, 111, 99, 0, 83, 116, 57, 101, 120, 99, 101, 112, 116, 105, 111, 110, 0, 83, 116, 57, 116, 121, 112, 101, 95, 105, 110, 102, 111, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 54, 95, 95, 115, 104, 105, 109, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 55, 95, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 48, 95, 95, 115, 105, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 33, 34, 118, 101, 99, 116, 111, 114, 32, 108, 101, 110, 103, 116, 104, 95, 101, 114, 114, 111, 114, 34, 0, 47, 85, 115, 101, 114, 115, 47, 101, 109, 105, 108, 115, 106, 47, 68, 111, 99, 117, 109, 101, 110, 116, 115, 47, 101, 109, 115, 100, 107, 95, 112, 111, 114, 116, 97, 98, 108, 101, 47, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 47, 49, 46, 51, 53, 46, 48, 47, 115, 121, 115, 116, 101, 109, 47, 105, 110, 99, 108, 117, 100, 101, 47, 108, 105, 98, 99, 120, 120, 47, 118, 101, 99, 116, 111, 114, 0, 95, 95, 116, 104, 114, 111, 119, 95, 108, 101, 110, 103, 116, 104, 95, 101, 114, 114, 111, 114, 0, 115, 116, 100, 58, 58, 98, 97, 100, 95, 97, 108, 108, 111, 99, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);allocate([101, 97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116, 119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116, 32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101, 97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101, 32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109, 32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101, 0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE + 10240);allocate([17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 45, 43, 32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 46, 0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE + 11985);var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);assert(tempDoublePtr % 8 == 0);function copyTempFloat(ptr) {
    HEAP8[tempDoublePtr] = HEAP8[ptr];HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
  }function copyTempDouble(ptr) {
    HEAP8[tempDoublePtr] = HEAP8[ptr];HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];HEAP8[tempDoublePtr + 4] = HEAP8[ptr + 4];HEAP8[tempDoublePtr + 5] = HEAP8[ptr + 5];HEAP8[tempDoublePtr + 6] = HEAP8[ptr + 6];HEAP8[tempDoublePtr + 7] = HEAP8[ptr + 7];
  }function _atexit(func, arg) {
    __ATEXIT__.unshift({ func: func, arg: arg });
  }function ___cxa_atexit() {
    return _atexit.apply(null, arguments);
  }Module["_i64Subtract"] = _i64Subtract;var _fabsf = Math_abs;Module["_i64Add"] = _i64Add;function _pthread_cleanup_pop() {
    assert(_pthread_cleanup_push.level == __ATEXIT__.length, "cannot pop if something else added meanwhile!");__ATEXIT__.pop();_pthread_cleanup_push.level = __ATEXIT__.length;
  }function __ZSt18uncaught_exceptionv() {
    return !!__ZSt18uncaught_exceptionv.uncaught_exception;
  }var EXCEPTIONS = { last: 0, caught: [], infos: {}, deAdjust: function (adjusted) {
      if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;for (var ptr in EXCEPTIONS.infos) {
        var info = EXCEPTIONS.infos[ptr];if (info.adjusted === adjusted) {
          return ptr;
        }
      }return adjusted;
    }, addRef: function (ptr) {
      if (!ptr) return;var info = EXCEPTIONS.infos[ptr];info.refcount++;
    }, decRef: function (ptr) {
      if (!ptr) return;var info = EXCEPTIONS.infos[ptr];assert(info.refcount > 0);info.refcount--;if (info.refcount === 0) {
        if (info.destructor) {
          Runtime.dynCall("vi", info.destructor, [ptr]);
        }delete EXCEPTIONS.infos[ptr];___cxa_free_exception(ptr);
      }
    }, clearRef: function (ptr) {
      if (!ptr) return;var info = EXCEPTIONS.infos[ptr];info.refcount = 0;
    } };function ___resumeException(ptr) {
    if (!EXCEPTIONS.last) {
      EXCEPTIONS.last = ptr;
    }EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr));throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
  }function ___cxa_find_matching_catch() {
    var thrown = EXCEPTIONS.last;if (!thrown) {
      return (asm["setTempRet0"](0), 0) | 0;
    }var info = EXCEPTIONS.infos[thrown];var throwntype = info.type;if (!throwntype) {
      return (asm["setTempRet0"](0), thrown) | 0;
    }var typeArray = Array.prototype.slice.call(arguments);var pointer = Module["___cxa_is_pointer_type"](throwntype);if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;thrown = ___cxa_find_matching_catch.buffer;for (var i = 0; i < typeArray.length; i++) {
      if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
        thrown = HEAP32[thrown >> 2];info.adjusted = thrown;return (asm["setTempRet0"](typeArray[i]), thrown) | 0;
      }
    }thrown = HEAP32[thrown >> 2];return (asm["setTempRet0"](throwntype), thrown) | 0;
  }function ___cxa_throw(ptr, type, destructor) {
    EXCEPTIONS.infos[ptr] = { ptr: ptr, adjusted: ptr, type: type, destructor: destructor, refcount: 0 };EXCEPTIONS.last = ptr;if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
      __ZSt18uncaught_exceptionv.uncaught_exception = 1;
    } else {
      __ZSt18uncaught_exceptionv.uncaught_exception++;
    }throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
  }Module["_memset"] = _memset;var _BDtoILow = true;function __decorate(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;return c > 3 && r && Object.defineProperty(target, key, r), r;
  }function _defineHidden(value) {
    return function (target, key) {
      Object.defineProperty(target, key, { configurable: false, enumerable: false, value: value, writable: true });
    };
  }var _nbind = {};function __nbind_register_primitive(id, size, flags) {
    var spec = { flags: 1024 | flags, id: id, ptrSize: size };_nbind.makeType(_nbind.constructType, spec);
  }Module["_bitshift64Shl"] = _bitshift64Shl;function _abort() {
    Module["abort"]();
  }function _YGPositionTypeToString() {
    Module["printErr"]("missing function: YGPositionTypeToString");abort(-1);
  }function __nbind_free_external(num) {
    _nbind.externalList[num].dereference(num);
  }function _YGWrapToString() {
    Module["printErr"]("missing function: YGWrapToString");abort(-1);
  }function __nbind_reference_external(num) {
    _nbind.externalList[num].reference();
  }function ___assert_fail(condition, filename, line, func) {
    ABORT = true;throw "Assertion failed: " + Pointer_stringify(condition) + ", at: " + [filename ? Pointer_stringify(filename) : "unknown filename", line, func ? Pointer_stringify(func) : "unknown function"] + " at " + stackTrace();
  }function _YGFlexDirectionToString() {
    Module["printErr"]("missing function: YGFlexDirectionToString");abort(-1);
  }function _YGJustifyToString() {
    Module["printErr"]("missing function: YGJustifyToString");abort(-1);
  }var _emscripten_asm_const_int = true;function __nbind_register_pool(pageSize, usedPtr, rootPtr, pagePtr) {
    _nbind.Pool.pageSize = pageSize;_nbind.Pool.usedPtr = usedPtr / 4;_nbind.Pool.rootPtr = rootPtr;_nbind.Pool.pagePtr = pagePtr / 4;HEAP32[usedPtr / 4] = 16909060;if (HEAP8[usedPtr] == 1) _nbind.bigEndian = true;HEAP32[usedPtr / 4] = 0;_nbind.makeTypeKindTbl = (_a = {}, _a[1024] = _nbind.PrimitiveType, _a[64] = _nbind.Int64Type, _a[2048] = _nbind.BindClass, _a[3072] = _nbind.BindClassPtr, _a[4096] = _nbind.SharedClassPtr, _a[5120] = _nbind.ArrayType, _a[6144] = _nbind.ArrayType, _a[7168] = _nbind.CStringType, _a[9216] = _nbind.CallbackType, _a[10240] = _nbind.BindType, _a);_nbind.makeTypeNameTbl = { "Buffer": _nbind.BufferType, "External": _nbind.ExternalType, "Int64": _nbind.Int64Type, "_nbind_new": _nbind.CreateValueType, "bool": _nbind.BooleanType, "cbFunction &": _nbind.CallbackType, "const cbFunction &": _nbind.CallbackType, "const std::string &": _nbind.StringType, "std::string": _nbind.StringType };Module["toggleLightGC"] = _nbind.toggleLightGC;_nbind.callUpcast = Module["dynCall_ii"];var globalScope = _nbind.makeType(_nbind.constructType, { flags: 2048, id: 0, name: "" });globalScope.proto = Module;_nbind.BindClass.list.push(globalScope);var _a;
  }var PATH = undefined;function _emscripten_set_main_loop_timing(mode, value) {
    Browser.mainLoop.timingMode = mode;Browser.mainLoop.timingValue = value;if (!Browser.mainLoop.func) {
      return 1;
    }if (mode == 0) {
      Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
        setTimeout(Browser.mainLoop.runner, value);
      };Browser.mainLoop.method = "timeout";
    } else if (mode == 1) {
      Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
        Browser.requestAnimationFrame(Browser.mainLoop.runner);
      };Browser.mainLoop.method = "rAF";
    } else if (mode == 2) {
      if (!window["setImmediate"]) {
        var setImmediates = [];var emscriptenMainLoopMessageId = "__emcc";function Browser_setImmediate_messageHandler(event) {
          if (event.source === window && event.data === emscriptenMainLoopMessageId) {
            event.stopPropagation();setImmediates.shift()();
          }
        }window.addEventListener("message", Browser_setImmediate_messageHandler, true);window["setImmediate"] = function Browser_emulated_setImmediate(func) {
          setImmediates.push(func);window.postMessage(emscriptenMainLoopMessageId, "*");
        };
      }Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
        window["setImmediate"](Browser.mainLoop.runner);
      };Browser.mainLoop.method = "immediate";
    }return 0;
  }function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
    Module["noExitRuntime"] = true;assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");Browser.mainLoop.func = func;Browser.mainLoop.arg = arg;var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;Browser.mainLoop.runner = function Browser_mainLoop_runner() {
      if (ABORT) return;if (Browser.mainLoop.queue.length > 0) {
        var start = Date.now();var blocker = Browser.mainLoop.queue.shift();blocker.func(blocker.arg);if (Browser.mainLoop.remainingBlockers) {
          var remaining = Browser.mainLoop.remainingBlockers;var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);if (blocker.counted) {
            Browser.mainLoop.remainingBlockers = next;
          } else {
            next = next + .5;Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
          }
        }console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");Browser.mainLoop.updateStatus();setTimeout(Browser.mainLoop.runner, 0);return;
      }if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
        Browser.mainLoop.scheduler();return;
      }if (Browser.mainLoop.method === "timeout" && Module.ctx) {
        Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");Browser.mainLoop.method = "";
      }Browser.mainLoop.runIter(function () {
        if (typeof arg !== "undefined") {
          Runtime.dynCall("vi", func, [arg]);
        } else {
          Runtime.dynCall("v", func);
        }
      });if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();Browser.mainLoop.scheduler();
    };if (!noSetTiming) {
      if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps);else _emscripten_set_main_loop_timing(1, 1);Browser.mainLoop.scheduler();
    }if (simulateInfiniteLoop) {
      throw "SimulateInfiniteLoop";
    }
  }var Browser = { mainLoop: { scheduler: null, method: "", currentlyRunningMainloop: 0, func: null, arg: 0, timingMode: 0, timingValue: 0, currentFrameNumber: 0, queue: [], pause: function () {
        Browser.mainLoop.scheduler = null;Browser.mainLoop.currentlyRunningMainloop++;
      }, resume: function () {
        Browser.mainLoop.currentlyRunningMainloop++;var timingMode = Browser.mainLoop.timingMode;var timingValue = Browser.mainLoop.timingValue;var func = Browser.mainLoop.func;Browser.mainLoop.func = null;_emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);_emscripten_set_main_loop_timing(timingMode, timingValue);Browser.mainLoop.scheduler();
      }, updateStatus: function () {
        if (Module["setStatus"]) {
          var message = Module["statusMessage"] || "Please wait...";var remaining = Browser.mainLoop.remainingBlockers;var expected = Browser.mainLoop.expectedBlockers;if (remaining) {
            if (remaining < expected) {
              Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
            } else {
              Module["setStatus"](message);
            }
          } else {
            Module["setStatus"]("");
          }
        }
      }, runIter: function (func) {
        if (ABORT) return;if (Module["preMainLoop"]) {
          var preRet = Module["preMainLoop"]();if (preRet === false) {
            return;
          }
        }try {
          func();
        } catch (e) {
          if (e instanceof ExitStatus) {
            return;
          } else {
            if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [e, e.stack]);throw e;
          }
        }if (Module["postMainLoop"]) Module["postMainLoop"]();
      } }, isFullScreen: false, pointerLock: false, moduleContextCreatedCallbacks: [], workers: [], init: function () {
      if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];if (Browser.initted) return;Browser.initted = true;try {
        new Blob();Browser.hasBlobConstructor = true;
      } catch (e) {
        Browser.hasBlobConstructor = false;console.log("warning: no blob constructor, cannot create blobs with mimetypes");
      }Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
        console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding = true;
      }var imagePlugin = {};imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
        return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
      };imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
        var b = null;if (Browser.hasBlobConstructor) {
          try {
            b = new Blob([byteArray], { type: Browser.getMimetype(name) });if (b.size !== byteArray.length) {
              b = new Blob([new Uint8Array(byteArray).buffer], { type: Browser.getMimetype(name) });
            }
          } catch (e) {
            Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
          }
        }if (!b) {
          var bb = new Browser.BlobBuilder();bb.append(new Uint8Array(byteArray).buffer);b = bb.getBlob();
        }var url = Browser.URLObject.createObjectURL(b);var img = new Image();img.onload = function img_onload() {
          assert(img.complete, "Image " + name + " could not be decoded");var canvas = document.createElement("canvas");canvas.width = img.width;canvas.height = img.height;var ctx = canvas.getContext("2d");ctx.drawImage(img, 0, 0);Module["preloadedImages"][name] = canvas;Browser.URLObject.revokeObjectURL(url);if (onload) onload(byteArray);
        };img.onerror = function img_onerror(event) {
          console.log("Image " + url + " could not be decoded");if (onerror) onerror();
        };img.src = url;
      };Module["preloadPlugins"].push(imagePlugin);var audioPlugin = {};audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
        return !Module.noAudioDecoding && name.substr(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 };
      };audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
        var done = false;function finish(audio) {
          if (done) return;done = true;Module["preloadedAudios"][name] = audio;if (onload) onload(byteArray);
        }function fail() {
          if (done) return;done = true;Module["preloadedAudios"][name] = new Audio();if (onerror) onerror();
        }if (Browser.hasBlobConstructor) {
          try {
            var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          } catch (e) {
            return fail();
          }var url = Browser.URLObject.createObjectURL(b);var audio = new Audio();audio.addEventListener("canplaythrough", function () {
            finish(audio);
          }, false);audio.onerror = function audio_onerror(event) {
            if (done) return;console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");function encode64(data) {
              var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD = "=";var ret = "";var leftchar = 0;var leftbits = 0;for (var i = 0; i < data.length; i++) {
                leftchar = leftchar << 8 | data[i];leftbits += 8;while (leftbits >= 6) {
                  var curr = leftchar >> leftbits - 6 & 63;leftbits -= 6;ret += BASE[curr];
                }
              }if (leftbits == 2) {
                ret += BASE[(leftchar & 3) << 4];ret += PAD + PAD;
              } else if (leftbits == 4) {
                ret += BASE[(leftchar & 15) << 2];ret += PAD;
              }return ret;
            }audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);finish(audio);
          };audio.src = url;Browser.safeSetTimeout(function () {
            finish(audio);
          }, 1e4);
        } else {
          return fail();
        }
      };Module["preloadPlugins"].push(audioPlugin);var canvas = Module["canvas"];function pointerLockChange() {
        Browser.pointerLock = document["pointerLockElement"] === canvas || document["mozPointerLockElement"] === canvas || document["webkitPointerLockElement"] === canvas || document["msPointerLockElement"] === canvas;
      }if (canvas) {
        canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function () {};canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function () {};canvas.exitPointerLock = canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange", pointerLockChange, false);document.addEventListener("mozpointerlockchange", pointerLockChange, false);document.addEventListener("webkitpointerlockchange", pointerLockChange, false);document.addEventListener("mspointerlockchange", pointerLockChange, false);if (Module["elementPointerLock"]) {
          canvas.addEventListener("click", function (ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();ev.preventDefault();
            }
          }, false);
        }
      }
    }, createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
      if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;var ctx;var contextHandle;if (useWebGL) {
        var contextAttributes = { antialias: false, alpha: false };if (webGLContextAttributes) {
          for (var attribute in webGLContextAttributes) {
            contextAttributes[attribute] = webGLContextAttributes[attribute];
          }
        }contextHandle = GL.createContext(canvas, contextAttributes);if (contextHandle) {
          ctx = GL.getContext(contextHandle).GLctx;
        }canvas.style.backgroundColor = "black";
      } else {
        ctx = canvas.getContext("2d");
      }if (!ctx) return null;if (setInModule) {
        if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx = ctx;if (useWebGL) GL.makeContextCurrent(contextHandle);Module.useWebGL = useWebGL;Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
          callback();
        });Browser.init();
      }return ctx;
    }, destroyContext: function (canvas, useWebGL, setInModule) {}, fullScreenHandlersInstalled: false, lockPointer: undefined, resizeCanvas: undefined, requestFullScreen: function (lockPointer, resizeCanvas, vrDevice) {
      Browser.lockPointer = lockPointer;Browser.resizeCanvas = resizeCanvas;Browser.vrDevice = vrDevice;if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;var canvas = Module["canvas"];function fullScreenChange() {
        Browser.isFullScreen = false;var canvasContainer = canvas.parentNode;if ((document["webkitFullScreenElement"] || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["mozFullscreenElement"] || document["fullScreenElement"] || document["fullscreenElement"] || document["msFullScreenElement"] || document["msFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
          canvas.cancelFullScreen = document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["webkitCancelFullScreen"] || document["msExitFullscreen"] || document["exitFullscreen"] || function () {};canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);if (Browser.lockPointer) canvas.requestPointerLock();Browser.isFullScreen = true;if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
        } else {
          canvasContainer.parentNode.insertBefore(canvas, canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
        }if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullScreen);Browser.updateCanvasDimensions(canvas);
      }if (!Browser.fullScreenHandlersInstalled) {
        Browser.fullScreenHandlersInstalled = true;document.addEventListener("fullscreenchange", fullScreenChange, false);document.addEventListener("mozfullscreenchange", fullScreenChange, false);document.addEventListener("webkitfullscreenchange", fullScreenChange, false);document.addEventListener("MSFullscreenChange", fullScreenChange, false);
      }var canvasContainer = document.createElement("div");canvas.parentNode.insertBefore(canvasContainer, canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullScreen = canvasContainer["requestFullScreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullScreen"] ? function () {
        canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
      } : null);if (vrDevice) {
        canvasContainer.requestFullScreen({ vrDisplay: vrDevice });
      } else {
        canvasContainer.requestFullScreen();
      }
    }, nextRAF: 0, fakeRequestAnimationFrame: function (func) {
      var now = Date.now();if (Browser.nextRAF === 0) {
        Browser.nextRAF = now + 1e3 / 60;
      } else {
        while (now + 2 >= Browser.nextRAF) {
          Browser.nextRAF += 1e3 / 60;
        }
      }var delay = Math.max(Browser.nextRAF - now, 0);setTimeout(func, delay);
    }, requestAnimationFrame: function requestAnimationFrame(func) {
      if (typeof window === "undefined") {
        Browser.fakeRequestAnimationFrame(func);
      } else {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
        }window.requestAnimationFrame(func);
      }
    }, safeCallback: function (func) {
      return function () {
        if (!ABORT) return func.apply(null, arguments);
      };
    }, allowAsyncCallbacks: true, queuedAsyncCallbacks: [], pauseAsyncCallbacks: function () {
      Browser.allowAsyncCallbacks = false;
    }, resumeAsyncCallbacks: function () {
      Browser.allowAsyncCallbacks = true;if (Browser.queuedAsyncCallbacks.length > 0) {
        var callbacks = Browser.queuedAsyncCallbacks;Browser.queuedAsyncCallbacks = [];callbacks.forEach(function (func) {
          func();
        });
      }
    }, safeRequestAnimationFrame: function (func) {
      return Browser.requestAnimationFrame(function () {
        if (ABORT) return;if (Browser.allowAsyncCallbacks) {
          func();
        } else {
          Browser.queuedAsyncCallbacks.push(func);
        }
      });
    }, safeSetTimeout: function (func, timeout) {
      Module["noExitRuntime"] = true;return setTimeout(function () {
        if (ABORT) return;if (Browser.allowAsyncCallbacks) {
          func();
        } else {
          Browser.queuedAsyncCallbacks.push(func);
        }
      }, timeout);
    }, safeSetInterval: function (func, timeout) {
      Module["noExitRuntime"] = true;return setInterval(function () {
        if (ABORT) return;if (Browser.allowAsyncCallbacks) {
          func();
        }
      }, timeout);
    }, getMimetype: function (name) {
      return { "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "bmp": "image/bmp", "ogg": "audio/ogg", "wav": "audio/wav", "mp3": "audio/mpeg" }[name.substr(name.lastIndexOf(".") + 1)];
    }, getUserMedia: function (func) {
      if (!window.getUserMedia) {
        window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
      }window.getUserMedia(func);
    }, getMovementX: function (event) {
      return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
    }, getMovementY: function (event) {
      return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
    }, getMouseWheelDelta: function (event) {
      var delta = 0;switch (event.type) {case "DOMMouseScroll":
          delta = event.detail;break;case "mousewheel":
          delta = event.wheelDelta;break;case "wheel":
          delta = event["deltaY"];break;default:
          throw "unrecognized mouse wheel event: " + event.type;}return delta;
    }, mouseX: 0, mouseY: 0, mouseMovementX: 0, mouseMovementY: 0, touches: {}, lastTouches: {}, calculateMouseEvent: function (event) {
      if (Browser.pointerLock) {
        if (event.type != "mousemove" && "mozMovementX" in event) {
          Browser.mouseMovementX = Browser.mouseMovementY = 0;
        } else {
          Browser.mouseMovementX = Browser.getMovementX(event);Browser.mouseMovementY = Browser.getMovementY(event);
        }if (typeof SDL != "undefined") {
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
        } else {
          Browser.mouseX += Browser.mouseMovementX;Browser.mouseY += Browser.mouseMovementY;
        }
      } else {
        var rect = Module["canvas"].getBoundingClientRect();var cw = Module["canvas"].width;var ch = Module["canvas"].height;var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
          var touch = event.touch;if (touch === undefined) {
            return;
          }var adjustedX = touch.pageX - (scrollX + rect.left);var adjustedY = touch.pageY - (scrollY + rect.top);adjustedX = adjustedX * (cw / rect.width);adjustedY = adjustedY * (ch / rect.height);var coords = { x: adjustedX, y: adjustedY };if (event.type === "touchstart") {
            Browser.lastTouches[touch.identifier] = coords;Browser.touches[touch.identifier] = coords;
          } else if (event.type === "touchend" || event.type === "touchmove") {
            var last = Browser.touches[touch.identifier];if (!last) last = coords;Browser.lastTouches[touch.identifier] = last;Browser.touches[touch.identifier] = coords;
          }return;
        }var x = event.pageX - (scrollX + rect.left);var y = event.pageY - (scrollY + rect.top);x = x * (cw / rect.width);y = y * (ch / rect.height);Browser.mouseMovementX = x - Browser.mouseX;Browser.mouseMovementY = y - Browser.mouseY;Browser.mouseX = x;Browser.mouseY = y;
      }
    }, xhrLoad: function (url, onload, onerror) {
      var xhr = new XMLHttpRequest();xhr.open("GET", url, true);xhr.responseType = "arraybuffer";xhr.onload = function xhr_onload() {
        if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
          onload(xhr.response);
        } else {
          onerror();
        }
      };xhr.onerror = onerror;xhr.send(null);
    }, asyncLoad: function (url, onload, onerror, noRunDep) {
      Browser.xhrLoad(url, function (arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if (!noRunDep) removeRunDependency("al " + url);
      }, function (event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });if (!noRunDep) addRunDependency("al " + url);
    }, resizeListeners: [], updateResizeListeners: function () {
      var canvas = Module["canvas"];Browser.resizeListeners.forEach(function (listener) {
        listener(canvas.width, canvas.height);
      });
    }, setCanvasSize: function (width, height, noUpdates) {
      var canvas = Module["canvas"];Browser.updateCanvasDimensions(canvas, width, height);if (!noUpdates) Browser.updateResizeListeners();
    }, windowedWidth: 0, windowedHeight: 0, setFullScreenCanvasSize: function () {
      if (typeof SDL != "undefined") {
        var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];flags = flags | 8388608;HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
      }Browser.updateResizeListeners();
    }, setWindowedCanvasSize: function () {
      if (typeof SDL != "undefined") {
        var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];flags = flags & ~8388608;HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags;
      }Browser.updateResizeListeners();
    }, updateCanvasDimensions: function (canvas, wNative, hNative) {
      if (wNative && hNative) {
        canvas.widthNative = wNative;canvas.heightNative = hNative;
      } else {
        wNative = canvas.widthNative;hNative = canvas.heightNative;
      }var w = wNative;var h = hNative;if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
        if (w / h < Module["forcedAspectRatio"]) {
          w = Math.round(h * Module["forcedAspectRatio"]);
        } else {
          h = Math.round(w / Module["forcedAspectRatio"]);
        }
      }if ((document["webkitFullScreenElement"] || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["mozFullscreenElement"] || document["fullScreenElement"] || document["fullscreenElement"] || document["msFullScreenElement"] || document["msFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
        var factor = Math.min(screen.width / w, screen.height / h);w = Math.round(w * factor);h = Math.round(h * factor);
      }if (Browser.resizeCanvas) {
        if (canvas.width != w) canvas.width = w;if (canvas.height != h) canvas.height = h;if (typeof canvas.style != "undefined") {
          canvas.style.removeProperty("width");canvas.style.removeProperty("height");
        }
      } else {
        if (canvas.width != wNative) canvas.width = wNative;if (canvas.height != hNative) canvas.height = hNative;if (typeof canvas.style != "undefined") {
          if (w != wNative || h != hNative) {
            canvas.style.setProperty("width", w + "px", "important");canvas.style.setProperty("height", h + "px", "important");
          } else {
            canvas.style.removeProperty("width");canvas.style.removeProperty("height");
          }
        }
      }
    }, wgetRequests: {}, nextWgetRequestHandle: 0, getNextWgetRequestHandle: function () {
      var handle = Browser.nextWgetRequestHandle;Browser.nextWgetRequestHandle++;return handle;
    } };var SYSCALLS = { varargs: 0, get: function (varargs) {
      SYSCALLS.varargs += 4;var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];return ret;
    }, getStr: function () {
      var ret = Pointer_stringify(SYSCALLS.get());return ret;
    }, get64: function () {
      var low = SYSCALLS.get(),
          high = SYSCALLS.get();if (low >= 0) assert(high === 0);else assert(high === -1);return low;
    }, getZero: function () {
      assert(SYSCALLS.get() === 0);
    } };function ___syscall6(which, varargs) {
    SYSCALLS.varargs = varargs;try {
      var stream = SYSCALLS.getStreamFromFD();FS.close(stream);return 0;
    } catch (e) {
      if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);return -e.errno;
    }
  }function _malloc(bytes) {
    var ptr = Runtime.dynamicAlloc(bytes + 8);return ptr + 8 & 4294967288;
  }Module["_malloc"] = _malloc;function ___cxa_allocate_exception(size) {
    return _malloc(size);
  }function ___syscall54(which, varargs) {
    SYSCALLS.varargs = varargs;try {
      return 0;
    } catch (e) {
      if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);return -e.errno;
    }
  }function ___setErrNo(value) {
    if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;return value;
  }var ERRNO_CODES = { EPERM: 1, ENOENT: 2, ESRCH: 3, EINTR: 4, EIO: 5, ENXIO: 6, E2BIG: 7, ENOEXEC: 8, EBADF: 9, ECHILD: 10, EAGAIN: 11, EWOULDBLOCK: 11, ENOMEM: 12, EACCES: 13, EFAULT: 14, ENOTBLK: 15, EBUSY: 16, EEXIST: 17, EXDEV: 18, ENODEV: 19, ENOTDIR: 20, EISDIR: 21, EINVAL: 22, ENFILE: 23, EMFILE: 24, ENOTTY: 25, ETXTBSY: 26, EFBIG: 27, ENOSPC: 28, ESPIPE: 29, EROFS: 30, EMLINK: 31, EPIPE: 32, EDOM: 33, ERANGE: 34, ENOMSG: 42, EIDRM: 43, ECHRNG: 44, EL2NSYNC: 45, EL3HLT: 46, EL3RST: 47, ELNRNG: 48, EUNATCH: 49, ENOCSI: 50, EL2HLT: 51, EDEADLK: 35, ENOLCK: 37, EBADE: 52, EBADR: 53, EXFULL: 54, ENOANO: 55, EBADRQC: 56, EBADSLT: 57, EDEADLOCK: 35, EBFONT: 59, ENOSTR: 60, ENODATA: 61, ETIME: 62, ENOSR: 63, ENONET: 64, ENOPKG: 65, EREMOTE: 66, ENOLINK: 67, EADV: 68, ESRMNT: 69, ECOMM: 70, EPROTO: 71, EMULTIHOP: 72, EDOTDOT: 73, EBADMSG: 74, ENOTUNIQ: 76, EBADFD: 77, EREMCHG: 78, ELIBACC: 79, ELIBBAD: 80, ELIBSCN: 81, ELIBMAX: 82, ELIBEXEC: 83, ENOSYS: 38, ENOTEMPTY: 39, ENAMETOOLONG: 36, ELOOP: 40, EOPNOTSUPP: 95, EPFNOSUPPORT: 96, ECONNRESET: 104, ENOBUFS: 105, EAFNOSUPPORT: 97, EPROTOTYPE: 91, ENOTSOCK: 88, ENOPROTOOPT: 92, ESHUTDOWN: 108, ECONNREFUSED: 111, EADDRINUSE: 98, ECONNABORTED: 103, ENETUNREACH: 101, ENETDOWN: 100, ETIMEDOUT: 110, EHOSTDOWN: 112, EHOSTUNREACH: 113, EINPROGRESS: 115, EALREADY: 114, EDESTADDRREQ: 89, EMSGSIZE: 90, EPROTONOSUPPORT: 93, ESOCKTNOSUPPORT: 94, EADDRNOTAVAIL: 99, ENETRESET: 102, EISCONN: 106, ENOTCONN: 107, ETOOMANYREFS: 109, EUSERS: 87, EDQUOT: 122, ESTALE: 116, ENOTSUP: 95, ENOMEDIUM: 123, EILSEQ: 84, EOVERFLOW: 75, ECANCELED: 125, ENOTRECOVERABLE: 131, EOWNERDEAD: 130, ESTRPIPE: 86 };function _sysconf(name) {
    switch (name) {case 30:
        return PAGE_SIZE;case 85:
        return totalMemory / PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:
        return 200809;case 79:
        return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:
        return -1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:
        return 1;case 74:case 60:case 69:case 70:case 4:
        return 1024;case 31:case 42:case 72:
        return 32;case 87:case 26:case 33:
        return 2147483647;case 34:case 1:
        return 47839;case 38:case 36:
        return 99;case 43:case 37:
        return 2048;case 0:
        return 2097152;case 3:
        return 65536;case 28:
        return 32768;case 44:
        return 32767;case 75:
        return 16384;case 39:
        return 1e3;case 89:
        return 700;case 71:
        return 256;case 40:
        return 255;case 2:
        return 100;case 180:
        return 64;case 25:
        return 20;case 5:
        return 16;case 6:
        return 6;case 73:
        return 4;case 84:
        {
          if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;return 1;
        }}___setErrNo(ERRNO_CODES.EINVAL);return -1;
  }Module["_bitshift64Lshr"] = _bitshift64Lshr;function _typeModule(self) {
    var structureList = [[0, 1, "X"], [1, 1, "const X"], [128, 1, "X *"], [256, 1, "X &"], [384, 1, "X &&"], [512, 1, "std::shared_ptr<X>"], [640, 1, "std::unique_ptr<X>"], [5120, 1, "std::vector<X>"], [6144, 2, "std::array<X, Y>"], [9216, -1, "std::function<X (Y)>"]];function applyStructure(outerName, outerFlags, innerName, innerFlags, param, flip) {
      if (outerFlags == 1) {
        var ref = innerFlags & 896;if (ref == 128 || ref == 256 || ref == 384) outerName = "X const";
      }var name;if (flip) {
        name = innerName.replace("X", outerName).replace("Y", param);
      } else {
        name = outerName.replace("X", innerName).replace("Y", param);
      }return name.replace(/([*&]) (?=[*&])/g, "$1");
    }function reportProblem(problem, id, kind, structureType, place) {
      throw new Error(problem + " type " + kind.replace("X", id + "?") + (structureType ? " with flag " + structureType : "") + " in " + place);
    }function getComplexType(id, constructType, getType, queryType, place, kind, prevStructure, depth) {
      if (kind === void 0) {
        kind = "X";
      }if (depth === void 0) {
        depth = 1;
      }var result = getType(id);if (result) return result;var query = queryType(id);var structureType = query.placeholderFlag;var structure = structureList[structureType];if (prevStructure && structure) {
        kind = applyStructure(prevStructure[2], prevStructure[0], kind, structure[0], "?", true);
      }var problem;if (structureType == 0) problem = "Unbound";if (structureType >= 10) problem = "Corrupt";if (depth > 20) problem = "Deeply nested";if (problem) reportProblem(problem, id, kind, structureType, place || "?");var subId = query.paramList[0];var subType = getComplexType(subId, constructType, getType, queryType, place, kind, structure, depth + 1);var srcSpec;var spec = { flags: structure[0], id: id, name: "", paramList: [subType] };var argList = [];var structureParam = "?";switch (query.placeholderFlag) {case 1:
          srcSpec = subType.spec;break;case 2:
          if ((subType.flags & 15360) == 1024 && subType.spec.ptrSize == 1) {
            spec.flags = 7168;break;
          };case 3:case 6:case 5:
          srcSpec = subType.spec;if ((subType.flags & 15360) != 2048) {}break;case 8:
          structureParam = "" + query.paramList[1];spec.paramList.push(query.paramList[1]);break;case 9:
          for (var _i = 0, _a = query.paramList[1]; _i < _a.length; _i++) {
            var paramId = _a[_i];var paramType = getComplexType(paramId, constructType, getType, queryType, place, kind, structure, depth + 1);argList.push(paramType.name);spec.paramList.push(paramType);
          }structureParam = argList.join(", ");break;default:
          break;}spec.name = applyStructure(structure[2], structure[0], subType.name, subType.flags, structureParam);if (srcSpec) {
        for (var _b = 0, _c = Object.keys(srcSpec); _b < _c.length; _b++) {
          var key = _c[_b];spec[key] = spec[key] || srcSpec[key];
        }spec.flags |= srcSpec.flags;
      }return makeType(constructType, spec);
    }function makeType(constructType, spec) {
      var flags = spec.flags;var refKind = flags & 896;var kind = flags & 15360;if (!spec.name && kind == 1024) {
        if (spec.ptrSize == 1) {
          spec.name = (flags & 16 ? "" : (flags & 8 ? "un" : "") + "signed ") + "char";
        } else {
          spec.name = (flags & 8 ? "u" : "") + (flags & 32 ? "float" : "int") + (spec.ptrSize * 8 + "_t");
        }
      }if (spec.ptrSize == 8 && !(flags & 32)) kind = 64;if (kind == 2048) {
        if (refKind == 512 || refKind == 640) {
          kind = 4096;
        } else if (refKind) kind = 3072;
      }return constructType(kind, spec);
    }var Type = function () {
      function Type(spec) {
        this.id = spec.id;this.name = spec.name;this.flags = spec.flags;this.spec = spec;
      }Type.prototype.toString = function () {
        return this.name;
      };return Type;
    }();var output = { Type: Type, getComplexType: getComplexType, makeType: makeType, structureList: structureList };self.output = output;return self.output || output;
  }function __nbind_register_type(id, namePtr) {
    var name = _nbind.readAsciiString(namePtr);var spec = { flags: 10240, id: id, name: name };_nbind.makeType(_nbind.constructType, spec);
  }var _BDtoIHigh = true;function _pthread_cleanup_push(routine, arg) {
    __ATEXIT__.push(function () {
      Runtime.dynCall("vi", routine, [arg]);
    });_pthread_cleanup_push.level = __ATEXIT__.length;
  }function __nbind_register_callback_signature(typeListPtr, typeCount) {
    var typeList = _nbind.readTypeIdList(typeListPtr, typeCount);var num = _nbind.callbackSignatureList.length;_nbind.callbackSignatureList[num] = _nbind.makeJSCaller(typeList);return num;
  }function __extends(Class, Parent) {
    for (var key in Parent) if (Parent.hasOwnProperty(key)) Class[key] = Parent[key];function Base() {
      this.constructor = Class;
    }Base.prototype = Parent.prototype;Class.prototype = new Base();
  }function __nbind_register_class(idListPtr, policyListPtr, superListPtr, upcastListPtr, superCount, destructorPtr, namePtr) {
    var name = _nbind.readAsciiString(namePtr);var policyTbl = _nbind.readPolicyList(policyListPtr);var idList = HEAPU32.subarray(idListPtr / 4, idListPtr / 4 + 2);var spec = { flags: 2048 | (policyTbl["Value"] ? 2 : 0), id: idList[0], name: name };var bindClass = _nbind.makeType(_nbind.constructType, spec);bindClass.ptrType = _nbind.getComplexType(idList[1], _nbind.constructType, _nbind.getType, _nbind.queryType);bindClass.destroy = _nbind.makeMethodCaller(bindClass.ptrType, { boundID: spec.id, flags: 0, name: "destroy", num: 0, ptr: destructorPtr, title: bindClass.name + ".free", typeList: ["void", "uint32_t", "uint32_t"] });if (superCount) {
      bindClass.superIdList = Array.prototype.slice.call(HEAPU32.subarray(superListPtr / 4, superListPtr / 4 + superCount));bindClass.upcastList = Array.prototype.slice.call(HEAPU32.subarray(upcastListPtr / 4, upcastListPtr / 4 + superCount));
    }Module[bindClass.name] = bindClass.makeBound(policyTbl);_nbind.BindClass.list.push(bindClass);
  }function _removeAccessorPrefix(name) {
    var prefixMatcher = /^[Gg]et_?([A-Z]?([A-Z]?))/;return name.replace(prefixMatcher, function (match, initial, second) {
      return second ? initial : initial.toLowerCase();
    });
  }function __nbind_register_function(boundID, policyListPtr, typeListPtr, typeCount, ptr, direct, signatureType, namePtr, num, flags) {
    var bindClass = _nbind.getType(boundID);var policyTbl = _nbind.readPolicyList(policyListPtr);var typeList = _nbind.readTypeIdList(typeListPtr, typeCount);var specList;if (signatureType == 5) {
      specList = [{ direct: ptr, name: "__nbindConstructor", ptr: 0, title: bindClass.name + " constructor", typeList: ["uint32_t"].concat(typeList.slice(1)) }, { direct: direct, name: "__nbindValueConstructor", ptr: 0, title: bindClass.name + " value constructor", typeList: ["void", "uint32_t"].concat(typeList.slice(1)) }];
    } else {
      var name_1 = _nbind.readAsciiString(namePtr);var title = (bindClass.name && bindClass.name + ".") + name_1;if (signatureType == 3 || signatureType == 4) {
        name_1 = _removeAccessorPrefix(name_1);
      }specList = [{ boundID: boundID, direct: direct, name: name_1, ptr: ptr, title: title, typeList: typeList }];
    }for (var _i = 0, specList_1 = specList; _i < specList_1.length; _i++) {
      var spec = specList_1[_i];spec.signatureType = signatureType;spec.policyTbl = policyTbl;spec.num = num;spec.flags = flags;bindClass.addMethod(spec);
    }
  }function _YGEdgeToString() {
    Module["printErr"]("missing function: YGEdgeToString");abort(-1);
  }function _nbind_value(name, proto) {
    if (!_nbind.typeNameTbl[name]) _nbind.throwError("Unknown value type " + name);Module["NBind"].bind_value(name, proto);_defineHidden(_nbind.typeNameTbl[name].proto.prototype.__nbindValueConstructor)(proto.prototype, "__nbindValueConstructor");
  }Module["_nbind_value"] = _nbind_value;function __nbind_get_value_object(num, ptr) {
    var obj = _nbind.popValue(num);if (!obj.fromJS) {
      throw new Error("Object " + obj + " has no fromJS function");
    }obj.fromJS(function () {
      obj.__nbindValueConstructor.apply(this, Array.prototype.concat.apply([ptr], arguments));
    });
  }function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest);return dest;
  }Module["_memcpy"] = _memcpy;function _llvm_stackrestore(p) {
    var self = _llvm_stacksave;var ret = self.LLVM_SAVEDSTACKS[p];self.LLVM_SAVEDSTACKS.splice(p, 1);Runtime.stackRestore(ret);
  }function _YGOverflowToString() {
    Module["printErr"]("missing function: YGOverflowToString");abort(-1);
  }function _sbrk(bytes) {
    var self = _sbrk;if (!self.called) {
      DYNAMICTOP = alignMemoryPage(DYNAMICTOP);self.called = true;assert(Runtime.dynamicAlloc);self.alloc = Runtime.dynamicAlloc;Runtime.dynamicAlloc = function () {
        abort("cannot dynamically allocate, sbrk now has control");
      };
    }var ret = DYNAMICTOP;if (bytes != 0) {
      var success = self.alloc(bytes);if (!success) return -1 >>> 0;
    }return ret;
  }function _llvm_stacksave() {
    var self = _llvm_stacksave;if (!self.LLVM_SAVEDSTACKS) {
      self.LLVM_SAVEDSTACKS = [];
    }self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());return self.LLVM_SAVEDSTACKS.length - 1;
  }function _YGAlignToString() {
    Module["printErr"]("missing function: YGAlignToString");abort(-1);
  }var _BItoD = true;function _time(ptr) {
    var ret = Date.now() / 1e3 | 0;if (ptr) {
      HEAP32[ptr >> 2] = ret;
    }return ret;
  }function _pthread_self() {
    return 0;
  }function ___syscall140(which, varargs) {
    SYSCALLS.varargs = varargs;try {
      var stream = SYSCALLS.getStreamFromFD(),
          offset_high = SYSCALLS.get(),
          offset_low = SYSCALLS.get(),
          result = SYSCALLS.get(),
          whence = SYSCALLS.get();var offset = offset_low;assert(offset_high === 0);FS.llseek(stream, offset, whence);HEAP32[result >> 2] = stream.position;if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;return 0;
    } catch (e) {
      if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);return -e.errno;
    }
  }function ___syscall146(which, varargs) {
    SYSCALLS.varargs = varargs;try {
      var stream = SYSCALLS.get(),
          iov = SYSCALLS.get(),
          iovcnt = SYSCALLS.get();var ret = 0;if (!___syscall146.buffer) ___syscall146.buffer = [];var buffer = ___syscall146.buffer;for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[iov + i * 8 >> 2];var len = HEAP32[iov + (i * 8 + 4) >> 2];for (var j = 0; j < len; j++) {
          var curr = HEAPU8[ptr + j];if (curr === 0 || curr === 10) {
            Module["print"](UTF8ArrayToString(buffer, 0));buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        }ret += len;
      }return ret;
    } catch (e) {
      if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);return -e.errno;
    }
  }function __nbind_finish() {
    for (var _i = 0, _a = _nbind.BindClass.list; _i < _a.length; _i++) {
      var bindClass = _a[_i];bindClass.finish();
    }
  }function _YGDisplayToString() {
    Module["printErr"]("missing function: YGDisplayToString");abort(-1);
  }var ___dso_handle = allocate(1, "i32*", ALLOC_STATIC);(function (_nbind) {
    var typeIdTbl = {};_nbind.typeNameTbl = {};var Pool = function () {
      function Pool() {}Pool.lalloc = function (size) {
        size = size + 7 & ~7;var used = HEAPU32[Pool.usedPtr];if (size > Pool.pageSize / 2 || size > Pool.pageSize - used) {
          var NBind = _nbind.typeNameTbl["NBind"].proto;return NBind.lalloc(size);
        } else {
          HEAPU32[Pool.usedPtr] = used + size;return Pool.rootPtr + used;
        }
      };Pool.lreset = function (used, page) {
        var topPage = HEAPU32[Pool.pagePtr];if (topPage) {
          var NBind = _nbind.typeNameTbl["NBind"].proto;NBind.lreset(used, page);
        } else {
          HEAPU32[Pool.usedPtr] = used;
        }
      };return Pool;
    }();_nbind.Pool = Pool;function constructType(kind, spec) {
      var construct = kind == 10240 ? _nbind.makeTypeNameTbl[spec.name] || _nbind.BindType : _nbind.makeTypeKindTbl[kind];var bindType = new construct(spec);typeIdTbl[spec.id] = bindType;_nbind.typeNameTbl[spec.name] = bindType;return bindType;
    }_nbind.constructType = constructType;function getType(id) {
      return typeIdTbl[id];
    }_nbind.getType = getType;function queryType(id) {
      var placeholderFlag = HEAPU8[id];var paramCount = _nbind.structureList[placeholderFlag][1];id /= 4;if (paramCount < 0) {
        ++id;paramCount = HEAPU32[id] + 1;
      }var paramList = Array.prototype.slice.call(HEAPU32.subarray(id + 1, id + 1 + paramCount));if (placeholderFlag == 9) {
        paramList = [paramList[0], paramList.slice(1)];
      }return { paramList: paramList, placeholderFlag: placeholderFlag };
    }_nbind.queryType = queryType;function getTypes(idList, place) {
      return idList.map(function (id) {
        return typeof id == "number" ? _nbind.getComplexType(id, constructType, getType, queryType, place) : _nbind.typeNameTbl[id];
      });
    }_nbind.getTypes = getTypes;function readTypeIdList(typeListPtr, typeCount) {
      return Array.prototype.slice.call(HEAPU32, typeListPtr / 4, typeListPtr / 4 + typeCount);
    }_nbind.readTypeIdList = readTypeIdList;function readAsciiString(ptr) {
      var endPtr = ptr;while (HEAPU8[endPtr++]);return String.fromCharCode.apply("", HEAPU8.subarray(ptr, endPtr - 1));
    }_nbind.readAsciiString = readAsciiString;function readPolicyList(policyListPtr) {
      var policyTbl = {};if (policyListPtr) {
        while (1) {
          var namePtr = HEAPU32[policyListPtr / 4];if (!namePtr) break;policyTbl[readAsciiString(namePtr)] = true;policyListPtr += 4;
        }
      }return policyTbl;
    }_nbind.readPolicyList = readPolicyList;function getDynCall(typeList, name) {
      var mangleMap = { float32_t: "d", float64_t: "d", int64_t: "d", uint64_t: "d", "void": "v" };var signature = typeList.map(function (type) {
        return mangleMap[type.name] || "i";
      }).join("");var dynCall = Module["dynCall_" + signature];if (!dynCall) {
        throw new Error("dynCall_" + signature + " not found for " + name + "(" + typeList.map(function (type) {
          return type.name;
        }).join(", ") + ")");
      }return dynCall;
    }_nbind.getDynCall = getDynCall;function addMethod(obj, name, func, arity) {
      var overload = obj[name];if (obj.hasOwnProperty(name) && overload) {
        if (overload.arity || overload.arity === 0) {
          overload = _nbind.makeOverloader(overload, overload.arity);obj[name] = overload;
        }overload.addMethod(func, arity);
      } else {
        func.arity = arity;obj[name] = func;
      }
    }_nbind.addMethod = addMethod;function throwError(message) {
      throw new Error(message);
    }_nbind.throwError = throwError;_nbind.bigEndian = false;_a = _typeModule(_typeModule), _nbind.Type = _a.Type, _nbind.makeType = _a.makeType, _nbind.getComplexType = _a.getComplexType, _nbind.structureList = _a.structureList;var BindType = function (_super) {
      __extends(BindType, _super);function BindType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.heap = HEAPU32;_this.ptrSize = 4;return _this;
      }BindType.prototype.needsWireRead = function (policyTbl) {
        return !!this.wireRead || !!this.makeWireRead;
      };BindType.prototype.needsWireWrite = function (policyTbl) {
        return !!this.wireWrite || !!this.makeWireWrite;
      };return BindType;
    }(_nbind.Type);_nbind.BindType = BindType;var PrimitiveType = function (_super) {
      __extends(PrimitiveType, _super);function PrimitiveType(spec) {
        var _this = _super.call(this, spec) || this;var heapTbl = spec.flags & 32 ? { 32: HEAPF32, 64: HEAPF64 } : spec.flags & 8 ? { 8: HEAPU8, 16: HEAPU16, 32: HEAPU32 } : { 8: HEAP8, 16: HEAP16, 32: HEAP32 };_this.heap = heapTbl[spec.ptrSize * 8];_this.ptrSize = spec.ptrSize;return _this;
      }PrimitiveType.prototype.needsWireWrite = function (policyTbl) {
        return !!policyTbl && !!policyTbl["Strict"];
      };PrimitiveType.prototype.makeWireWrite = function (expr, policyTbl) {
        return policyTbl && policyTbl["Strict"] && function (arg) {
          if (typeof arg == "number") return arg;throw new Error("Type mismatch");
        };
      };return PrimitiveType;
    }(BindType);_nbind.PrimitiveType = PrimitiveType;function pushCString(str, policyTbl) {
      if (str === null || str === undefined) {
        if (policyTbl && policyTbl["Nullable"]) {
          return 0;
        } else throw new Error("Type mismatch");
      }if (policyTbl && policyTbl["Strict"]) {
        if (typeof str != "string") throw new Error("Type mismatch");
      } else str = str.toString();var length = Module.lengthBytesUTF8(str) + 1;var result = _nbind.Pool.lalloc(length);Module.stringToUTF8Array(str, HEAPU8, result, length);return result;
    }_nbind.pushCString = pushCString;function popCString(ptr) {
      if (ptr === 0) return null;return Module.Pointer_stringify(ptr);
    }_nbind.popCString = popCString;var CStringType = function (_super) {
      __extends(CStringType, _super);function CStringType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireRead = popCString;_this.wireWrite = pushCString;_this.readResources = [_nbind.resources.pool];_this.writeResources = [_nbind.resources.pool];return _this;
      }CStringType.prototype.makeWireWrite = function (expr, policyTbl) {
        return function (arg) {
          return pushCString(arg, policyTbl);
        };
      };return CStringType;
    }(BindType);_nbind.CStringType = CStringType;var BooleanType = function (_super) {
      __extends(BooleanType, _super);function BooleanType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireRead = function (arg) {
          return !!arg;
        };return _this;
      }BooleanType.prototype.needsWireWrite = function (policyTbl) {
        return !!policyTbl && !!policyTbl["Strict"];
      };BooleanType.prototype.makeWireRead = function (expr) {
        return "!!(" + expr + ")";
      };BooleanType.prototype.makeWireWrite = function (expr, policyTbl) {
        return policyTbl && policyTbl["Strict"] && function (arg) {
          if (typeof arg == "boolean") return arg;throw new Error("Type mismatch");
        } || expr;
      };return BooleanType;
    }(BindType);_nbind.BooleanType = BooleanType;var Wrapper = function () {
      function Wrapper() {}Wrapper.prototype.persist = function () {
        this.__nbindState |= 1;
      };return Wrapper;
    }();_nbind.Wrapper = Wrapper;function makeBound(policyTbl, bindClass) {
      var Bound = function (_super) {
        __extends(Bound, _super);function Bound(marker, flags, ptr, shared) {
          var _this = _super.call(this) || this;if (!(_this instanceof Bound)) {
            return new (Function.prototype.bind.apply(Bound, Array.prototype.concat.apply([null], arguments)))();
          }var nbindFlags = flags;var nbindPtr = ptr;var nbindShared = shared;if (marker !== _nbind.ptrMarker) {
            var wirePtr = _this.__nbindConstructor.apply(_this, arguments);nbindFlags = 4096 | 512;nbindShared = HEAPU32[wirePtr / 4];nbindPtr = HEAPU32[wirePtr / 4 + 1];
          }var spec = { configurable: true, enumerable: false, value: null, writable: false };var propTbl = { "__nbindFlags": nbindFlags, "__nbindPtr": nbindPtr };if (nbindShared) {
            propTbl["__nbindShared"] = nbindShared;_nbind.mark(_this);
          }for (var _i = 0, _a = Object.keys(propTbl); _i < _a.length; _i++) {
            var key = _a[_i];spec.value = propTbl[key];Object.defineProperty(_this, key, spec);
          }_defineHidden(0)(_this, "__nbindState");return _this;
        }Bound.prototype.free = function () {
          bindClass.destroy.call(this, this.__nbindShared, this.__nbindFlags);this.__nbindState |= 2;disableMember(this, "__nbindShared");disableMember(this, "__nbindPtr");
        };return Bound;
      }(Wrapper);__decorate([_defineHidden()], Bound.prototype, "__nbindConstructor", void 0);__decorate([_defineHidden()], Bound.prototype, "__nbindValueConstructor", void 0);__decorate([_defineHidden(policyTbl)], Bound.prototype, "__nbindPolicies", void 0);return Bound;
    }_nbind.makeBound = makeBound;function disableMember(obj, name) {
      function die() {
        throw new Error("Accessing deleted object");
      }Object.defineProperty(obj, name, { configurable: false, enumerable: false, get: die, set: die });
    }_nbind.ptrMarker = {};var BindClass = function (_super) {
      __extends(BindClass, _super);function BindClass(spec) {
        var _this = _super.call(this, spec) || this;_this.wireRead = function (arg) {
          return _nbind.popValue(arg, _this.ptrType);
        };_this.wireWrite = function (arg) {
          return pushPointer(arg, _this.ptrType, true);
        };_this.pendingSuperCount = 0;_this.ready = false;_this.methodTbl = {};if (spec.paramList) {
          _this.classType = spec.paramList[0].classType;_this.proto = _this.classType.proto;
        } else _this.classType = _this;return _this;
      }BindClass.prototype.makeBound = function (policyTbl) {
        var Bound = _nbind.makeBound(policyTbl, this);this.proto = Bound;this.ptrType.proto = Bound;return Bound;
      };BindClass.prototype.addMethod = function (spec) {
        var overloadList = this.methodTbl[spec.name] || [];overloadList.push(spec);this.methodTbl[spec.name] = overloadList;
      };BindClass.prototype.registerMethods = function (src, staticOnly) {
        var setter;for (var _i = 0, _a = Object.keys(src.methodTbl); _i < _a.length; _i++) {
          var name_1 = _a[_i];var overloadList = src.methodTbl[name_1];for (var _b = 0, overloadList_1 = overloadList; _b < overloadList_1.length; _b++) {
            var spec = overloadList_1[_b];var target = void 0;var caller = void 0;target = this.proto.prototype;if (staticOnly && spec.signatureType != 1) continue;switch (spec.signatureType) {case 1:
                target = this.proto;case 5:
                caller = _nbind.makeCaller(spec);_nbind.addMethod(target, spec.name, caller, spec.typeList.length - 1);break;case 4:
                setter = _nbind.makeMethodCaller(src.ptrType, spec);break;case 3:
                Object.defineProperty(target, spec.name, { configurable: true, enumerable: false, get: _nbind.makeMethodCaller(src.ptrType, spec), set: setter });break;case 2:
                caller = _nbind.makeMethodCaller(src.ptrType, spec);_nbind.addMethod(target, spec.name, caller, spec.typeList.length - 1);break;default:
                break;}
          }
        }
      };BindClass.prototype.registerSuperMethods = function (src, firstSuper, visitTbl) {
        if (visitTbl[src.name]) return;visitTbl[src.name] = true;var superNum = 0;var nextFirst;for (var _i = 0, _a = src.superIdList || []; _i < _a.length; _i++) {
          var superId = _a[_i];var superClass = _nbind.getType(superId);if (superNum++ < firstSuper || firstSuper < 0) {
            nextFirst = -1;
          } else {
            nextFirst = 0;
          }this.registerSuperMethods(superClass, nextFirst, visitTbl);
        }this.registerMethods(src, firstSuper < 0);
      };BindClass.prototype.finish = function () {
        if (this.ready) return this;this.ready = true;this.superList = (this.superIdList || []).map(function (superId) {
          return _nbind.getType(superId).finish();
        });var Bound = this.proto;if (this.superList.length) {
          var Proto = function () {
            this.constructor = Bound;
          };Proto.prototype = this.superList[0].proto.prototype;Bound.prototype = new Proto();
        }if (Bound != Module) Bound.prototype.__nbindType = this;this.registerSuperMethods(this, 1, {});return this;
      };BindClass.prototype.upcastStep = function (dst, ptr) {
        if (dst == this) return ptr;for (var i = 0; i < this.superList.length; ++i) {
          var superPtr = this.superList[i].upcastStep(dst, _nbind.callUpcast(this.upcastList[i], ptr));if (superPtr) return superPtr;
        }return 0;
      };return BindClass;
    }(_nbind.BindType);BindClass.list = [];_nbind.BindClass = BindClass;function popPointer(ptr, type) {
      return ptr ? new type.proto(_nbind.ptrMarker, type.flags, ptr) : null;
    }_nbind.popPointer = popPointer;function pushPointer(obj, type, tryValue) {
      if (!(obj instanceof _nbind.Wrapper)) {
        if (tryValue) {
          return _nbind.pushValue(obj);
        } else throw new Error("Type mismatch");
      }var ptr = obj.__nbindPtr;var objType = obj.__nbindType.classType;var classType = type.classType;if (obj instanceof type.proto) {
        while (objType != classType) {
          ptr = _nbind.callUpcast(objType.upcastList[0], ptr);objType = objType.superList[0];
        }
      } else {
        ptr = objType.upcastStep(classType, ptr);if (!ptr) throw new Error("Type mismatch");
      }return ptr;
    }_nbind.pushPointer = pushPointer;function pushMutablePointer(obj, type) {
      var ptr = pushPointer(obj, type);if (obj.__nbindFlags & 1) {
        throw new Error("Passing a const value as a non-const argument");
      }return ptr;
    }var BindClassPtr = function (_super) {
      __extends(BindClassPtr, _super);function BindClassPtr(spec) {
        var _this = _super.call(this, spec) || this;_this.classType = spec.paramList[0].classType;_this.proto = _this.classType.proto;var isConst = spec.flags & 1;var isValue = (_this.flags & 896) == 256 && spec.flags & 2;var push = isConst ? pushPointer : pushMutablePointer;var pop = isValue ? _nbind.popValue : popPointer;_this.makeWireWrite = function (expr, policyTbl) {
          return policyTbl["Nullable"] ? function (arg) {
            return arg ? push(arg, _this) : 0;
          } : function (arg) {
            return push(arg, _this);
          };
        };_this.wireRead = function (arg) {
          return pop(arg, _this);
        };_this.wireWrite = function (arg) {
          return push(arg, _this);
        };return _this;
      }return BindClassPtr;
    }(_nbind.BindType);_nbind.BindClassPtr = BindClassPtr;function popShared(ptr, type) {
      var shared = HEAPU32[ptr / 4];var unsafe = HEAPU32[ptr / 4 + 1];return unsafe ? new type.proto(_nbind.ptrMarker, type.flags, unsafe, shared) : null;
    }_nbind.popShared = popShared;function pushShared(obj, type) {
      if (!(obj instanceof type.proto)) throw new Error("Type mismatch");return obj.__nbindShared;
    }function pushMutableShared(obj, type) {
      if (!(obj instanceof type.proto)) throw new Error("Type mismatch");if (obj.__nbindFlags & 1) {
        throw new Error("Passing a const value as a non-const argument");
      }return obj.__nbindShared;
    }var SharedClassPtr = function (_super) {
      __extends(SharedClassPtr, _super);function SharedClassPtr(spec) {
        var _this = _super.call(this, spec) || this;_this.readResources = [_nbind.resources.pool];_this.classType = spec.paramList[0].classType;_this.proto = _this.classType.proto;var isConst = spec.flags & 1;var push = isConst ? pushShared : pushMutableShared;_this.wireRead = function (arg) {
          return popShared(arg, _this);
        };_this.wireWrite = function (arg) {
          return push(arg, _this);
        };return _this;
      }return SharedClassPtr;
    }(_nbind.BindType);_nbind.SharedClassPtr = SharedClassPtr;_nbind.externalList = [0];var firstFreeExternal = 0;var External = function () {
      function External(data) {
        this.refCount = 1;this.data = data;
      }External.prototype.register = function () {
        var num = firstFreeExternal;if (num) {
          firstFreeExternal = _nbind.externalList[num];
        } else num = _nbind.externalList.length;_nbind.externalList[num] = this;return num;
      };External.prototype.reference = function () {
        ++this.refCount;
      };External.prototype.dereference = function (num) {
        if (--this.refCount == 0) {
          if (this.free) this.free();_nbind.externalList[num] = firstFreeExternal;firstFreeExternal = num;
        }
      };return External;
    }();_nbind.External = External;function popExternal(num) {
      var obj = _nbind.externalList[num];obj.dereference(num);return obj.data;
    }function pushExternal(obj) {
      var external = new External(obj);external.reference();return external.register();
    }var ExternalType = function (_super) {
      __extends(ExternalType, _super);function ExternalType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireRead = popExternal;_this.wireWrite = pushExternal;return _this;
      }return ExternalType;
    }(_nbind.BindType);_nbind.ExternalType = ExternalType;_nbind.callbackSignatureList = [];var CallbackType = function (_super) {
      __extends(CallbackType, _super);function CallbackType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireWrite = function (func) {
          if (typeof func != "function") _nbind.throwError("Type mismatch");return new _nbind.External(func).register();
        };return _this;
      }return CallbackType;
    }(_nbind.BindType);_nbind.CallbackType = CallbackType;_nbind.valueList = [0];var firstFreeValue = 0;function pushValue(value) {
      var num = firstFreeValue;if (num) {
        firstFreeValue = _nbind.valueList[num];
      } else num = _nbind.valueList.length;_nbind.valueList[num] = value;return num * 2 + 1;
    }_nbind.pushValue = pushValue;function popValue(num, type) {
      if (!num) _nbind.throwError("Value type JavaScript class is missing or not registered");if (num & 1) {
        num >>= 1;var obj = _nbind.valueList[num];_nbind.valueList[num] = firstFreeValue;firstFreeValue = num;return obj;
      } else if (type) {
        return _nbind.popShared(num, type);
      } else throw new Error("Invalid value slot " + num);
    }_nbind.popValue = popValue;var valueBase = 0x10000000000000000;function push64(num) {
      if (typeof num == "number") return num;return pushValue(num) * 4096 + valueBase;
    }function pop64(num) {
      if (num < valueBase) return num;return popValue((num - valueBase) / 4096);
    }var CreateValueType = function (_super) {
      __extends(CreateValueType, _super);function CreateValueType() {
        return _super !== null && _super.apply(this, arguments) || this;
      }CreateValueType.prototype.makeWireWrite = function (expr) {
        return "(_nbind.pushValue(new " + expr + "))";
      };return CreateValueType;
    }(_nbind.BindType);_nbind.CreateValueType = CreateValueType;var Int64Type = function (_super) {
      __extends(Int64Type, _super);function Int64Type() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireWrite = push64;_this.wireRead = pop64;return _this;
      }return Int64Type;
    }(_nbind.BindType);_nbind.Int64Type = Int64Type;function pushArray(arr, type) {
      if (!arr) return 0;var length = arr.length;if ((type.size || type.size === 0) && length < type.size) {
        throw new Error("Type mismatch");
      }var ptrSize = type.memberType.ptrSize;var result = _nbind.Pool.lalloc(4 + length * ptrSize);HEAPU32[result / 4] = length;var heap = type.memberType.heap;var ptr = (result + 4) / ptrSize;var wireWrite = type.memberType.wireWrite;var num = 0;if (wireWrite) {
        while (num < length) {
          heap[ptr++] = wireWrite(arr[num++]);
        }
      } else {
        while (num < length) {
          heap[ptr++] = arr[num++];
        }
      }return result;
    }_nbind.pushArray = pushArray;function popArray(ptr, type) {
      if (ptr === 0) return null;var length = HEAPU32[ptr / 4];var arr = new Array(length);var heap = type.memberType.heap;ptr = (ptr + 4) / type.memberType.ptrSize;var wireRead = type.memberType.wireRead;var num = 0;if (wireRead) {
        while (num < length) {
          arr[num++] = wireRead(heap[ptr++]);
        }
      } else {
        while (num < length) {
          arr[num++] = heap[ptr++];
        }
      }return arr;
    }_nbind.popArray = popArray;var ArrayType = function (_super) {
      __extends(ArrayType, _super);function ArrayType(spec) {
        var _this = _super.call(this, spec) || this;_this.wireRead = function (arg) {
          return popArray(arg, _this);
        };_this.wireWrite = function (arg) {
          return pushArray(arg, _this);
        };_this.readResources = [_nbind.resources.pool];_this.writeResources = [_nbind.resources.pool];_this.memberType = spec.paramList[0];if (spec.paramList[1]) _this.size = spec.paramList[1];return _this;
      }return ArrayType;
    }(_nbind.BindType);_nbind.ArrayType = ArrayType;function pushString(str, policyTbl) {
      if (str === null || str === undefined) {
        if (policyTbl && policyTbl["Nullable"]) {
          str = "";
        } else throw new Error("Type mismatch");
      }if (policyTbl && policyTbl["Strict"]) {
        if (typeof str != "string") throw new Error("Type mismatch");
      } else str = str.toString();var length = Module.lengthBytesUTF8(str);var result = _nbind.Pool.lalloc(4 + length + 1);HEAPU32[result / 4] = length;Module.stringToUTF8Array(str, HEAPU8, result + 4, length + 1);return result;
    }_nbind.pushString = pushString;function popString(ptr) {
      if (ptr === 0) return null;var length = HEAPU32[ptr / 4];return Module.Pointer_stringify(ptr + 4, length);
    }_nbind.popString = popString;var StringType = function (_super) {
      __extends(StringType, _super);function StringType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireRead = popString;_this.wireWrite = pushString;_this.readResources = [_nbind.resources.pool];_this.writeResources = [_nbind.resources.pool];return _this;
      }StringType.prototype.makeWireWrite = function (expr, policyTbl) {
        return function (arg) {
          return pushString(arg, policyTbl);
        };
      };return StringType;
    }(_nbind.BindType);_nbind.StringType = StringType;function makeArgList(argCount) {
      return Array.apply(null, Array(argCount)).map(function (dummy, num) {
        return "a" + (num + 1);
      });
    }function anyNeedsWireWrite(typeList, policyTbl) {
      return typeList.reduce(function (result, type) {
        return result || type.needsWireWrite(policyTbl);
      }, false);
    }function anyNeedsWireRead(typeList, policyTbl) {
      return typeList.reduce(function (result, type) {
        return result || !!type.needsWireRead(policyTbl);
      }, false);
    }function makeWireRead(convertParamList, policyTbl, type, expr) {
      var paramNum = convertParamList.length;if (type.makeWireRead) {
        return type.makeWireRead(expr, convertParamList, paramNum);
      } else if (type.wireRead) {
        convertParamList[paramNum] = type.wireRead;return "(convertParamList[" + paramNum + "](" + expr + "))";
      } else return expr;
    }function makeWireWrite(convertParamList, policyTbl, type, expr) {
      var wireWrite;var paramNum = convertParamList.length;if (type.makeWireWrite) {
        wireWrite = type.makeWireWrite(expr, policyTbl, convertParamList, paramNum);
      } else wireWrite = type.wireWrite;if (wireWrite) {
        if (typeof wireWrite == "string") {
          return wireWrite;
        } else {
          convertParamList[paramNum] = wireWrite;return "(convertParamList[" + paramNum + "](" + expr + "))";
        }
      } else return expr;
    }function buildCallerFunction(dynCall, ptrType, ptr, num, policyTbl, needsWireWrite, prefix, returnType, argTypeList, mask, err) {
      var argList = makeArgList(argTypeList.length);var convertParamList = [];var callExpression = makeWireRead(convertParamList, policyTbl, returnType, "dynCall(" + [prefix].concat(argList.map(function (name, index) {
        return makeWireWrite(convertParamList, policyTbl, argTypeList[index], name);
      })).join(",") + ")");var resourceSet = _nbind.listResources([returnType], argTypeList);var sourceCode = "function(" + argList.join(",") + "){" + (mask ? "this.__nbindFlags&mask&&err();" : "") + resourceSet.makeOpen() + "var r=" + callExpression + ";" + resourceSet.makeClose() + "return r;" + "}";return eval("(" + sourceCode + ")");
    }function buildJSCallerFunction(returnType, argTypeList) {
      var argList = makeArgList(argTypeList.length);var convertParamList = [];var callExpression = makeWireWrite(convertParamList, null, returnType, "_nbind.externalList[num].data(" + argList.map(function (name, index) {
        return makeWireRead(convertParamList, null, argTypeList[index], name);
      }).join(",") + ")");var resourceSet = _nbind.listResources(argTypeList, [returnType]);resourceSet.remove(_nbind.resources.pool);var sourceCode = "function(" + ["dummy", "num"].concat(argList).join(",") + "){" + resourceSet.makeOpen() + "var r=" + callExpression + ";" + resourceSet.makeClose() + "return r;" + "}";return eval("(" + sourceCode + ")");
    }_nbind.buildJSCallerFunction = buildJSCallerFunction;function makeJSCaller(idList) {
      var argCount = idList.length - 1;var typeList = _nbind.getTypes(idList, "callback");var returnType = typeList[0];var argTypeList = typeList.slice(1);var needsWireRead = anyNeedsWireRead(argTypeList, null);var needsWireWrite = returnType.needsWireWrite(null);if (!needsWireWrite && !needsWireRead) {
        switch (argCount) {case 0:
            return function (dummy, num) {
              return _nbind.externalList[num].data();
            };case 1:
            return function (dummy, num, a1) {
              return _nbind.externalList[num].data(a1);
            };case 2:
            return function (dummy, num, a1, a2) {
              return _nbind.externalList[num].data(a1, a2);
            };case 3:
            return function (dummy, num, a1, a2, a3) {
              return _nbind.externalList[num].data(a1, a2, a3);
            };default:
            break;}
      }return buildJSCallerFunction(returnType, argTypeList);
    }_nbind.makeJSCaller = makeJSCaller;function makeMethodCaller(ptrType, spec) {
      var argCount = spec.typeList.length - 1;var typeIdList = spec.typeList.slice(0);typeIdList.splice(1, 0, "uint32_t", spec.boundID);var typeList = _nbind.getTypes(typeIdList, spec.title);var returnType = typeList[0];var argTypeList = typeList.slice(3);var needsWireRead = returnType.needsWireRead(spec.policyTbl);var needsWireWrite = anyNeedsWireWrite(argTypeList, spec.policyTbl);var ptr = spec.ptr;var num = spec.num;var dynCall = _nbind.getDynCall(typeList, spec.title);var mask = ~spec.flags & 1;function err() {
        throw new Error("Calling a non-const method on a const object");
      }if (!needsWireRead && !needsWireWrite) {
        switch (argCount) {case 0:
            return function () {
              return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType));
            };case 1:
            return function (a1) {
              return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType), a1);
            };case 2:
            return function (a1, a2) {
              return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType), a1, a2);
            };case 3:
            return function (a1, a2, a3) {
              return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType), a1, a2, a3);
            };default:
            break;}
      }return buildCallerFunction(dynCall, ptrType, ptr, num, spec.policyTbl, needsWireWrite, "ptr,num,pushPointer(this,ptrType)", returnType, argTypeList, mask, err);
    }_nbind.makeMethodCaller = makeMethodCaller;function makeCaller(spec) {
      var argCount = spec.typeList.length - 1;var typeList = _nbind.getTypes(spec.typeList, spec.title);var returnType = typeList[0];var argTypeList = typeList.slice(1);var needsWireRead = returnType.needsWireRead(spec.policyTbl);var needsWireWrite = anyNeedsWireWrite(argTypeList, spec.policyTbl);var direct = spec.direct;var ptr = spec.ptr;if (spec.direct && !needsWireRead && !needsWireWrite) {
        var dynCall_1 = _nbind.getDynCall(typeList, spec.title);switch (argCount) {case 0:
            return function () {
              return dynCall_1(direct);
            };case 1:
            return function (a1) {
              return dynCall_1(direct, a1);
            };case 2:
            return function (a1, a2) {
              return dynCall_1(direct, a1, a2);
            };case 3:
            return function (a1, a2, a3) {
              return dynCall_1(direct, a1, a2, a3);
            };default:
            break;}ptr = 0;
      }var prefix;if (ptr) {
        var typeIdList = spec.typeList.slice(0);typeIdList.splice(1, 0, "uint32_t");typeList = _nbind.getTypes(typeIdList, spec.title);prefix = "ptr,num";
      } else {
        ptr = direct;prefix = "ptr";
      }var dynCall = _nbind.getDynCall(typeList, spec.title);return buildCallerFunction(dynCall, null, ptr, spec.num, spec.policyTbl, needsWireWrite, prefix, returnType, argTypeList);
    }_nbind.makeCaller = makeCaller;function makeOverloader(func, arity) {
      var callerList = [];function call() {
        return callerList[arguments.length].apply(this, arguments);
      }call.addMethod = function (_func, _arity) {
        callerList[_arity] = _func;
      };call.addMethod(func, arity);return call;
    }_nbind.makeOverloader = makeOverloader;var Resource = function () {
      function Resource(open, close) {
        var _this = this;this.makeOpen = function () {
          return Object.keys(_this.openTbl).join("");
        };this.makeClose = function () {
          return Object.keys(_this.closeTbl).join("");
        };this.openTbl = {};this.closeTbl = {};if (open) this.openTbl[open] = true;if (close) this.closeTbl[close] = true;
      }Resource.prototype.add = function (other) {
        for (var _i = 0, _a = Object.keys(other.openTbl); _i < _a.length; _i++) {
          var key = _a[_i];this.openTbl[key] = true;
        }for (var _b = 0, _c = Object.keys(other.closeTbl); _b < _c.length; _b++) {
          var key = _c[_b];this.closeTbl[key] = true;
        }
      };Resource.prototype.remove = function (other) {
        for (var _i = 0, _a = Object.keys(other.openTbl); _i < _a.length; _i++) {
          var key = _a[_i];delete this.openTbl[key];
        }for (var _b = 0, _c = Object.keys(other.closeTbl); _b < _c.length; _b++) {
          var key = _c[_b];delete this.closeTbl[key];
        }
      };return Resource;
    }();_nbind.Resource = Resource;function listResources(readList, writeList) {
      var result = new Resource();for (var _i = 0, readList_1 = readList; _i < readList_1.length; _i++) {
        var bindType = readList_1[_i];for (var _a = 0, _b = bindType.readResources || []; _a < _b.length; _a++) {
          var resource = _b[_a];result.add(resource);
        }
      }for (var _c = 0, writeList_1 = writeList; _c < writeList_1.length; _c++) {
        var bindType = writeList_1[_c];for (var _d = 0, _e = bindType.writeResources || []; _d < _e.length; _d++) {
          var resource = _e[_d];result.add(resource);
        }
      }return result;
    }_nbind.listResources = listResources;_nbind.resources = { pool: new Resource("var used=HEAPU32[_nbind.Pool.usedPtr],page=HEAPU32[_nbind.Pool.pagePtr];", "_nbind.Pool.lreset(used,page);") };var ExternalBuffer = function (_super) {
      __extends(ExternalBuffer, _super);function ExternalBuffer(buf, ptr) {
        var _this = _super.call(this, buf) || this;_this.ptr = ptr;return _this;
      }ExternalBuffer.prototype.free = function () {
        _free(this.ptr);
      };return ExternalBuffer;
    }(_nbind.External);function getBuffer(buf) {
      if (buf instanceof ArrayBuffer) {
        return new Uint8Array(buf);
      } else if (buf instanceof DataView) {
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
      } else return buf;
    }function pushBuffer(buf, policyTbl) {
      if (buf === null || buf === undefined) {
        if (policyTbl && policyTbl["Nullable"]) buf = [];
      }if (typeof buf != "object") throw new Error("Type mismatch");var b = buf;var length = b.byteLength || b.length;if (!length && length !== 0 && b.byteLength !== 0) throw new Error("Type mismatch");var result = _nbind.Pool.lalloc(8);var data = _malloc(length);var ptr = result / 4;HEAPU32[ptr++] = length;HEAPU32[ptr++] = data;HEAPU32[ptr++] = new ExternalBuffer(buf, data).register();HEAPU8.set(getBuffer(buf), data);return result;
    }var BufferType = function (_super) {
      __extends(BufferType, _super);function BufferType() {
        var _this = _super !== null && _super.apply(this, arguments) || this;_this.wireWrite = pushBuffer;_this.readResources = [_nbind.resources.pool];_this.writeResources = [_nbind.resources.pool];return _this;
      }BufferType.prototype.makeWireWrite = function (expr, policyTbl) {
        return function (arg) {
          return pushBuffer(arg, policyTbl);
        };
      };return BufferType;
    }(_nbind.BindType);_nbind.BufferType = BufferType;function commitBuffer(num, data, length) {
      var buf = _nbind.externalList[num].data;var NodeBuffer = Buffer;if (typeof Buffer != "function") NodeBuffer = function () {};if (buf instanceof Array) {} else {
        var src = HEAPU8.subarray(data, data + length);if (buf instanceof NodeBuffer) {
          var srcBuf = void 0;if (typeof Buffer.from == "function" && Buffer.from.length >= 3) {
            srcBuf = Buffer.from(src);
          } else srcBuf = new Buffer(src);srcBuf.copy(buf);
        } else getBuffer(buf).set(src);
      }
    }_nbind.commitBuffer = commitBuffer;var dirtyList = [];var gcTimer = 0;function sweep() {
      for (var _i = 0, dirtyList_1 = dirtyList; _i < dirtyList_1.length; _i++) {
        var obj = dirtyList_1[_i];if (!(obj.__nbindState & (1 | 2))) {
          obj.free();
        }
      }dirtyList = [];gcTimer = 0;
    }_nbind.mark = function (obj) {};function toggleLightGC(enable) {
      if (enable) {
        _nbind.mark = function (obj) {
          dirtyList.push(obj);if (!gcTimer) gcTimer = setTimeout(sweep, 0);
        };
      } else {
        _nbind.mark = function (obj) {};
      }
    }_nbind.toggleLightGC = toggleLightGC;
  })(_nbind);Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
    Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
  };Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
    Browser.requestAnimationFrame(func);
  };Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
    Browser.setCanvasSize(width, height, noUpdates);
  };Module["pauseMainLoop"] = function Module_pauseMainLoop() {
    Browser.mainLoop.pause();
  };Module["resumeMainLoop"] = function Module_resumeMainLoop() {
    Browser.mainLoop.resume();
  };Module["getUserMedia"] = function Module_getUserMedia() {
    Browser.getUserMedia();
  };Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
    return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
  };STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);staticSealed = true;STACK_MAX = STACK_BASE + TOTAL_STACK;DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");var cttz_i8 = allocate([8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0], "i8", ALLOC_DYNAMIC);function invoke_viiiii(index, a1, a2, a3, a4, a5) {
    try {
      Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_vid(index, a1, a2) {
    try {
      Module["dynCall_vid"](index, a1, a2);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_fiff(index, a1, a2, a3) {
    try {
      return Module["dynCall_fiff"](index, a1, a2, a3);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_vi(index, a1) {
    try {
      Module["dynCall_vi"](index, a1);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_vii(index, a1, a2) {
    try {
      Module["dynCall_vii"](index, a1, a2);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_ii(index, a1) {
    try {
      return Module["dynCall_ii"](index, a1);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viddi(index, a1, a2, a3, a4) {
    try {
      Module["dynCall_viddi"](index, a1, a2, a3, a4);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_vidd(index, a1, a2, a3) {
    try {
      Module["dynCall_vidd"](index, a1, a2, a3);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_iiii(index, a1, a2, a3) {
    try {
      return Module["dynCall_iiii"](index, a1, a2, a3);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_diii(index, a1, a2, a3) {
    try {
      return Module["dynCall_diii"](index, a1, a2, a3);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_di(index, a1) {
    try {
      return Module["dynCall_di"](index, a1);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_iid(index, a1, a2) {
    try {
      return Module["dynCall_iid"](index, a1, a2);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_iii(index, a1, a2) {
    try {
      return Module["dynCall_iii"](index, a1, a2);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viiddi(index, a1, a2, a3, a4, a5) {
    try {
      Module["dynCall_viiddi"](index, a1, a2, a3, a4, a5);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
    try {
      Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_dii(index, a1, a2) {
    try {
      return Module["dynCall_dii"](index, a1, a2);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_i(index) {
    try {
      return Module["dynCall_i"](index);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
    try {
      return Module["dynCall_iiiiii"](index, a1, a2, a3, a4, a5);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viiid(index, a1, a2, a3, a4) {
    try {
      Module["dynCall_viiid"](index, a1, a2, a3, a4);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viififi(index, a1, a2, a3, a4, a5, a6) {
    try {
      Module["dynCall_viififi"](index, a1, a2, a3, a4, a5, a6);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viii(index, a1, a2, a3) {
    try {
      Module["dynCall_viii"](index, a1, a2, a3);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_v(index) {
    try {
      Module["dynCall_v"](index);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viid(index, a1, a2, a3) {
    try {
      Module["dynCall_viid"](index, a1, a2, a3);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_idd(index, a1, a2) {
    try {
      return Module["dynCall_idd"](index, a1, a2);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }function invoke_viiii(index, a1, a2, a3, a4) {
    try {
      Module["dynCall_viiii"](index, a1, a2, a3, a4);
    } catch (e) {
      if (typeof e !== "number" && e !== "longjmp") throw e;asm["setThrew"](1, 0);
    }
  }Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };Module.asmLibraryArg = { "abort": abort, "assert": assert, "invoke_viiiii": invoke_viiiii, "invoke_vid": invoke_vid, "invoke_fiff": invoke_fiff, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viddi": invoke_viddi, "invoke_vidd": invoke_vidd, "invoke_iiii": invoke_iiii, "invoke_diii": invoke_diii, "invoke_di": invoke_di, "invoke_iid": invoke_iid, "invoke_iii": invoke_iii, "invoke_viiddi": invoke_viiddi, "invoke_viiiiii": invoke_viiiiii, "invoke_dii": invoke_dii, "invoke_i": invoke_i, "invoke_iiiiii": invoke_iiiiii, "invoke_viiid": invoke_viiid, "invoke_viififi": invoke_viififi, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_viid": invoke_viid, "invoke_idd": invoke_idd, "invoke_viiii": invoke_viiii, "_pthread_cleanup_pop": _pthread_cleanup_pop, "_YGDisplayToString": _YGDisplayToString, "__nbind_finish": __nbind_finish, "__nbind_reference_external": __nbind_reference_external, "_removeAccessorPrefix": _removeAccessorPrefix, "_typeModule": _typeModule, "_YGFlexDirectionToString": _YGFlexDirectionToString, "_atexit": _atexit, "__decorate": __decorate, "_llvm_stackrestore": _llvm_stackrestore, "___assert_fail": ___assert_fail, "___cxa_allocate_exception": ___cxa_allocate_exception, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "__extends": __extends, "_YGOverflowToString": _YGOverflowToString, "__nbind_get_value_object": __nbind_get_value_object, "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing, "_fabsf": _fabsf, "_sbrk": _sbrk, "_YGJustifyToString": _YGJustifyToString, "__nbind_register_type": __nbind_register_type, "_YGWrapToString": _YGWrapToString, "_YGAlignToString": _YGAlignToString, "_emscripten_memcpy_big": _emscripten_memcpy_big, "___resumeException": ___resumeException, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_sysconf": _sysconf, "___setErrNo": ___setErrNo, "__nbind_register_class": __nbind_register_class, "_abort": _abort, "_nbind_value": _nbind_value, "_pthread_self": _pthread_self, "_llvm_stacksave": _llvm_stacksave, "__nbind_register_primitive": __nbind_register_primitive, "_YGPositionTypeToString": _YGPositionTypeToString, "___syscall140": ___syscall140, "___syscall54": ___syscall54, "_defineHidden": _defineHidden, "_emscripten_set_main_loop": _emscripten_set_main_loop, "__nbind_register_callback_signature": __nbind_register_callback_signature, "__nbind_register_function": __nbind_register_function, "__nbind_free_external": __nbind_free_external, "___cxa_atexit": ___cxa_atexit, "___cxa_throw": ___cxa_throw, "_YGEdgeToString": _YGEdgeToString, "___syscall6": ___syscall6, "_pthread_cleanup_push": _pthread_cleanup_push, "_time": _time, "_emscripten_asm_const_8": _emscripten_asm_const_8, "_emscripten_asm_const_7": _emscripten_asm_const_7, "_emscripten_asm_const_6": _emscripten_asm_const_6, "_emscripten_asm_const_5": _emscripten_asm_const_5, "_emscripten_asm_const_4": _emscripten_asm_const_4, "_emscripten_asm_const_3": _emscripten_asm_const_3, "___syscall146": ___syscall146, "__nbind_register_pool": __nbind_register_pool, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "___dso_handle": ___dso_handle }; // EMSCRIPTEN_START_ASM
  var asm = function (global, env, buffer) {
    "use asm";
    var a = new global.Int8Array(buffer);var b = new global.Int16Array(buffer);var c = new global.Int32Array(buffer);var d = new global.Uint8Array(buffer);var e = new global.Uint16Array(buffer);var f = new global.Uint32Array(buffer);var g = new global.Float32Array(buffer);var h = new global.Float64Array(buffer);var i = env.STACKTOP | 0;var j = env.STACK_MAX | 0;var k = env.tempDoublePtr | 0;var l = env.ABORT | 0;var m = env.cttz_i8 | 0;var n = env.___dso_handle | 0;var o = 0;var p = 0;var q = 0;var r = 0;var s = global.NaN,
        t = global.Infinity;var u = 0,
        v = 0,
        w = 0,
        x = 0,
        y = 0.0,
        z = 0,
        A = 0,
        B = 0,
        C = 0.0;var D = 0;var E = 0;var F = 0;var G = 0;var H = 0;var I = 0;var J = 0;var K = 0;var L = 0;var M = 0;var N = global.Math.floor;var O = global.Math.abs;var P = global.Math.sqrt;var Q = global.Math.pow;var R = global.Math.cos;var S = global.Math.sin;var T = global.Math.tan;var U = global.Math.acos;var V = global.Math.asin;var W = global.Math.atan;var X = global.Math.atan2;var Y = global.Math.exp;var Z = global.Math.log;var _ = global.Math.ceil;var $ = global.Math.imul;var aa = global.Math.min;var ba = global.Math.clz32;var ca = global.Math.fround;var da = env.abort;var ea = env.assert;var fa = env.invoke_viiiii;var ga = env.invoke_vid;var ha = env.invoke_fiff;var ia = env.invoke_vi;var ja = env.invoke_vii;var ka = env.invoke_ii;var la = env.invoke_viddi;var ma = env.invoke_vidd;var na = env.invoke_iiii;var oa = env.invoke_diii;var pa = env.invoke_di;var qa = env.invoke_iid;var ra = env.invoke_iii;var sa = env.invoke_viiddi;var ta = env.invoke_viiiiii;var ua = env.invoke_dii;var va = env.invoke_i;var wa = env.invoke_iiiiii;var xa = env.invoke_viiid;var ya = env.invoke_viififi;var za = env.invoke_viii;var Aa = env.invoke_v;var Ba = env.invoke_viid;var Ca = env.invoke_idd;var Da = env.invoke_viiii;var Ea = env._pthread_cleanup_pop;var Fa = env._YGDisplayToString;var Ga = env.__nbind_finish;var Ha = env.__nbind_reference_external;var Ia = env._removeAccessorPrefix;var Ja = env._typeModule;var Ka = env._YGFlexDirectionToString;var La = env._atexit;var Ma = env.__decorate;var Na = env._llvm_stackrestore;var Oa = env.___assert_fail;var Pa = env.___cxa_allocate_exception;var Qa = env.__ZSt18uncaught_exceptionv;var Ra = env.__extends;var Sa = env._YGOverflowToString;var Ta = env.__nbind_get_value_object;var Ua = env._emscripten_set_main_loop_timing;var Va = env._fabsf;var Wa = env._sbrk;var Xa = env._YGJustifyToString;var Ya = env.__nbind_register_type;var Za = env._YGWrapToString;var _a = env._YGAlignToString;var $a = env._emscripten_memcpy_big;var ab = env.___resumeException;var bb = env.___cxa_find_matching_catch;var cb = env._sysconf;var db = env.___setErrNo;var eb = env.__nbind_register_class;var fb = env._abort;var gb = env._nbind_value;var hb = env._pthread_self;var ib = env._llvm_stacksave;var jb = env.__nbind_register_primitive;var kb = env._YGPositionTypeToString;var lb = env.___syscall140;var mb = env.___syscall54;var nb = env._defineHidden;var ob = env._emscripten_set_main_loop;var pb = env.__nbind_register_callback_signature;var qb = env.__nbind_register_function;var rb = env.__nbind_free_external;var sb = env.___cxa_atexit;var tb = env.___cxa_throw;var ub = env._YGEdgeToString;var vb = env.___syscall6;var wb = env._pthread_cleanup_push;var xb = env._time;var yb = env._emscripten_asm_const_8;var zb = env._emscripten_asm_const_7;var Ab = env._emscripten_asm_const_6;var Bb = env._emscripten_asm_const_5;var Cb = env._emscripten_asm_const_4;var Db = env._emscripten_asm_const_3;var Eb = env.___syscall146;var Fb = env.__nbind_register_pool;var Gb = ca(0);const Hb = ca(0); // EMSCRIPTEN_START_FUNCS
    function re(a, b, d) {
      a = a | 0;b = b | 0;d = ca(d);var e = 0;a: do if ((b & -2 | 0) == 2) {
        do if (!(c[a + 176 >> 2] | 0)) {
          if (!(c[a + 184 >> 2] | 0)) {
            e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
          } else {
            e = a + 180 | 0;break;
          }
        } else e = a + 172 | 0; while (0);switch (c[e + 4 >> 2] | 0) {case 0:
            break a;case 2:
            {
              d = ca(ca(ca(g[e >> 2]) * d) / ca(100.0));return ca(d);
            }case 1:
            {
              d = ca(g[e >> 2]);return ca(d);
            }default:
            {
              d = ca(s);return ca(d);
            }}
      } while (0);e = c[1660 + (b << 2) >> 2] | 0;b: do if (!(c[a + 132 + (e << 3) + 4 >> 2] | 0)) {
        if (b >>> 0 < 2 ? (c[a + 192 >> 2] | 0) != 0 : 0) {
          e = a + 188 | 0;break;
        }switch (e | 0) {case 0:case 2:case 4:case 5:
            {
              if (c[a + 184 >> 2] | 0) {
                e = a + 180 | 0;break b;
              }break;
            }default:
            {}}e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;
      } else e = a + 132 + (e << 3) | 0; while (0);b = c[e + 4 >> 2] | 0;if (!b) {
        d = ca(0.0);return ca(d);
      }switch (b | 0) {case 2:
          {
            d = ca(ca(ca(g[e >> 2]) * d) / ca(100.0));return ca(d);
          }case 1:
          {
            d = ca(g[e >> 2]);return ca(d);
          }default:
          {
            d = ca(s);return ca(d);
          }}return ca(0);
    }function se(a, b) {
      a = a | 0;b = b | 0;var d = Hb;if (((b & -2 | 0) == 2 ? (c[a + 312 >> 2] | 0) != 0 : 0) ? (d = ca(g[a + 308 >> 2]), d >= ca(0.0)) : 0) return ca(d);d = ca(Vn(ca(g[(Ae(a + 276 | 0, c[1644 + (b << 2) >> 2] | 0, 1612) | 0) >> 2]), ca(0.0)));return ca(d);
    }function te(a, b) {
      a = a | 0;b = b | 0;var d = Hb;if (((b & -2 | 0) == 2 ? (c[a + 320 >> 2] | 0) != 0 : 0) ? (d = ca(g[a + 316 >> 2]), d >= ca(0.0)) : 0) return ca(d);d = ca(Vn(ca(g[(Ae(a + 276 | 0, c[1660 + (b << 2) >> 2] | 0, 1612) | 0) >> 2]), ca(0.0)));return ca(d);
    }function ue(a, b, d) {
      a = a | 0;b = b | 0;d = ca(d);var e = Hb,
          f = 0,
          h = Hb,
          i = 0;a: do if ((b & -2 | 0) == 2) {
        f = a + 236 | 0;i = c[a + 240 >> 2] | 0;switch (i | 0) {case 1:
            {
              h = ca(g[f >> 2]);e = h;break;
            }case 2:
            {
              h = ca(g[f >> 2]);e = ca(ca(h * d) / ca(100.0));break;
            }default:
            break a;}if (e >= ca(0.0)) switch (i | 0) {case 2:
            {
              d = ca(ca(h * d) / ca(100.0));return ca(d);
            }case 1:
            {
              d = h;return ca(d);
            }default:
            {
              d = ca(s);return ca(d);
            }}
      } while (0);f = c[1644 + (b << 2) >> 2] | 0;b: do if (!(c[a + 204 + (f << 3) + 4 >> 2] | 0)) {
        if (b >>> 0 < 2 ? (c[a + 264 >> 2] | 0) != 0 : 0) {
          f = a + 260 | 0;break;
        }switch (f | 0) {case 0:case 2:case 4:case 5:
            {
              if (c[a + 256 >> 2] | 0) {
                f = a + 252 | 0;break b;
              }break;
            }default:
            {}}f = (c[a + 272 >> 2] | 0) == 0 ? 1612 : a + 268 | 0;
      } else f = a + 204 + (f << 3) | 0; while (0);switch (c[f + 4 >> 2] | 0) {case 2:
          {
            e = ca(ca(ca(g[f >> 2]) * d) / ca(100.0));break;
          }case 1:
          {
            e = ca(g[f >> 2]);break;
          }default:
          e = ca(s);}d = ca(Vn(e, ca(0.0)));return ca(d);
    }function ve(a, b, d) {
      a = a | 0;b = b | 0;d = ca(d);var e = Hb,
          f = 0,
          h = Hb,
          i = 0;a: do if ((b & -2 | 0) == 2) {
        f = a + 244 | 0;i = c[a + 248 >> 2] | 0;switch (i | 0) {case 1:
            {
              h = ca(g[f >> 2]);e = h;break;
            }case 2:
            {
              h = ca(g[f >> 2]);e = ca(ca(h * d) / ca(100.0));break;
            }default:
            break a;}if (e >= ca(0.0)) switch (i | 0) {case 2:
            {
              d = ca(ca(h * d) / ca(100.0));return ca(d);
            }case 1:
            {
              d = h;return ca(d);
            }default:
            {
              d = ca(s);return ca(d);
            }}
      } while (0);f = c[1660 + (b << 2) >> 2] | 0;b: do if (!(c[a + 204 + (f << 3) + 4 >> 2] | 0)) {
        if (b >>> 0 < 2 ? (c[a + 264 >> 2] | 0) != 0 : 0) {
          f = a + 260 | 0;break;
        }switch (f | 0) {case 0:case 2:case 4:case 5:
            {
              if (c[a + 256 >> 2] | 0) {
                f = a + 252 | 0;break b;
              }break;
            }default:
            {}}f = (c[a + 272 >> 2] | 0) == 0 ? 1612 : a + 268 | 0;
      } else f = a + 204 + (f << 3) | 0; while (0);switch (c[f + 4 >> 2] | 0) {case 2:
          {
            e = ca(ca(ca(g[f >> 2]) * d) / ca(100.0));break;
          }case 1:
          {
            e = ca(g[f >> 2]);break;
          }default:
          e = ca(s);}d = ca(Vn(e, ca(0.0)));return ca(d);
    }function we(a, b, d, e) {
      a = a | 0;b = b | 0;d = ca(d);e = ca(e);var f = Hb;a: do if (b >>> 0 >= 2) {
        if ((b & -2 | 0) == 2) {
          b = a + 364 | 0;switch (c[a + 368 >> 2] | 0) {case 2:
              {
                f = ca(ca(ca(g[b >> 2]) * e) / ca(100.0));break;
              }case 1:
              {
                f = ca(g[b >> 2]);break;
              }default:
              f = ca(s);}b = a + 380 | 0;switch (c[a + 384 >> 2] | 0) {case 2:
              {
                e = ca(ca(ca(g[b >> 2]) * e) / ca(100.0));break a;
              }case 1:
              {
                e = ca(g[b >> 2]);break a;
              }default:
              {
                e = ca(s);break a;
              }}
        } else {
          e = ca(s);f = ca(s);
        }
      } else {
        b = a + 372 | 0;switch (c[a + 376 >> 2] | 0) {case 2:
            {
              f = ca(ca(ca(g[b >> 2]) * e) / ca(100.0));break;
            }case 1:
            {
              f = ca(g[b >> 2]);break;
            }default:
            f = ca(s);}b = a + 388 | 0;switch (c[a + 392 >> 2] | 0) {case 2:
            {
              e = ca(ca(ca(g[b >> 2]) * e) / ca(100.0));break a;
            }case 1:
            {
              e = ca(g[b >> 2]);break a;
            }default:
            {
              e = ca(s);break a;
            }}
      } while (0);a = e < d & (e >= ca(0.0) & ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041);d = a ? e : d;a = f >= ca(0.0) & ((g[k >> 2] = f, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & d < f;return ca(a ? f : d);
    }function xe(b) {
      b = b | 0;var d = 0,
          e = 0;d = b + 400 | 0;g[b + 920 >> 2] = ca(0.0);g[b + 916 >> 2] = ca(0.0);c[d >> 2] = 0;c[d + 4 >> 2] = 0;c[d + 8 >> 2] = 0;c[d + 12 >> 2] = 0;c[d + 16 >> 2] = 0;c[d + 20 >> 2] = 0;c[b + 928 >> 2] = 1;c[b + 924 >> 2] = 1;g[b + 932 >> 2] = ca(0.0);g[b + 936 >> 2] = ca(0.0);a[b + 977 >> 0] = 1;d = b + 948 | 0;b = qc(c[d >> 2] | 0) | 0;if (!b) return;else e = 0;do {
        xe(uc(c[d >> 2] | 0, e) | 0);e = e + 1 | 0;
      } while ((e | 0) != (b | 0));return;
    }function ye(a, b, d, e, f, h) {
      a = a | 0;b = b | 0;d = ca(d);e = ca(e);f = f | 0;h = h | 0;var i = Hb,
          j = 0,
          l = 0,
          m = 0,
          n = 0;n = c[1692 + (b << 2) >> 2] | 0;j = a + 380 + (n << 3) | 0;switch (c[a + 380 + (n << 3) + 4 >> 2] | 0) {case 2:
          {
            i = ca(ca(ca(g[j >> 2]) * d) / ca(100.0));break;
          }case 1:
          {
            i = ca(g[j >> 2]);break;
          }default:
          i = ca(s);}a: do if ((b & -2 | 0) == 2 ? (l = c[a + 96 >> 2] | 0, (l | 0) != 0) : 0) {
        j = a + 92 | 0;if ((l | 0) == 3) d = ca(0.0);else switch (l | 0) {case 2:
            {
              d = ca(ca(ca(g[j >> 2]) * e) / ca(100.0));break a;
            }case 1:
            {
              d = ca(g[j >> 2]);break a;
            }default:
            {
              d = ca(s);break a;
            }}
      } else m = 10; while (0);b: do if ((m | 0) == 10) {
        j = c[1644 + (b << 2) >> 2] | 0;c: do if (!(c[a + 60 + (j << 3) + 4 >> 2] | 0)) {
          if (b >>> 0 < 2 ? (c[a + 120 >> 2] | 0) != 0 : 0) {
            j = a + 116 | 0;break;
          }switch (j | 0) {case 0:case 2:case 4:case 5:
              {
                if (c[a + 112 >> 2] | 0) {
                  j = a + 108 | 0;break c;
                }break;
              }default:
              {}}j = (c[a + 128 >> 2] | 0) == 0 ? 1612 : a + 124 | 0;
        } else j = a + 60 + (j << 3) | 0; while (0);l = c[j + 4 >> 2] | 0;if ((l | 0) == 3) d = ca(0.0);else switch (l | 0) {case 2:
            {
              d = ca(ca(ca(g[j >> 2]) * e) / ca(100.0));break b;
            }case 1:
            {
              d = ca(g[j >> 2]);break b;
            }default:
            {
              d = ca(s);break b;
            }}
      } while (0);i = ca(i + ca(d + ca(ke(a, b, e))));switch (c[f >> 2] | 0) {case 2:case 1:
          {
            d = ca(g[h >> 2]);g[h >> 2] = ((g[k >> 2] = i, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 | d < i ? d : i;return;
          }case 0:
          {
            if (((g[k >> 2] = i, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) return;c[f >> 2] = 2;g[h >> 2] = i;return;
          }default:
          return;}
    }function ze(a) {
      a = a | 0;var b = 0,
          d = Hb,
          e = 0,
          f = 0,
          h = 0,
          j = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = Hb;p = i;i = i + 16 | 0;e = p;b = c[a + 960 >> 2] | 0;if (b) {
        q = ca(g[a + 908 >> 2]);d = ca(g[a + 912 >> 2]);d = ca(Kb[b & 0](a, q, d));if (((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041) {
          q = d;i = p;return ca(q);
        }c[e >> 2] = 6660;fe(a, 5, 5672, e);q = d;i = p;return ca(q);
      }h = a + 948 | 0;j = qc(c[h >> 2] | 0) | 0;if (j) {
        l = a + 16 | 0;m = a + 4 | 0;f = 0;n = 0;while (1) {
          b = uc(c[h >> 2] | 0, n) | 0;if (c[b + 940 >> 2] | 0) {
            b = f;break;
          }if ((c[b + 24 >> 2] | 0) == 1) b = f;else {
            e = c[b + 20 >> 2] | 0;if (!e) e = c[l >> 2] | 0;if ((e | 0) == 5 ? (c[m >> 2] | 0) >>> 0 >= 2 : 0) {
              o = 16;break;
            }b = (f | 0) == 0 ? b : f;
          }n = n + 1 | 0;if (n >>> 0 >= j >>> 0) break;else f = b;
        }if ((o | 0) == 16) {
          d = ca(ze(b));o = b + 404 | 0;q = ca(g[o >> 2]);q = ca(d + q);i = p;return ca(q);
        }if (b) {
          o = b;d = ca(ze(o));o = o + 404 | 0;q = ca(g[o >> 2]);q = ca(d + q);i = p;return ca(q);
        }
      }q = ca(g[a + 912 >> 2]);i = p;return ca(q);
    }function Ae(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;if (c[a + (b << 3) + 4 >> 2] | 0) {
        a = a + (b << 3) | 0;return a | 0;
      }if ((b & -3 | 0) == 1 ? (c[a + 60 >> 2] | 0) != 0 : 0) {
        a = a + 56 | 0;return a | 0;
      }switch (b | 0) {case 0:case 2:case 4:case 5:
          {
            if (c[a + 52 >> 2] | 0) {
              a = a + 48 | 0;return a | 0;
            }break;
          }default:
          {}}if (!(c[a + 68 >> 2] | 0)) {
        a = (b & -2 | 0) == 4 ? 1676 : d;return a | 0;
      } else {
        a = a + 64 | 0;return a | 0;
      }return 0;
    }function Be(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          j = 0,
          k = 0,
          l = 0.0;k = i;i = i + 32 | 0;j = k + 8 | 0;f = k;e = c[d + 4 >> 2] | 0;switch (e | 0) {case 3:
          {
            c[f >> 2] = b;fe(a, 3, 7189, f);i = k;return;
          }case 0:
          {
            i = k;return;
          }default:
          {
            l = +ca(g[d >> 2]);c[j >> 2] = b;h[j + 8 >> 3] = l;c[j + 16 >> 2] = (e | 0) == 1 ? 7200 : 7203;fe(a, 3, 7205, j);i = k;return;
          }}
    }function Ce(b, e, f) {
      b = b | 0;e = e | 0;f = f | 0;var h = 0,
          j = Hb,
          l = 0,
          m = Hb,
          n = 0,
          o = 0,
          p = 0,
          q = 0;p = i;i = i + 48 | 0;o = p;n = p + 8 | 0;h = f + 8 | 0;a[k >> 0] = a[h >> 0];a[k + 1 >> 0] = a[h + 1 >> 0];a[k + 2 >> 0] = a[h + 2 >> 0];a[k + 3 >> 0] = a[h + 3 >> 0];j = ca(g[k >> 2]);h = f + 12 | 0;h = d[h >> 0] | d[h + 1 >> 0] << 8 | d[h + 2 >> 0] << 16 | d[h + 3 >> 0] << 24;a[k >> 0] = a[f >> 0];a[k + 1 >> 0] = a[f + 1 >> 0];a[k + 2 >> 0] = a[f + 2 >> 0];a[k + 3 >> 0] = a[f + 3 >> 0];m = ca(g[k >> 2]);l = f + 4 | 0;do if ((d[l >> 0] | d[l + 1 >> 0] << 8 | d[l + 2 >> 0] << 16 | d[l + 3 >> 0] << 24 | 0) == (h | 0)) {
        l = (h | 0) == 0;if (!l ? !(ca(O(ca(m - j))) < ca(.0000999999974)) : 0) break;q = f + 16 | 0;a[k >> 0] = a[q >> 0];a[k + 1 >> 0] = a[q + 1 >> 0];a[k + 2 >> 0] = a[q + 2 >> 0];a[k + 3 >> 0] = a[q + 3 >> 0];j = ca(g[k >> 2]);q = f + 20 | 0;if ((h | 0) == (d[q >> 0] | d[q + 1 >> 0] << 8 | d[q + 2 >> 0] << 16 | d[q + 3 >> 0] << 24 | 0)) {
          if (l) {
            q = f + 28 | 0;if (d[q >> 0] | d[q + 1 >> 0] << 8 | d[q + 2 >> 0] << 16 | d[q + 3 >> 0] << 24) break;
          } else {
            if (!(ca(O(ca(m - j))) < ca(.0000999999974))) break;q = f + 28 | 0;if ((h | 0) != (d[q >> 0] | d[q + 1 >> 0] << 8 | d[q + 2 >> 0] << 16 | d[q + 3 >> 0] << 24 | 0)) break;q = f + 24 | 0;a[k >> 0] = a[q >> 0];a[k + 1 >> 0] = a[q + 1 >> 0];a[k + 2 >> 0] = a[q + 2 >> 0];a[k + 3 >> 0] = a[q + 3 >> 0];if (!(ca(O(ca(m - ca(g[k >> 2])))) < ca(.0000999999974))) break;
          }if (((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040 ? ca(O(ca(m))) < ca(.0000999999974) : 0) {
            i = p;return;
          }Be(b, e, f);i = p;return;
        }
      } while (0);l = 0;do {
        h = ub(l | 0) | 0;c[o >> 2] = e;c[o + 4 >> 2] = h;oo(n, 30, 7183, o) | 0;h = f + (l << 3) | 0;j = ca(g[h >> 2]);if (!(((g[k >> 2] = j, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040 ? ca(O(ca(j))) < ca(.0000999999974) : 0)) Be(b, n, h);l = l + 1 | 0;
      } while ((l | 0) != 9);i = p;return;
    }function De() {
      var a = 0;a = un(4) | 0;c[a >> 2] = Dc() | 0;return a | 0;
    }function Ee(a) {
      a = a | 0;if (a) {
        Fc(c[a >> 2] | 0);wn(a);
      }return;
    }function Fe(a) {
      a = a | 0;Fc(c[a >> 2] | 0);return;
    }function Ge(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;ge(c[a >> 2] | 0, b, d);return;
    }function He(a, b) {
      a = a | 0;b = b | 0;return he(c[a >> 2] | 0, b) | 0;
    }function Ie() {
      var a = 0,
          b = 0;a = un(8) | 0;b = wc() | 0;c[a >> 2] = b;c[a + 4 >> 2] = 0;Oc(b, a);return a | 0;
    }function Je(a) {
      a = a | 0;var b = 0;b = un(8) | 0;Le(b, a);return b | 0;
    }function Ke(a) {
      a = a | 0;if (a) {
        Me(a);wn(a);
      }return;
    }function Le(a, b) {
      a = a | 0;b = b | 0;if (!b) b = wc() | 0;else b = vc(c[b >> 2] | 0) | 0;c[a >> 2] = b;c[a + 4 >> 2] = 0;Oc(b, a);return;
    }function Me(a) {
      a = a | 0;var b = 0;xc(c[a >> 2] | 0);b = a + 4 | 0;a = c[b >> 2] | 0;c[b >> 2] = 0;if (a) {
        b = c[a >> 2] | 0;if (b) rb(b | 0);wn(a);
      }return;
    }function Ne(a) {
      a = a | 0;var b = 0,
          d = 0;d = a + 4 | 0;b = c[d >> 2] | 0;c[d >> 2] = 0;if (b) {
        d = c[b >> 2] | 0;if (d) rb(d | 0);wn(b);
      }Bc(c[a >> 2] | 0);return;
    }function Oe(a, b) {
      a = a | 0;b = b | 0;Lc(c[a >> 2] | 0, c[b >> 2] | 0);return;
    }function Pe(a, b) {
      a = a | 0;b = b | 0;_c(c[a >> 2] | 0, b);return;
    }function Qe(a, b, d) {
      a = a | 0;b = b | 0;d = +d;md(c[a >> 2] | 0, b, ca(d));return;
    }function Re(a, b, d) {
      a = a | 0;b = b | 0;d = +d;nd(c[a >> 2] | 0, b, ca(d));return;
    }function Se(a, b) {
      a = a | 0;b = b | 0;Uc(c[a >> 2] | 0, b);return;
    }function Te(a, b) {
      a = a | 0;b = b | 0;Wc(c[a >> 2] | 0, b);return;
    }function Ue(a, b) {
      a = a | 0;b = b | 0;Yc(c[a >> 2] | 0, b);return;
    }function Ve(a, b) {
      a = a | 0;b = b | 0;Qc(c[a >> 2] | 0, b);return;
    }function We(a, b) {
      a = a | 0;b = b | 0;ad(c[a >> 2] | 0, b);return;
    }function Xe(a, b) {
      a = a | 0;b = b | 0;Sc(c[a >> 2] | 0, b);return;
    }function Ye(a, b, d) {
      a = a | 0;b = b | 0;d = +d;pd(c[a >> 2] | 0, b, ca(d));return;
    }function Ze(a, b, d) {
      a = a | 0;b = b | 0;d = +d;qd(c[a >> 2] | 0, b, ca(d));return;
    }function _e(a, b) {
      a = a | 0;b = b | 0;sd(c[a >> 2] | 0, b);return;
    }function $e(a, b) {
      a = a | 0;b = b | 0;cd(c[a >> 2] | 0, b);return;
    }function af(a, b) {
      a = a | 0;b = b | 0;ed(c[a >> 2] | 0, b);return;
    }function bf(a, b) {
      a = a | 0;b = +b;gd(c[a >> 2] | 0, ca(b));return;
    }function cf(a, b) {
      a = a | 0;b = +b;jd(c[a >> 2] | 0, ca(b));return;
    }function df(a, b) {
      a = a | 0;b = +b;kd(c[a >> 2] | 0, ca(b));return;
    }function ef(a, b) {
      a = a | 0;b = +b;hd(c[a >> 2] | 0, ca(b));return;
    }function ff(a, b) {
      a = a | 0;b = +b;id(c[a >> 2] | 0, ca(b));return;
    }function gf(a, b) {
      a = a | 0;b = +b;yd(c[a >> 2] | 0, ca(b));return;
    }function hf(a, b) {
      a = a | 0;b = +b;zd(c[a >> 2] | 0, ca(b));return;
    }function jf(a) {
      a = a | 0;Ad(c[a >> 2] | 0);return;
    }function kf(a, b) {
      a = a | 0;b = +b;Cd(c[a >> 2] | 0, ca(b));return;
    }function lf(a, b) {
      a = a | 0;b = +b;Dd(c[a >> 2] | 0, ca(b));return;
    }function mf(a) {
      a = a | 0;Ed(c[a >> 2] | 0);return;
    }function nf(a, b) {
      a = a | 0;b = +b;Gd(c[a >> 2] | 0, ca(b));return;
    }function of(a, b) {
      a = a | 0;b = +b;Hd(c[a >> 2] | 0, ca(b));return;
    }function pf(a, b) {
      a = a | 0;b = +b;Jd(c[a >> 2] | 0, ca(b));return;
    }function qf(a, b) {
      a = a | 0;b = +b;Kd(c[a >> 2] | 0, ca(b));return;
    }function rf(a, b) {
      a = a | 0;b = +b;Md(c[a >> 2] | 0, ca(b));return;
    }function sf(a, b) {
      a = a | 0;b = +b;Nd(c[a >> 2] | 0, ca(b));return;
    }function tf(a, b) {
      a = a | 0;b = +b;Pd(c[a >> 2] | 0, ca(b));return;
    }function uf(a, b) {
      a = a | 0;b = +b;Qd(c[a >> 2] | 0, ca(b));return;
    }function vf(a, b) {
      a = a | 0;b = +b;Sd(c[a >> 2] | 0, ca(b));return;
    }function wf(a, b, d) {
      a = a | 0;b = b | 0;d = +d;wd(c[a >> 2] | 0, b, ca(d));return;
    }function xf(a, b, d) {
      a = a | 0;b = b | 0;d = +d;td(c[a >> 2] | 0, b, ca(d));return;
    }function yf(a, b, d) {
      a = a | 0;b = b | 0;d = +d;ud(c[a >> 2] | 0, b, ca(d));return;
    }function zf(a) {
      a = a | 0;return $c(c[a >> 2] | 0) | 0;
    }function Af(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0.0,
          j = 0;e = i;i = i + 16 | 0;j = e;od(j, c[b >> 2] | 0, d);f = +ca(g[j >> 2]);c[a >> 2] = c[j + 4 >> 2];h[a + 8 >> 3] = f;i = e;return;
    }function Bf(a) {
      a = a | 0;return Vc(c[a >> 2] | 0) | 0;
    }function Cf(a) {
      a = a | 0;return Xc(c[a >> 2] | 0) | 0;
    }function Df(a) {
      a = a | 0;return Zc(c[a >> 2] | 0) | 0;
    }function Ef(a) {
      a = a | 0;return Rc(c[a >> 2] | 0) | 0;
    }function Ff(a) {
      a = a | 0;return bd(c[a >> 2] | 0) | 0;
    }function Gf(a) {
      a = a | 0;return Tc(c[a >> 2] | 0) | 0;
    }function Hf(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0.0,
          j = 0;e = i;i = i + 16 | 0;j = e;rd(j, c[b >> 2] | 0, d);f = +ca(g[j >> 2]);c[a >> 2] = c[j + 4 >> 2];h[a + 8 >> 3] = f;i = e;return;
    }function If(a) {
      a = a | 0;return dd(c[a >> 2] | 0) | 0;
    }function Jf(a) {
      a = a | 0;return fd(c[a >> 2] | 0) | 0;
    }function Kf(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;ld(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Lf(a) {
      a = a | 0;return + +ca(Mc(c[a >> 2] | 0));
    }function Mf(a) {
      a = a | 0;return + +ca(Nc(c[a >> 2] | 0));
    }function Nf(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;Bd(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Of(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;Fd(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Pf(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;Id(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Qf(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;Ld(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Rf(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;Od(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Sf(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0.0,
          f = 0;d = i;i = i + 16 | 0;f = d;Rd(f, c[b >> 2] | 0);e = +ca(g[f >> 2]);c[a >> 2] = c[f + 4 >> 2];h[a + 8 >> 3] = e;i = d;return;
    }function Tf(a) {
      a = a | 0;return + +ca(Td(c[a >> 2] | 0));
    }function Uf(a, b) {
      a = a | 0;b = b | 0;return + +ca(xd(c[a >> 2] | 0, b));
    }function Vf(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0.0,
          j = 0;e = i;i = i + 16 | 0;j = e;vd(j, c[b >> 2] | 0, d);f = +ca(g[j >> 2]);c[a >> 2] = c[j + 4 >> 2];h[a + 8 >> 3] = f;i = e;return;
    }function Wf(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;Hc(c[a >> 2] | 0, c[b >> 2] | 0, d);return;
    }function Xf(a, b) {
      a = a | 0;b = b | 0;Ac(c[a >> 2] | 0, c[b >> 2] | 0);return;
    }function Yf(a) {
      a = a | 0;return yc(c[a >> 2] | 0) | 0;
    }function Zf(a) {
      a = a | 0;a = Ic(c[a >> 2] | 0) | 0;if (!a) a = 0;else a = Pc(a) | 0;return a | 0;
    }function _f(a, b) {
      a = a | 0;b = b | 0;b = zc(c[a >> 2] | 0, b) | 0;if (!b) b = 0;else b = Pc(b) | 0;return b | 0;
    }function $f(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = un(4) | 0;d = c[b >> 2] | 0;c[e >> 2] = d;Ha(d | 0);d = a + 4 | 0;b = c[d >> 2] | 0;c[d >> 2] = e;if (b) {
        d = c[b >> 2] | 0;if (d) rb(d | 0);wn(b);
      }Gc(c[a >> 2] | 0, 1);return;
    }function ag(a) {
      a = a | 0;var b = 0,
          d = 0;d = a + 4 | 0;b = c[d >> 2] | 0;c[d >> 2] = 0;if (b) {
        d = c[b >> 2] | 0;if (d) rb(d | 0);wn(b);
      }Gc(c[a >> 2] | 0, 0);return;
    }function bg(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = +d;e = e | 0;f = +f;g = g | 0;var h = 0,
          j = 0;h = i;i = i + 16 | 0;j = h;b = c[b + 4 >> 2] | 0;im(j);qg(a, c[b >> 2] | 0, d, e, f, g);jm(j);i = h;return;
    }function cg(a) {
      a = a | 0;Jc(c[a >> 2] | 0);return;
    }function dg(a) {
      a = a | 0;return Kc(c[a >> 2] | 0) | 0;
    }function eg(a, b, d, e) {
      a = a | 0;b = +b;d = +d;e = e | 0;de(c[a >> 2] | 0, ca(b), ca(d), e);return;
    }function fg(a) {
      a = a | 0;return + +ca(Ud(c[a >> 2] | 0));
    }function gg(a) {
      a = a | 0;return + +ca(Wd(c[a >> 2] | 0));
    }function hg(a) {
      a = a | 0;return + +ca(Vd(c[a >> 2] | 0));
    }function ig(a) {
      a = a | 0;return + +ca(Xd(c[a >> 2] | 0));
    }function jg(a) {
      a = a | 0;return + +ca(Yd(c[a >> 2] | 0));
    }function kg(a) {
      a = a | 0;return + +ca(Zd(c[a >> 2] | 0));
    }function lg(a, b) {
      a = a | 0;b = b | 0;h[a >> 3] = +ca(Ud(c[b >> 2] | 0));h[a + 8 >> 3] = +ca(Wd(c[b >> 2] | 0));h[a + 16 >> 3] = +ca(Vd(c[b >> 2] | 0));h[a + 24 >> 3] = +ca(Xd(c[b >> 2] | 0));h[a + 32 >> 3] = +ca(Yd(c[b >> 2] | 0));h[a + 40 >> 3] = +ca(Zd(c[b >> 2] | 0));return;
    }function mg(a, b) {
      a = a | 0;b = b | 0;return + +ca(_d(c[a >> 2] | 0, b));
    }function ng(a, b) {
      a = a | 0;b = b | 0;return + +ca($d(c[a >> 2] | 0, b));
    }function og(a, b) {
      a = a | 0;b = b | 0;return + +ca(ae(c[a >> 2] | 0, b));
    }function pg(a, b, c, d, e, f) {
      a = a | 0;b = b | 0;c = ca(c);d = d | 0;e = ca(e);f = f | 0;var j = 0,
          k = 0;j = i;i = i + 16 | 0;k = j;bg(k, Pc(b) | 0, +c, d, +e, f);g[a >> 2] = ca(+h[k >> 3]);g[a + 4 >> 2] = ca(+h[k + 8 >> 3]);i = j;return;
    }function qg(b, d, e, f, g, h) {
      b = b | 0;d = d | 0;e = +e;f = f | 0;g = +g;h = h | 0;var j = 0,
          k = 0;k = i;i = i + 32 | 0;j = k;rg() | 0;f = Ab(0, c[429] | 0, d | 0, +e, f | 0, +g, h | 0) | 0;if (!(f & 1)) {
        j = f;c[b >> 2] = c[j >> 2];c[b + 4 >> 2] = c[j + 4 >> 2];c[b + 8 >> 2] = c[j + 8 >> 2];c[b + 12 >> 2] = c[j + 12 >> 2];
      } else {
        c[j >> 2] = 0;c[j + 8 >> 2] = 0;d = j + 24 | 0;a[d >> 0] = 0;Ta(f | 0, j | 0) | 0;j = j + 8 | 0;c[b >> 2] = c[j >> 2];c[b + 4 >> 2] = c[j + 4 >> 2];c[b + 8 >> 2] = c[j + 8 >> 2];c[b + 12 >> 2] = c[j + 12 >> 2];a[d >> 0] = 0;
      }i = k;return;
    }function rg() {
      var b = 0;if (!(a[8] | 0)) {
        c[427] = 1720;c[428] = 4;c[429] = pb(1720, 5) | 0;b = 8;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 1708;
    }function sg() {
      return Cc() | 0;
    }function tg() {
      var a = 0;a = ug(1, 0) | 0;vg() | 0;il(7219, 1, a, 1740, 0);wg(1776);xg(1780);yg(1784);zg(1788);Ag(1792);return;
    }function ug(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;vg() | 0;b = b | 4;c[f >> 2] = b;d = c[442] | 0;if (d >>> 0 < (c[443] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[442] = b;
      } else {
        bl(1764, e, f);b = c[442] | 0;
      }i = g;return (b - (c[441] | 0) >> 3) + -1 | 0;
    }function vg() {
      var b = 0;if (!(a[336] | 0)) {
        c[435] = 1;c[436] = 4;c[437] = 1832;c[438] = 2224;c[439] = 0;c[441] = 0;c[442] = 0;c[443] = 0;sb(25, 1740, n | 0) | 0;b = 336;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[435] | 0)) {
        c[435] = 0;c[436] = 0;c[437] = 0;c[438] = 0;c[439] = 0;c[440] = 0;c[441] = 0;c[442] = 0;c[435] = 1;c[436] = 4;c[437] = 1832;c[438] = 2224;c[439] = 0;c[441] = 0;c[442] = 0;c[443] = 0;
      }return 1740;
    }function wg(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0;Kk(a, 8512);d = c[a >> 2] | 0;Lk() | 0;d = d + 28 | 0;b = c[d >> 2] | 0;f = un(24) | 0;c[f + 4 >> 2] = 0;c[f + 8 >> 2] = 0;c[f + 12 >> 2] = 0;c[f + 16 >> 2] = 3412;c[f + 20 >> 2] = 0;e = b;c[f >> 2] = c[e >> 2];c[b >> 2] = f;c[d >> 2] = c[e >> 2];a = c[a >> 2] | 0;Mk() | 0;a = a + 28 | 0;d = c[a >> 2] | 0;e = un(24) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e + 12 >> 2] = 0;c[e + 16 >> 2] = 3448;c[e + 20 >> 2] = 0;b = d;c[e >> 2] = c[b >> 2];c[d >> 2] = e;c[a >> 2] = c[b >> 2];return;
    }function xg(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;Dk(a, 8505);a = c[a >> 2] | 0;Ek() | 0;a = a + 28 | 0;d = c[a >> 2] | 0;e = un(24) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e + 12 >> 2] = 0;c[e + 16 >> 2] = 3364;c[e + 20 >> 2] = 0;b = d;c[e >> 2] = c[b >> 2];c[d >> 2] = e;c[a >> 2] = c[b >> 2];return;
    }function yg(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0;rk(a, 8499);d = c[a >> 2] | 0;sk() | 0;d = d + 28 | 0;b = c[d >> 2] | 0;f = un(24) | 0;c[f + 4 >> 2] = 0;c[f + 8 >> 2] = 0;c[f + 12 >> 2] = 0;c[f + 16 >> 2] = 3256;c[f + 20 >> 2] = 0;e = b;c[f >> 2] = c[e >> 2];c[b >> 2] = f;c[d >> 2] = c[e >> 2];a = c[a >> 2] | 0;tk() | 0;a = a + 28 | 0;d = c[a >> 2] | 0;e = un(24) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e + 12 >> 2] = 0;c[e + 16 >> 2] = 3292;c[e + 20 >> 2] = 0;b = d;c[e >> 2] = c[b >> 2];c[d >> 2] = e;c[a >> 2] = c[b >> 2];return;
    }function zg(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;b = i;i = i + 16 | 0;d = b + 8 | 0;e = b;Oj(a, 8426);Pj(a, 8433, 2, 0);Qj(a, 7272, 26, 0);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Rj(a, 8440, d, 0);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Sj(a, 8470, d, 1);i = b;return;
    }function Ag(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;b = i;i = i + 16 | 0;d = b + 8 | 0;e = b;Bg(a, 7236);Cg(a, 7241, 3, 0);Dg(a, 7255, 5, 0);Eg(a, 7272, 27, 0);c[e >> 2] = 28;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Fg(a, 7280, d, 0);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Gg(a, 7286, d, 0);c[e >> 2] = 2;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7296, d, 0);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7312, d, 0);c[e >> 2] = 2;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7324, d, 0);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7343, d, 0);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7359, d, 0);c[e >> 2] = 5;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7373, d, 0);c[e >> 2] = 6;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7386, d, 0);c[e >> 2] = 7;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7403, d, 0);c[e >> 2] = 8;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7415, d, 0);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7433, d, 0);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7443, d, 0);c[e >> 2] = 9;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7460, d, 0);c[e >> 2] = 10;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7474, d, 0);c[e >> 2] = 11;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Hg(a, 7486, d, 0);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7497, d, 0);c[e >> 2] = 2;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7505, d, 0);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7518, d, 0);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7538, d, 0);c[e >> 2] = 5;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7550, d, 0);c[e >> 2] = 6;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7564, d, 0);c[e >> 2] = 7;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7573, d, 0);c[e >> 2] = 29;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Fg(a, 7589, d, 0);c[e >> 2] = 8;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7602, d, 0);c[e >> 2] = 9;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7612, d, 0);c[e >> 2] = 30;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Fg(a, 7629, d, 0);c[e >> 2] = 10;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7643, d, 0);c[e >> 2] = 11;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7655, d, 0);c[e >> 2] = 12;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7674, d, 0);c[e >> 2] = 13;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7687, d, 0);c[e >> 2] = 14;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7707, d, 0);c[e >> 2] = 15;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7719, d, 0);c[e >> 2] = 16;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7738, d, 0);c[e >> 2] = 17;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7751, d, 0);c[e >> 2] = 18;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Jg(a, 7771, d, 0);c[e >> 2] = 5;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7786, d, 0);c[e >> 2] = 6;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7796, d, 0);c[e >> 2] = 7;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ig(a, 7807, d, 0);c[e >> 2] = 6;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7825, d, 1);c[e >> 2] = 2;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Lg(a, 7841, d, 1);c[e >> 2] = 7;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7853, d, 1);c[e >> 2] = 8;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7869, d, 1);c[e >> 2] = 9;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7883, d, 1);c[e >> 2] = 10;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7896, d, 1);c[e >> 2] = 11;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7913, d, 1);c[e >> 2] = 12;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 7925, d, 1);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Lg(a, 7943, d, 1);c[e >> 2] = 12;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 7953, d, 1);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 7966, d, 1);c[e >> 2] = 2;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 7978, d, 1);c[e >> 2] = 13;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 7992, d, 1);c[e >> 2] = 14;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 8001, d, 1);c[e >> 2] = 15;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 8011, d, 1);c[e >> 2] = 16;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 8023, d, 1);c[e >> 2] = 17;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 8036, d, 1);c[e >> 2] = 18;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Mg(a, 8048, d, 1);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8061, d, 1);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Og(a, 8076, d, 1);c[e >> 2] = 13;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 8086, d, 1);c[e >> 2] = 14;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Kg(a, 8098, d, 1);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Lg(a, 8109, d, 1);c[e >> 2] = 5;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Pg(a, 8120, d, 0);c[e >> 2] = 19;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Qg(a, 8132, d, 0);c[e >> 2] = 15;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Rg(a, 8144, d, 1);c[e >> 2] = 16;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Sg(a, 8158, d, 0);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Tg(a, 8168, d, 0);c[e >> 2] = 20;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ug(a, 8177, d, 0);c[e >> 2] = 31;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Fg(a, 8192, d, 0);c[e >> 2] = 32;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Fg(a, 8209, d, 0);c[e >> 2] = 17;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Vg(a, 8219, d, 1);c[e >> 2] = 1;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Wg(a, 8227, d, 0);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8243, d, 1);c[e >> 2] = 5;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8259, d, 1);c[e >> 2] = 6;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8276, d, 1);c[e >> 2] = 7;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8291, d, 1);c[e >> 2] = 8;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8309, d, 1);c[e >> 2] = 9;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Ng(a, 8326, d, 1);c[e >> 2] = 21;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Xg(a, 8344, d, 1);c[e >> 2] = 2;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Og(a, 8362, d, 1);c[e >> 2] = 3;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Og(a, 8380, d, 1);c[e >> 2] = 4;c[e + 4 >> 2] = 0;c[d >> 2] = c[e >> 2];c[d + 4 >> 2] = c[e + 4 >> 2];Og(a, 8398, d, 1);i = b;return;
    }function Bg(b, d) {
      b = b | 0;d = d | 0;Mj() | 0;c[b >> 2] = 2984;c[746] = 8423;c[747] = 2140;c[749] = d;if (!(a[224] | 0)) {
        c[757] = 0;c[758] = 0;d = 224;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[748] = 3028;c[754] = 3;hl(c[b >> 2] | 0);return;
    }function Cg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;Gj() | 0;h = Hj(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2948;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Dg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;Aj() | 0;h = Bj(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2896;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Eg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;uj() | 0;h = vj(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2860;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Fg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;oj() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = pj(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2820;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Gg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;ij() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = jj(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2760;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Hg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;cj() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = dj(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2716;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Ig(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Yi() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Zi(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2668;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Jg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Si() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Ti(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2624;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Kg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Mi() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Ni(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2584;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Lg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Fi() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Gi(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2540;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Mg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;si() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = ti(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2404;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Ng(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;mi() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = ni(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2364;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Og(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;gi() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = hi(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2320;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Pg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;ai() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = bi(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2272;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Qg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Wh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Xh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2228;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Rg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Qh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Rh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2188;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Sg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Kh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Lh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2148;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Tg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Eh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Fh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2096;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Ug(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;xh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = yh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2044;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Vg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;rh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = sh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 2004;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Wg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;lh() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = mh(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 1952;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Xg(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Yg() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Zg(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 1796;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Yg() {
      var b = 0;if (!(a[16] | 0)) {
        c[449] = 2;c[450] = 5;c[451] = 1832;c[452] = 1836;c[453] = 0;c[455] = 0;c[456] = 0;c[457] = 0;sb(33, 1796, n | 0) | 0;b = 16;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[449] | 0)) {
        c[449] = 0;c[450] = 0;c[451] = 0;c[452] = 0;c[453] = 0;c[454] = 0;c[455] = 0;c[456] = 0;c[449] = 2;c[450] = 5;c[451] = 1832;c[452] = 1836;c[453] = 0;c[455] = 0;c[456] = 0;c[457] = 0;
      }return 1796;
    }function Zg(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Yg() | 0;a = b | 4;c[f >> 2] = a;b = c[456] | 0;if (b >>> 0 < (c[457] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[456] = a;
      } else {
        _g(1820, e, f);a = c[456] | 0;
      }i = h;return ((a - (c[455] | 0) | 0) / 12 | 0) + -1 | 0;
    }function _g(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function $g(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;d = i;i = i + 16 | 0;e = d + 8 | 0;f = d;Yg() | 0;g = (c[455] | 0) + (a * 12 | 0) | 0;a = c[g + 4 >> 2] | 0;c[f >> 2] = c[g >> 2];c[f + 4 >> 2] = a;c[e >> 2] = c[f >> 2];c[e + 4 >> 2] = c[f + 4 >> 2];b = ch(b, e) | 0;i = d;return b | 0;
    }function ah(a) {
      a = a | 0;bh(a + 24 | 0);return;
    }function bh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function ch(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;f = i;i = i + 48 | 0;e = f;d = c[b >> 2] | 0;g = c[b + 4 >> 2] | 0;b = a + (g >> 1) | 0;if (g & 1) d = c[(c[b >> 2] | 0) + d >> 2] | 0;Mb[d & 31](e, b);g = dh(e) | 0;i = f;return g | 0;
    }function dh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;d = h;eh() | 0;b = c[469] | 0;if (!b) {
        e = cm(8) | 0;b = e;f = un(48) | 0;g = f;d = a;a = g + 48 | 0;do {
          c[g >> 2] = c[d >> 2];g = g + 4 | 0;d = d + 4 | 0;
        } while ((g | 0) < (a | 0));a = b + 4 | 0;c[a >> 2] = f;g = un(8) | 0;a = c[a >> 2] | 0;c[g >> 2] = a;f = un(16) | 0;c[f + 4 >> 2] = 0;c[f + 8 >> 2] = 0;c[f >> 2] = 1892;c[f + 12 >> 2] = a;c[g + 4 >> 2] = f;c[e >> 2] = g;
      } else {
        c[d >> 2] = b;g = d + 4 | 0;c[g >> 2] = d;c[d + 8 >> 2] = 0;c[d + 8 >> 2] = fh(b, a, a + 8 | 0, a + 16 | 0, a + 24 | 0, a + 32 | 0, a + 40 | 0) | 0;b = c[(c[g >> 2] | 0) + 8 >> 2] | 0;
      }i = h;return b | 0;
    }function eh() {
      var b = 0;if (!(a[32] | 0)) {
        c[464] = 0;c[465] = 0;c[466] = 0;c[467] = 1864;c[469] = 0;a[1880] = 0;a[1881] = 0;sb(34, 1840, n | 0) | 0;b = 32;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 1840;
    }function fh(a, b, d, e, f, g, j) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;j = j | 0;var k = 0,
          l = 0,
          m = 0.0,
          n = 0.0,
          o = 0.0,
          p = 0.0,
          q = 0.0,
          r = 0.0;k = i;i = i + 16 | 0;l = k;im(l);a = c[a >> 2] | 0;r = +h[b >> 3];q = +h[d >> 3];p = +h[e >> 3];o = +h[f >> 3];n = +h[g >> 3];m = +h[j >> 3];jh() | 0;a = yb(0, c[480] | 0, a | 0, +r, +q, +p, +o, +n, +m) | 0;jm(l);i = k;return a | 0;
    }function gh(a) {
      a = a | 0;Ho(a);wn(a);return;
    }function hh(a) {
      a = a | 0;a = c[a + 12 >> 2] | 0;if (a) wn(a);return;
    }function ih(a) {
      a = a | 0;wn(a);return;
    }function jh() {
      var b = 0;if (!(a[24] | 0)) {
        c[478] = 1924;c[479] = 6;c[480] = pb(1924, 7) | 0;b = 24;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 1912;
    }function kh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = a + 24 | 0;b = c[d >> 2] | 0;if (b) do {
        e = b;b = c[b >> 2] | 0;wn(e);
      } while ((b | 0) != 0);c[d >> 2] = 0;d = a + 16 | 0;b = c[d >> 2] | 0;if (b) do {
        e = b;b = c[b >> 2] | 0;wn(e);
      } while ((b | 0) != 0);c[d >> 2] = 0;return;
    }function lh() {
      var b = 0;if (!(a[40] | 0)) {
        c[488] = 2;c[489] = 1;c[490] = 1832;c[491] = 1988;c[492] = 3;c[494] = 0;c[495] = 0;c[496] = 0;sb(35, 1952, n | 0) | 0;b = 40;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[488] | 0)) {
        c[488] = 0;c[489] = 0;c[490] = 0;c[491] = 0;c[492] = 0;c[493] = 0;c[494] = 0;c[495] = 0;c[488] = 2;c[489] = 1;c[490] = 1832;c[491] = 1988;c[492] = 3;c[494] = 0;c[495] = 0;c[496] = 0;
      }return 1952;
    }function mh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;lh() | 0;a = b | 4;c[f >> 2] = a;b = c[495] | 0;if (b >>> 0 < (c[496] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[495] = a;
      } else {
        nh(1976, e, f);a = c[495] | 0;
      }i = h;return ((a - (c[494] | 0) | 0) / 12 | 0) + -1 | 0;
    }function nh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function oh(a, b, d, e, f) {
      a = a | 0;b = b | 0;d = +d;e = +e;f = f | 0;var g = 0;lh() | 0;g = (c[494] | 0) + (a * 12 | 0) | 0;a = c[g >> 2] | 0;g = c[g + 4 >> 2] | 0;b = b + (g >> 1) | 0;if (g & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;Ob[a & 1](b, d, e, f);return;
    }function ph(a) {
      a = a | 0;qh(a + 24 | 0);return;
    }function qh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function rh() {
      var b = 0;if (!(a[48] | 0)) {
        c[501] = 2;c[502] = 6;c[503] = 1832;c[504] = 2040;c[505] = 0;c[507] = 0;c[508] = 0;c[509] = 0;sb(36, 2004, n | 0) | 0;b = 48;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[501] | 0)) {
        c[501] = 0;c[502] = 0;c[503] = 0;c[504] = 0;c[505] = 0;c[506] = 0;c[507] = 0;c[508] = 0;c[501] = 2;c[502] = 6;c[503] = 1832;c[504] = 2040;c[505] = 0;c[507] = 0;c[508] = 0;c[509] = 0;
      }return 2004;
    }function sh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;rh() | 0;a = b | 4;c[f >> 2] = a;b = c[508] | 0;if (b >>> 0 < (c[509] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[508] = a;
      } else {
        th(2028, e, f);a = c[508] | 0;
      }i = h;return ((a - (c[507] | 0) | 0) / 12 | 0) + -1 | 0;
    }function th(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function uh(a, b) {
      a = a | 0;b = b | 0;var d = 0;rh() | 0;d = (c[507] | 0) + (a * 12 | 0) | 0;a = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;b = b + (d >> 1) | 0;if (d & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return (Nb[a & 31](b) | 0) & 1 | 0;
    }function vh(a) {
      a = a | 0;wh(a + 24 | 0);return;
    }function wh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function xh() {
      var b = 0;if (!(a[56] | 0)) {
        c[511] = 2;c[512] = 6;c[513] = 1832;c[514] = 2080;c[515] = 1;c[517] = 0;c[518] = 0;c[519] = 0;sb(37, 2044, n | 0) | 0;b = 56;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[511] | 0)) {
        c[511] = 0;c[512] = 0;c[513] = 0;c[514] = 0;c[515] = 0;c[516] = 0;c[517] = 0;c[518] = 0;c[511] = 2;c[512] = 6;c[513] = 1832;c[514] = 2080;c[515] = 1;c[517] = 0;c[518] = 0;c[519] = 0;
      }return 2044;
    }function yh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;xh() | 0;a = b | 4;c[f >> 2] = a;b = c[518] | 0;if (b >>> 0 < (c[519] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[518] = a;
      } else {
        zh(2068, e, f);a = c[518] | 0;
      }i = h;return ((a - (c[517] | 0) | 0) / 12 | 0) + -1 | 0;
    }function zh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Ah(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0;e = i;i = i + 16 | 0;f = e + 8 | 0;g = e;xh() | 0;h = (c[517] | 0) + (a * 12 | 0) | 0;a = c[h + 4 >> 2] | 0;c[g >> 2] = c[h >> 2];c[g + 4 >> 2] = a;c[f >> 2] = c[g >> 2];c[f + 4 >> 2] = c[g + 4 >> 2];Dh(b, f, d);i = e;return;
    }function Bh(a) {
      a = a | 0;Ch(a + 24 | 0);return;
    }function Ch(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Dh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0;g = i;i = i + 16 | 0;f = g;e = c[b >> 2] | 0;h = c[b + 4 >> 2] | 0;b = a + (h >> 1) | 0;if (h & 1) e = c[(c[b >> 2] | 0) + e >> 2] | 0;c[f >> 2] = d;Mb[e & 31](b, f);e = c[f >> 2] | 0;if (e) rb(e | 0);i = g;return;
    }function Eh() {
      var b = 0;if (!(a[64] | 0)) {
        c[524] = 2;c[525] = 6;c[526] = 1832;c[527] = 2132;c[528] = 1;c[530] = 0;c[531] = 0;c[532] = 0;sb(38, 2096, n | 0) | 0;b = 64;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[524] | 0)) {
        c[524] = 0;c[525] = 0;c[526] = 0;c[527] = 0;c[528] = 0;c[529] = 0;c[530] = 0;c[531] = 0;c[524] = 2;c[525] = 6;c[526] = 1832;c[527] = 2132;c[528] = 1;c[530] = 0;c[531] = 0;c[532] = 0;
      }return 2096;
    }function Fh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Eh() | 0;a = b | 4;c[f >> 2] = a;b = c[531] | 0;if (b >>> 0 < (c[532] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[531] = a;
      } else {
        Gh(2120, e, f);a = c[531] | 0;
      }i = h;return ((a - (c[530] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Gh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Hh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;Eh() | 0;e = (c[530] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return Ub[a & 15](b, d) | 0;
    }function Ih(a) {
      a = a | 0;Jh(a + 24 | 0);return;
    }function Jh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Kh() {
      var b = 0;if (!(a[72] | 0)) {
        c[537] = 2;c[538] = 7;c[539] = 1832;c[540] = 2184;c[541] = 0;c[543] = 0;c[544] = 0;c[545] = 0;sb(39, 2148, n | 0) | 0;b = 72;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[537] | 0)) {
        c[537] = 0;c[538] = 0;c[539] = 0;c[540] = 0;c[541] = 0;c[542] = 0;c[543] = 0;c[544] = 0;c[537] = 2;c[538] = 7;c[539] = 1832;c[540] = 2184;c[541] = 0;c[543] = 0;c[544] = 0;c[545] = 0;
      }return 2148;
    }function Lh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Kh() | 0;a = b | 4;c[f >> 2] = a;b = c[544] | 0;if (b >>> 0 < (c[545] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[544] = a;
      } else {
        Mh(2172, e, f);a = c[544] | 0;
      }i = h;return ((a - (c[543] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Mh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Nh(a, b) {
      a = a | 0;b = b | 0;var d = 0;Kh() | 0;d = (c[543] | 0) + (a * 12 | 0) | 0;a = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;b = b + (d >> 1) | 0;if (d & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return Nb[a & 31](b) | 0;
    }function Oh(a) {
      a = a | 0;Ph(a + 24 | 0);return;
    }function Ph(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Qh() {
      var b = 0;if (!(a[80] | 0)) {
        c[547] = 2;c[548] = 8;c[549] = 1832;c[550] = 2224;c[551] = 0;c[553] = 0;c[554] = 0;c[555] = 0;sb(40, 2188, n | 0) | 0;b = 80;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[547] | 0)) {
        c[547] = 0;c[548] = 0;c[549] = 0;c[550] = 0;c[551] = 0;c[552] = 0;c[553] = 0;c[554] = 0;c[547] = 2;c[548] = 8;c[549] = 1832;c[550] = 2224;c[551] = 0;c[553] = 0;c[554] = 0;c[555] = 0;
      }return 2188;
    }function Rh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Qh() | 0;a = b | 4;c[f >> 2] = a;b = c[554] | 0;if (b >>> 0 < (c[555] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[554] = a;
      } else {
        Sh(2212, e, f);a = c[554] | 0;
      }i = h;return ((a - (c[553] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Sh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Th(a, b) {
      a = a | 0;b = b | 0;var d = 0;Qh() | 0;d = (c[553] | 0) + (a * 12 | 0) | 0;a = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;b = b + (d >> 1) | 0;if (d & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return Nb[a & 31](b) | 0;
    }function Uh(a) {
      a = a | 0;Vh(a + 24 | 0);return;
    }function Vh(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Wh() {
      var b = 0;if (!(a[88] | 0)) {
        c[557] = 2;c[558] = 7;c[559] = 1832;c[560] = 2264;c[561] = 1;c[563] = 0;c[564] = 0;c[565] = 0;sb(41, 2228, n | 0) | 0;b = 88;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[557] | 0)) {
        c[557] = 0;c[558] = 0;c[559] = 0;c[560] = 0;c[561] = 0;c[562] = 0;c[563] = 0;c[564] = 0;c[557] = 2;c[558] = 7;c[559] = 1832;c[560] = 2264;c[561] = 1;c[563] = 0;c[564] = 0;c[565] = 0;
      }return 2228;
    }function Xh(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Wh() | 0;a = b | 4;c[f >> 2] = a;b = c[564] | 0;if (b >>> 0 < (c[565] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[564] = a;
      } else {
        Yh(2252, e, f);a = c[564] | 0;
      }i = h;return ((a - (c[563] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Yh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Zh(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;Wh() | 0;e = (c[563] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;Mb[a & 31](b, d);return;
    }function _h(a) {
      a = a | 0;$h(a + 24 | 0);return;
    }function $h(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function ai() {
      var b = 0;if (!(a[96] | 0)) {
        c[568] = 2;c[569] = 4;c[570] = 1832;c[571] = 2308;c[572] = 2;c[574] = 0;c[575] = 0;c[576] = 0;sb(42, 2272, n | 0) | 0;b = 96;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[568] | 0)) {
        c[568] = 0;c[569] = 0;c[570] = 0;c[571] = 0;c[572] = 0;c[573] = 0;c[574] = 0;c[575] = 0;c[568] = 2;c[569] = 4;c[570] = 1832;c[571] = 2308;c[572] = 2;c[574] = 0;c[575] = 0;c[576] = 0;
      }return 2272;
    }function bi(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;ai() | 0;a = b | 4;c[f >> 2] = a;b = c[575] | 0;if (b >>> 0 < (c[576] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[575] = a;
      } else {
        ci(2296, e, f);a = c[575] | 0;
      }i = h;return ((a - (c[574] | 0) | 0) / 12 | 0) + -1 | 0;
    }function ci(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function di(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0;ai() | 0;f = (c[574] | 0) + (a * 12 | 0) | 0;a = c[f >> 2] | 0;f = c[f + 4 >> 2] | 0;b = b + (f >> 1) | 0;if (f & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;ac[a & 15](b, d, e);return;
    }function ei(a) {
      a = a | 0;fi(a + 24 | 0);return;
    }function fi(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function gi() {
      var b = 0;if (!(a[104] | 0)) {
        c[580] = 2;c[581] = 1;c[582] = 1832;c[583] = 2356;c[584] = 1;c[586] = 0;c[587] = 0;c[588] = 0;sb(43, 2320, n | 0) | 0;b = 104;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[580] | 0)) {
        c[580] = 0;c[581] = 0;c[582] = 0;c[583] = 0;c[584] = 0;c[585] = 0;c[586] = 0;c[587] = 0;c[580] = 2;c[581] = 1;c[582] = 1832;c[583] = 2356;c[584] = 1;c[586] = 0;c[587] = 0;c[588] = 0;
      }return 2320;
    }function hi(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;gi() | 0;a = b | 4;c[f >> 2] = a;b = c[587] | 0;if (b >>> 0 < (c[588] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[587] = a;
      } else {
        ii(2344, e, f);a = c[587] | 0;
      }i = h;return ((a - (c[586] | 0) | 0) / 12 | 0) + -1 | 0;
    }function ii(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function ji(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;gi() | 0;e = (c[586] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return + +Xb[a & 7](b, d);
    }function ki(a) {
      a = a | 0;li(a + 24 | 0);return;
    }function li(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function mi() {
      var b = 0;if (!(a[112] | 0)) {
        c[591] = 2;c[592] = 5;c[593] = 1832;c[594] = 2400;c[595] = 0;c[597] = 0;c[598] = 0;c[599] = 0;sb(44, 2364, n | 0) | 0;b = 112;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[591] | 0)) {
        c[591] = 0;c[592] = 0;c[593] = 0;c[594] = 0;c[595] = 0;c[596] = 0;c[597] = 0;c[598] = 0;c[591] = 2;c[592] = 5;c[593] = 1832;c[594] = 2400;c[595] = 0;c[597] = 0;c[598] = 0;c[599] = 0;
      }return 2364;
    }function ni(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;mi() | 0;a = b | 4;c[f >> 2] = a;b = c[598] | 0;if (b >>> 0 < (c[599] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[598] = a;
      } else {
        oi(2388, e, f);a = c[598] | 0;
      }i = h;return ((a - (c[597] | 0) | 0) / 12 | 0) + -1 | 0;
    }function oi(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function pi(a, b) {
      a = a | 0;b = b | 0;var d = 0;mi() | 0;d = (c[597] | 0) + (a * 12 | 0) | 0;a = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;b = b + (d >> 1) | 0;if (d & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return + +Sb[a & 15](b);
    }function qi(a) {
      a = a | 0;ri(a + 24 | 0);return;
    }function ri(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function si() {
      var b = 0;if (!(a[120] | 0)) {
        c[601] = 2;c[602] = 9;c[603] = 1832;c[604] = 2440;c[605] = 0;c[607] = 0;c[608] = 0;c[609] = 0;sb(45, 2404, n | 0) | 0;b = 120;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[601] | 0)) {
        c[601] = 0;c[602] = 0;c[603] = 0;c[604] = 0;c[605] = 0;c[606] = 0;c[607] = 0;c[608] = 0;c[601] = 2;c[602] = 9;c[603] = 1832;c[604] = 2440;c[605] = 0;c[607] = 0;c[608] = 0;c[609] = 0;
      }return 2404;
    }function ti(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;si() | 0;a = b | 4;c[f >> 2] = a;b = c[608] | 0;if (b >>> 0 < (c[609] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[608] = a;
      } else {
        ui(2428, e, f);a = c[608] | 0;
      }i = h;return ((a - (c[607] | 0) | 0) / 12 | 0) + -1 | 0;
    }function ui(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function vi(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;d = i;i = i + 16 | 0;e = d + 8 | 0;f = d;si() | 0;g = (c[607] | 0) + (a * 12 | 0) | 0;a = c[g + 4 >> 2] | 0;c[f >> 2] = c[g >> 2];c[f + 4 >> 2] = a;c[e >> 2] = c[f >> 2];c[e + 4 >> 2] = c[f + 4 >> 2];b = yi(b, e) | 0;i = d;return b | 0;
    }function wi(a) {
      a = a | 0;xi(a + 24 | 0);return;
    }function xi(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function yi(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;g = i;i = i + 32 | 0;f = g + 16 | 0;e = g;d = c[b >> 2] | 0;h = c[b + 4 >> 2] | 0;b = a + (h >> 1) | 0;if (h & 1) d = c[(c[b >> 2] | 0) + d >> 2] | 0;Mb[d & 31](e, b);zi() | 0;d = c[620] | 0;if (!d) {
        h = cm(8) | 0;d = h;f = un(16) | 0;c[f >> 2] = c[e >> 2];c[f + 4 >> 2] = c[e + 4 >> 2];c[f + 8 >> 2] = c[e + 8 >> 2];c[f + 12 >> 2] = c[e + 12 >> 2];a = d + 4 | 0;c[a >> 2] = f;f = un(8) | 0;a = c[a >> 2] | 0;c[f >> 2] = a;e = un(16) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e >> 2] = 2496;c[e + 12 >> 2] = a;c[f + 4 >> 2] = e;c[h >> 2] = f;
      } else {
        c[f >> 2] = d;h = f + 4 | 0;c[h >> 2] = f;f = f + 8 | 0;c[f >> 2] = 0;c[f >> 2] = Ai(d, e, e + 8 | 0) | 0;d = c[(c[h >> 2] | 0) + 8 >> 2] | 0;
      }i = g;return d | 0;
    }function zi() {
      var b = 0;if (!(a[136] | 0)) {
        c[615] = 0;c[616] = 0;c[617] = 0;c[618] = 2468;c[620] = 0;a[2484] = 0;a[2485] = 0;sb(34, 2444, n | 0) | 0;b = 136;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 2444;
    }function Ai(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0.0,
          j = 0;e = i;i = i + 16 | 0;f = e;im(f);j = c[a >> 2] | 0;a = c[b >> 2] | 0;g = +h[d >> 3];Ei() | 0;a = Cb(0, c[631] | 0, j | 0, a | 0, +g) | 0;jm(f);i = e;return a | 0;
    }function Bi(a) {
      a = a | 0;Ho(a);wn(a);return;
    }function Ci(a) {
      a = a | 0;a = c[a + 12 >> 2] | 0;if (a) wn(a);return;
    }function Di(a) {
      a = a | 0;wn(a);return;
    }function Ei() {
      var b = 0;if (!(a[128] | 0)) {
        c[629] = 2528;c[630] = 2;c[631] = pb(2528, 3) | 0;b = 128;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 2516;
    }function Fi() {
      var b = 0;if (!(a[144] | 0)) {
        c[635] = 2;c[636] = 7;c[637] = 1832;c[638] = 2576;c[639] = 1;c[641] = 0;c[642] = 0;c[643] = 0;sb(46, 2540, n | 0) | 0;b = 144;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[635] | 0)) {
        c[635] = 0;c[636] = 0;c[637] = 0;c[638] = 0;c[639] = 0;c[640] = 0;c[641] = 0;c[642] = 0;c[635] = 2;c[636] = 7;c[637] = 1832;c[638] = 2576;c[639] = 1;c[641] = 0;c[642] = 0;c[643] = 0;
      }return 2540;
    }function Gi(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Fi() | 0;a = b | 4;c[f >> 2] = a;b = c[642] | 0;if (b >>> 0 < (c[643] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[642] = a;
      } else {
        Hi(2564, e, f);a = c[642] | 0;
      }i = h;return ((a - (c[641] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Hi(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Ii(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0;e = i;i = i + 16 | 0;f = e + 8 | 0;g = e;Fi() | 0;h = (c[641] | 0) + (a * 12 | 0) | 0;a = c[h + 4 >> 2] | 0;c[g >> 2] = c[h >> 2];c[g + 4 >> 2] = a;c[f >> 2] = c[g >> 2];c[f + 4 >> 2] = c[g + 4 >> 2];b = Li(b, f, d) | 0;i = e;return b | 0;
    }function Ji(a) {
      a = a | 0;Ki(a + 24 | 0);return;
    }function Ki(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Li(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0;h = i;i = i + 32 | 0;g = h + 16 | 0;f = h;e = c[b >> 2] | 0;j = c[b + 4 >> 2] | 0;b = a + (j >> 1) | 0;if (j & 1) e = c[(c[b >> 2] | 0) + e >> 2] | 0;ac[e & 15](f, b, d);zi() | 0;e = c[620] | 0;if (!e) {
        j = cm(8) | 0;e = j;g = un(16) | 0;c[g >> 2] = c[f >> 2];c[g + 4 >> 2] = c[f + 4 >> 2];c[g + 8 >> 2] = c[f + 8 >> 2];c[g + 12 >> 2] = c[f + 12 >> 2];d = e + 4 | 0;c[d >> 2] = g;g = un(8) | 0;d = c[d >> 2] | 0;c[g >> 2] = d;f = un(16) | 0;c[f + 4 >> 2] = 0;c[f + 8 >> 2] = 0;c[f >> 2] = 2496;c[f + 12 >> 2] = d;c[g + 4 >> 2] = f;c[j >> 2] = g;
      } else {
        c[g >> 2] = e;j = g + 4 | 0;c[j >> 2] = g;g = g + 8 | 0;c[g >> 2] = 0;c[g >> 2] = Ai(e, f, f + 8 | 0) | 0;e = c[(c[j >> 2] | 0) + 8 >> 2] | 0;
      }i = h;return e | 0;
    }function Mi() {
      var b = 0;if (!(a[152] | 0)) {
        c[646] = 2;c[647] = 10;c[648] = 1832;c[649] = 2620;c[650] = 0;c[652] = 0;c[653] = 0;c[654] = 0;sb(47, 2584, n | 0) | 0;b = 152;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[646] | 0)) {
        c[646] = 0;c[647] = 0;c[648] = 0;c[649] = 0;c[650] = 0;c[651] = 0;c[652] = 0;c[653] = 0;c[646] = 2;c[647] = 10;c[648] = 1832;c[649] = 2620;c[650] = 0;c[652] = 0;c[653] = 0;c[654] = 0;
      }return 2584;
    }function Ni(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Mi() | 0;a = b | 4;c[f >> 2] = a;b = c[653] | 0;if (b >>> 0 < (c[654] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[653] = a;
      } else {
        Oi(2608, e, f);a = c[653] | 0;
      }i = h;return ((a - (c[652] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Oi(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Pi(a, b) {
      a = a | 0;b = b | 0;var d = 0;Mi() | 0;d = (c[652] | 0) + (a * 12 | 0) | 0;a = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;b = b + (d >> 1) | 0;if (d & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return Nb[a & 31](b) | 0;
    }function Qi(a) {
      a = a | 0;Ri(a + 24 | 0);return;
    }function Ri(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Si() {
      var b = 0;if (!(a[160] | 0)) {
        c[656] = 2;c[657] = 8;c[658] = 1832;c[659] = 2660;c[660] = 1;c[662] = 0;c[663] = 0;c[664] = 0;sb(48, 2624, n | 0) | 0;b = 160;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[656] | 0)) {
        c[656] = 0;c[657] = 0;c[658] = 0;c[659] = 0;c[660] = 0;c[661] = 0;c[662] = 0;c[663] = 0;c[656] = 2;c[657] = 8;c[658] = 1832;c[659] = 2660;c[660] = 1;c[662] = 0;c[663] = 0;c[664] = 0;
      }return 2624;
    }function Ti(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Si() | 0;a = b | 4;c[f >> 2] = a;b = c[663] | 0;if (b >>> 0 < (c[664] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[663] = a;
      } else {
        Ui(2648, e, f);a = c[663] | 0;
      }i = h;return ((a - (c[662] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Ui(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Vi(a, b, d) {
      a = a | 0;b = b | 0;d = +d;var e = 0;Si() | 0;e = (c[662] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;Jb[a & 31](b, d);return;
    }function Wi(a) {
      a = a | 0;Xi(a + 24 | 0);return;
    }function Xi(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Yi() {
      var b = 0;if (!(a[168] | 0)) {
        c[667] = 2;c[668] = 1;c[669] = 1832;c[670] = 2704;c[671] = 2;c[673] = 0;c[674] = 0;c[675] = 0;sb(49, 2668, n | 0) | 0;b = 168;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[667] | 0)) {
        c[667] = 0;c[668] = 0;c[669] = 0;c[670] = 0;c[671] = 0;c[672] = 0;c[673] = 0;c[674] = 0;c[667] = 2;c[668] = 1;c[669] = 1832;c[670] = 2704;c[671] = 2;c[673] = 0;c[674] = 0;c[675] = 0;
      }return 2668;
    }function Zi(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Yi() | 0;a = b | 4;c[f >> 2] = a;b = c[674] | 0;if (b >>> 0 < (c[675] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[674] = a;
      } else {
        _i(2692, e, f);a = c[674] | 0;
      }i = h;return ((a - (c[673] | 0) | 0) / 12 | 0) + -1 | 0;
    }function _i(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function $i(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = +e;var f = 0;Yi() | 0;f = (c[673] | 0) + (a * 12 | 0) | 0;a = c[f >> 2] | 0;f = c[f + 4 >> 2] | 0;b = b + (f >> 1) | 0;if (f & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;cc[a & 15](b, d, e);return;
    }function aj(a) {
      a = a | 0;bj(a + 24 | 0);return;
    }function bj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function cj() {
      var b = 0;if (!(a[176] | 0)) {
        c[679] = 2;c[680] = 8;c[681] = 1832;c[682] = 2752;c[683] = 1;c[685] = 0;c[686] = 0;c[687] = 0;sb(50, 2716, n | 0) | 0;b = 176;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[679] | 0)) {
        c[679] = 0;c[680] = 0;c[681] = 0;c[682] = 0;c[683] = 0;c[684] = 0;c[685] = 0;c[686] = 0;c[679] = 2;c[680] = 8;c[681] = 1832;c[682] = 2752;c[683] = 1;c[685] = 0;c[686] = 0;c[687] = 0;
      }return 2716;
    }function dj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;cj() | 0;a = b | 4;c[f >> 2] = a;b = c[686] | 0;if (b >>> 0 < (c[687] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[686] = a;
      } else {
        ej(2740, e, f);a = c[686] | 0;
      }i = h;return ((a - (c[685] | 0) | 0) / 12 | 0) + -1 | 0;
    }function ej(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function fj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;cj() | 0;e = (c[685] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;Mb[a & 31](b, d);return;
    }function gj(a) {
      a = a | 0;hj(a + 24 | 0);return;
    }function hj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function ij() {
      var b = 0;if (!(a[184] | 0)) {
        c[690] = 2;c[691] = 9;c[692] = 1832;c[693] = 2796;c[694] = 1;c[696] = 0;c[697] = 0;c[698] = 0;sb(51, 2760, n | 0) | 0;b = 184;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[690] | 0)) {
        c[690] = 0;c[691] = 0;c[692] = 0;c[693] = 0;c[694] = 0;c[695] = 0;c[696] = 0;c[697] = 0;c[690] = 2;c[691] = 9;c[692] = 1832;c[693] = 2796;c[694] = 1;c[696] = 0;c[697] = 0;c[698] = 0;
      }return 2760;
    }function jj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;ij() | 0;a = b | 4;c[f >> 2] = a;b = c[697] | 0;if (b >>> 0 < (c[698] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[697] = a;
      } else {
        kj(2784, e, f);a = c[697] | 0;
      }i = h;return ((a - (c[696] | 0) | 0) / 12 | 0) + -1 | 0;
    }function kj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function lj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;ij() | 0;e = (c[696] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;Mb[a & 31](b, d);return;
    }function mj(a) {
      a = a | 0;nj(a + 24 | 0);return;
    }function nj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function oj() {
      var b = 0;if (!(a[192] | 0)) {
        c[705] = 2;c[706] = 22;c[707] = 1832;c[708] = 2856;c[709] = 0;c[711] = 0;c[712] = 0;c[713] = 0;sb(52, 2820, n | 0) | 0;b = 192;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[705] | 0)) {
        c[705] = 0;c[706] = 0;c[707] = 0;c[708] = 0;c[709] = 0;c[710] = 0;c[711] = 0;c[712] = 0;c[705] = 2;c[706] = 22;c[707] = 1832;c[708] = 2856;c[709] = 0;c[711] = 0;c[712] = 0;c[713] = 0;
      }return 2820;
    }function pj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;oj() | 0;a = b | 4;c[f >> 2] = a;b = c[712] | 0;if (b >>> 0 < (c[713] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[712] = a;
      } else {
        qj(2844, e, f);a = c[712] | 0;
      }i = h;return ((a - (c[711] | 0) | 0) / 12 | 0) + -1 | 0;
    }function qj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function rj(a, b) {
      a = a | 0;b = b | 0;var d = 0;oj() | 0;d = (c[711] | 0) + (a * 12 | 0) | 0;a = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;b = b + (d >> 1) | 0;if (d & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;Lb[a & 127](b);return;
    }function sj(a) {
      a = a | 0;tj(a + 24 | 0);return;
    }function tj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function uj() {
      var b = 0;if (!(a[200] | 0)) {
        c[715] = 1;c[716] = 23;c[717] = 1832;c[718] = 2264;c[719] = 1;c[721] = 0;c[722] = 0;c[723] = 0;sb(53, 2860, n | 0) | 0;b = 200;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[715] | 0)) {
        c[715] = 0;c[716] = 0;c[717] = 0;c[718] = 0;c[719] = 0;c[720] = 0;c[721] = 0;c[722] = 0;c[715] = 1;c[716] = 23;c[717] = 1832;c[718] = 2264;c[719] = 1;c[721] = 0;c[722] = 0;c[723] = 0;
      }return 2860;
    }function vj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;uj() | 0;b = b | 4;c[f >> 2] = b;d = c[722] | 0;if (d >>> 0 < (c[723] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[722] = b;
      } else {
        wj(2884, e, f);b = c[722] | 0;
      }i = g;return (b - (c[721] | 0) >> 3) + -1 | 0;
    }function wj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function xj(a, b) {
      a = a | 0;b = b | 0;uj() | 0;Lb[c[(c[2884 >> 2] | 0) + (a << 3) >> 2] & 127](b);return;
    }function yj(a) {
      a = a | 0;zj(a + 24 | 0);return;
    }function zj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Aj() {
      var b = 0;if (!(a[208] | 0)) {
        c[724] = 1;c[725] = 11;c[726] = 1832;c[727] = 2932;c[728] = 1;c[730] = 0;c[731] = 0;c[732] = 0;sb(54, 2896, n | 0) | 0;b = 208;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[724] | 0)) {
        c[724] = 0;c[725] = 0;c[726] = 0;c[727] = 0;c[728] = 0;c[729] = 0;c[730] = 0;c[731] = 0;c[724] = 1;c[725] = 11;c[726] = 1832;c[727] = 2932;c[728] = 1;c[730] = 0;c[731] = 0;c[732] = 0;
      }return 2896;
    }function Bj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;Aj() | 0;b = b | 4;c[f >> 2] = b;d = c[731] | 0;if (d >>> 0 < (c[732] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[731] = b;
      } else {
        Cj(2920, e, f);b = c[731] | 0;
      }i = g;return (b - (c[730] | 0) >> 3) + -1 | 0;
    }function Cj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function Dj(a, b) {
      a = a | 0;b = b | 0;Aj() | 0;return Nb[c[(c[2920 >> 2] | 0) + (a << 3) >> 2] & 31](b) | 0;
    }function Ej(a) {
      a = a | 0;Fj(a + 24 | 0);return;
    }function Fj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Gj() {
      var b = 0;if (!(a[216] | 0)) {
        c[737] = 1;c[738] = 18;c[739] = 1832;c[740] = 2184;c[741] = 0;c[743] = 0;c[744] = 0;c[745] = 0;sb(55, 2948, n | 0) | 0;b = 216;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[737] | 0)) {
        c[737] = 0;c[738] = 0;c[739] = 0;c[740] = 0;c[741] = 0;c[742] = 0;c[743] = 0;c[744] = 0;c[737] = 1;c[738] = 18;c[739] = 1832;c[740] = 2184;c[741] = 0;c[743] = 0;c[744] = 0;c[745] = 0;
      }return 2948;
    }function Hj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;Gj() | 0;b = b | 4;c[f >> 2] = b;d = c[744] | 0;if (d >>> 0 < (c[745] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[744] = b;
      } else {
        Ij(2972, e, f);b = c[744] | 0;
      }i = g;return (b - (c[743] | 0) >> 3) + -1 | 0;
    }function Ij(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function Jj(a) {
      a = a | 0;Gj() | 0;return Yb[c[(c[2972 >> 2] | 0) + (a << 3) >> 2] & 7]() | 0;
    }function Kj(a) {
      a = a | 0;Lj(a + 24 | 0);return;
    }function Lj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Mj() {
      var b = 0;if (!(a[232] | 0)) {
        c[750] = 0;c[751] = 0;c[752] = 0;c[753] = 3008;c[755] = 0;a[3024] = 0;a[3025] = 0;sb(34, 2984, n | 0) | 0;b = 232;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 2984;
    }function Nj(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) {
        Me(b);wn(b);
      }return;
    }function Oj(b, d) {
      b = b | 0;d = d | 0;pk() | 0;c[b >> 2] = 3212;c[803] = 8425;c[804] = 2940;c[806] = d;if (!(a[224] | 0)) {
        c[757] = 0;c[758] = 0;d = 224;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[805] = 3028;c[811] = 5;hl(c[b >> 2] | 0);return;
    }function Pj(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;jk() | 0;h = kk(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 3172;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Qj(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;dk() | 0;h = ek(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 3128;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Rj(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Zj() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = _j(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 3080;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Sj(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0;f = i;i = i + 16 | 0;h = f + 8 | 0;g = f;j = c[d >> 2] | 0;d = c[d + 4 >> 2] | 0;a = c[a >> 2] | 0;Tj() | 0;c[g >> 2] = j;c[g + 4 >> 2] = d;c[h >> 2] = c[g >> 2];c[h + 4 >> 2] = c[g + 4 >> 2];h = Uj(h, e) | 0;a = a + 28 | 0;d = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = 0;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 3036;c[g + 20 >> 2] = e;b = d;c[g >> 2] = c[b >> 2];c[d >> 2] = g;c[a >> 2] = c[b >> 2];i = f;return;
    }function Tj() {
      var b = 0;if (!(a[240] | 0)) {
        c[759] = 2;c[760] = 8;c[761] = 1832;c[762] = 3072;c[763] = 1;c[765] = 0;c[766] = 0;c[767] = 0;sb(56, 3036, n | 0) | 0;b = 240;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[759] | 0)) {
        c[759] = 0;c[760] = 0;c[761] = 0;c[762] = 0;c[763] = 0;c[764] = 0;c[765] = 0;c[766] = 0;c[759] = 2;c[760] = 8;c[761] = 1832;c[762] = 3072;c[763] = 1;c[765] = 0;c[766] = 0;c[767] = 0;
      }return 3036;
    }function Uj(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Tj() | 0;a = b | 4;c[f >> 2] = a;b = c[766] | 0;if (b >>> 0 < (c[767] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[766] = a;
      } else {
        Vj(3060, e, f);a = c[766] | 0;
      }i = h;return ((a - (c[765] | 0) | 0) / 12 | 0) + -1 | 0;
    }function Vj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function Wj(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;Tj() | 0;e = (c[765] | 0) + (a * 12 | 0) | 0;a = c[e >> 2] | 0;e = c[e + 4 >> 2] | 0;b = b + (e >> 1) | 0;if (e & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;return (Ub[a & 15](b, d) | 0) & 1 | 0;
    }function Xj(a) {
      a = a | 0;Yj(a + 24 | 0);return;
    }function Yj(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function Zj() {
      var b = 0;if (!(a[248] | 0)) {
        c[770] = 2;c[771] = 6;c[772] = 1832;c[773] = 3116;c[774] = 2;c[776] = 0;c[777] = 0;c[778] = 0;sb(57, 3080, n | 0) | 0;b = 248;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[770] | 0)) {
        c[770] = 0;c[771] = 0;c[772] = 0;c[773] = 0;c[774] = 0;c[775] = 0;c[776] = 0;c[777] = 0;c[770] = 2;c[771] = 6;c[772] = 1832;c[773] = 3116;c[774] = 2;c[776] = 0;c[777] = 0;c[778] = 0;
      }return 3080;
    }function _j(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 16 | 0;e = h + 8 | 0;f = h;g = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;c[e >> 2] = g;c[e + 4 >> 2] = d;Zj() | 0;a = b | 4;c[f >> 2] = a;b = c[777] | 0;if (b >>> 0 < (c[778] | 0) >>> 0) {
        c[b >> 2] = g;c[b + 4 >> 2] = d;c[b + 8 >> 2] = a;a = b + 12 | 0;c[777] = a;
      } else {
        $j(3104, e, f);a = c[777] | 0;
      }i = h;return ((a - (c[776] | 0) | 0) / 12 | 0) + -1 | 0;
    }function $j(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;g = a + 4 | 0;i = c[a >> 2] | 0;j = i;f = (((c[g >> 2] | 0) - j | 0) / 12 | 0) + 1 | 0;if (f >>> 0 > 357913941) tn(a);k = a + 8 | 0;h = i;e = ((c[k >> 2] | 0) - h | 0) / 12 | 0;if (e >>> 0 < 178956970) {
        e = e << 1;e = e >>> 0 < f >>> 0 ? f : e;
      } else e = 357913941;l = (c[g >> 2] | 0) - h | 0;f = (l | 0) / 12 | 0;h = un(e * 12 | 0) | 0;n = c[b + 4 >> 2] | 0;d = c[d >> 2] | 0;m = h + (f * 12 | 0) | 0;c[m >> 2] = c[b >> 2];c[m + 4 >> 2] = n;c[h + (f * 12 | 0) + 8 >> 2] = d;d = h + ((((l | 0) / -12 | 0) + f | 0) * 12 | 0) | 0;So(d | 0, i | 0, l | 0) | 0;c[a >> 2] = d;c[g >> 2] = h + ((f + 1 | 0) * 12 | 0);c[k >> 2] = h + (e * 12 | 0);if (j) wn(j);return;
    }function ak(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0;Zj() | 0;f = (c[776] | 0) + (a * 12 | 0) | 0;a = c[f >> 2] | 0;f = c[f + 4 >> 2] | 0;b = b + (f >> 1) | 0;if (f & 1) a = c[(c[b >> 2] | 0) + a >> 2] | 0;ac[a & 15](b, d, (e | 0) != 0);return;
    }function bk(a) {
      a = a | 0;ck(a + 24 | 0);return;
    }function ck(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~(((b + -12 - e | 0) >>> 0) / 12 | 0) * 12 | 0);wn(d);
      }return;
    }function dk() {
      var b = 0;if (!(a[256] | 0)) {
        c[782] = 1;c[783] = 24;c[784] = 1832;c[785] = 3164;c[786] = 1;c[788] = 0;c[789] = 0;c[790] = 0;sb(58, 3128, n | 0) | 0;b = 256;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[782] | 0)) {
        c[782] = 0;c[783] = 0;c[784] = 0;c[785] = 0;c[786] = 0;c[787] = 0;c[788] = 0;c[789] = 0;c[782] = 1;c[783] = 24;c[784] = 1832;c[785] = 3164;c[786] = 1;c[788] = 0;c[789] = 0;c[790] = 0;
      }return 3128;
    }function ek(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;dk() | 0;b = b | 4;c[f >> 2] = b;d = c[789] | 0;if (d >>> 0 < (c[790] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[789] = b;
      } else {
        fk(3152, e, f);b = c[789] | 0;
      }i = g;return (b - (c[788] | 0) >> 3) + -1 | 0;
    }function fk(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function gk(a, b) {
      a = a | 0;b = b | 0;dk() | 0;Lb[c[(c[3152 >> 2] | 0) + (a << 3) >> 2] & 127](b);return;
    }function hk(a) {
      a = a | 0;ik(a + 24 | 0);return;
    }function ik(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function jk() {
      var b = 0;if (!(a[264] | 0)) {
        c[793] = 1;c[794] = 19;c[795] = 1832;c[796] = 3208;c[797] = 0;c[799] = 0;c[800] = 0;c[801] = 0;sb(59, 3172, n | 0) | 0;b = 264;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[793] | 0)) {
        c[793] = 0;c[794] = 0;c[795] = 0;c[796] = 0;c[797] = 0;c[798] = 0;c[799] = 0;c[800] = 0;c[793] = 1;c[794] = 19;c[795] = 1832;c[796] = 3208;c[797] = 0;c[799] = 0;c[800] = 0;c[801] = 0;
      }return 3172;
    }function kk(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;jk() | 0;b = b | 4;c[f >> 2] = b;d = c[800] | 0;if (d >>> 0 < (c[801] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[800] = b;
      } else {
        lk(3196, e, f);b = c[800] | 0;
      }i = g;return (b - (c[799] | 0) >> 3) + -1 | 0;
    }function lk(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function mk(a) {
      a = a | 0;jk() | 0;return Yb[c[(c[3196 >> 2] | 0) + (a << 3) >> 2] & 7]() | 0;
    }function nk(a) {
      a = a | 0;ok(a + 24 | 0);return;
    }function ok(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function pk() {
      var b = 0;if (!(a[272] | 0)) {
        c[807] = 0;c[808] = 0;c[809] = 0;c[810] = 3236;c[812] = 0;a[3252] = 0;a[3253] = 0;sb(34, 3212, n | 0) | 0;b = 272;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3212;
    }function qk(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) {
        Fe(b);wn(b);
      }return;
    }function rk(b, d) {
      b = b | 0;d = d | 0;zi() | 0;c[b >> 2] = 2444;c[611] = 8424;c[612] = 3340;c[614] = d;if (!(a[296] | 0)) {
        c[839] = c[838];c[840] = 0;d = 296;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[613] = 3356;c[619] = 7;hl(c[b >> 2] | 0);return;
    }function sk() {
      var b = 0;if (!(a[288] | 0)) {
        c[814] = 5;c[815] = 4;c[816] = 1832;c[817] = 3348;c[818] = 0;c[820] = 0;c[821] = 0;c[822] = 0;c[819] = 60;sb(61, 3256, n | 0) | 0;b = 288;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[814] | 0)) {
        c[814] = 5;c[815] = 4;c[816] = 1832;c[817] = 3348;c[818] = 0;c[820] = 0;c[821] = 0;c[822] = 0;c[819] = 60;
      }return 3256;
    }function tk() {
      var b = 0;if (!(a[280] | 0)) {
        c[823] = 5;c[824] = 1;c[825] = 1832;c[826] = 3328;c[827] = 2;c[829] = 0;c[830] = 0;c[831] = 0;c[828] = 9;sb(62, 3292, n | 0) | 0;b = 280;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[823] | 0)) {
        c[823] = 5;c[824] = 1;c[825] = 1832;c[826] = 3328;c[827] = 2;c[829] = 0;c[830] = 0;c[831] = 0;c[828] = 9;
      }return 3292;
    }function uk(a, b) {
      a = a | 0;b = +b;var d = 0,
          e = 0,
          f = 0,
          g = 0;e = cm(8) | 0;d = e;f = un(16) | 0;c[f >> 2] = a;h[f + 8 >> 3] = b;g = d + 4 | 0;c[g >> 2] = f;a = un(8) | 0;g = c[g >> 2] | 0;c[a >> 2] = g;f = un(16) | 0;c[f + 4 >> 2] = 0;c[f + 8 >> 2] = 0;c[f >> 2] = 2496;c[f + 12 >> 2] = g;c[a + 4 >> 2] = f;c[e >> 2] = a;return d | 0;
    }function vk(b, d, e) {
      b = b | 0;d = d | 0;e = +e;c[b + 8 >> 2] = d;h[b + 16 >> 3] = e;a[b + 24 >> 0] = 1;return;
    }function wk(a) {
      a = a | 0;xk(a + 24 | 0);return;
    }function xk(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function yk() {
      var a = 0,
          b = 0,
          d = 0,
          e = 0,
          f = 0;b = cm(8) | 0;a = b;d = un(16) | 0;c[d >> 2] = 0;h[d + 8 >> 3] = 0.0;f = a + 4 | 0;c[f >> 2] = d;d = un(8) | 0;f = c[f >> 2] | 0;c[d >> 2] = f;e = un(16) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e >> 2] = 2496;c[e + 12 >> 2] = f;c[d + 4 >> 2] = e;c[b >> 2] = d;return a | 0;
    }function zk(b) {
      b = b | 0;c[b + 8 >> 2] = 0;h[b + 16 >> 3] = 0.0;a[b + 24 >> 0] = 1;return;
    }function Ak(a) {
      a = a | 0;Bk(a + 24 | 0);return;
    }function Bk(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Ck(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) wn(b);return;
    }function Dk(b, d) {
      b = b | 0;d = d | 0;eh() | 0;c[b >> 2] = 1840;c[460] = 8417;c[461] = 3404;c[463] = d;if (!(a[296] | 0)) {
        c[839] = c[838];c[840] = 0;d = 296;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[462] = 3356;c[468] = 8;hl(c[b >> 2] | 0);return;
    }function Ek() {
      var b = 0;if (!(a[304] | 0)) {
        c[841] = 5;c[842] = 5;c[843] = 1832;c[844] = 3400;c[845] = 0;c[847] = 0;c[848] = 0;c[849] = 0;c[846] = 63;sb(64, 3364, n | 0) | 0;b = 304;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[841] | 0)) {
        c[841] = 5;c[842] = 5;c[843] = 1832;c[844] = 3400;c[845] = 0;c[847] = 0;c[848] = 0;c[849] = 0;c[846] = 63;
      }return 3364;
    }function Fk() {
      var a = 0,
          b = 0,
          d = 0,
          e = 0,
          f = 0;a = cm(8) | 0;b = a;d = un(48) | 0;e = d;f = e + 48 | 0;do {
        c[e >> 2] = 0;e = e + 4 | 0;
      } while ((e | 0) < (f | 0));e = b + 4 | 0;c[e >> 2] = d;f = un(8) | 0;d = c[e >> 2] | 0;c[f >> 2] = d;e = un(16) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e >> 2] = 1892;c[e + 12 >> 2] = d;c[f + 4 >> 2] = e;c[a >> 2] = f;return b | 0;
    }function Gk(b) {
      b = b | 0;var d = 0,
          e = 0;d = b + 8 | 0;e = d + 48 | 0;do {
        c[d >> 2] = 0;d = d + 4 | 0;
      } while ((d | 0) < (e | 0));a[b + 56 >> 0] = 1;return;
    }function Hk(a) {
      a = a | 0;Ik(a + 24 | 0);return;
    }function Ik(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Jk(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) wn(b);return;
    }function Kk(b, d) {
      b = b | 0;d = d | 0;Yk() | 0;c[b >> 2] = 3536;c[884] = 7216;c[885] = 3496;c[887] = d;if (!(a[296] | 0)) {
        c[839] = c[838];c[840] = 0;d = 296;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[886] = 3356;c[892] = 9;hl(c[b >> 2] | 0);return;
    }function Lk() {
      var b = 0;if (!(a[320] | 0)) {
        c[853] = 5;c[854] = 6;c[855] = 1832;c[856] = 3532;c[857] = 0;c[859] = 0;c[860] = 0;c[861] = 0;c[858] = 65;sb(66, 3412, n | 0) | 0;b = 320;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[853] | 0)) {
        c[853] = 5;c[854] = 6;c[855] = 1832;c[856] = 3532;c[857] = 0;c[859] = 0;c[860] = 0;c[861] = 0;c[858] = 65;
      }return 3412;
    }function Mk() {
      var b = 0;if (!(a[312] | 0)) {
        c[862] = 5;c[863] = 1;c[864] = 1832;c[865] = 3484;c[866] = 2;c[868] = 0;c[869] = 0;c[870] = 0;c[867] = 1;sb(67, 3448, n | 0) | 0;b = 312;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[862] | 0)) {
        c[862] = 5;c[863] = 1;c[864] = 1832;c[865] = 3484;c[866] = 2;c[868] = 0;c[869] = 0;c[870] = 0;c[867] = 1;
      }return 3448;
    }function Nk(a, b) {
      a = +a;b = +b;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          i = 0;e = cm(8) | 0;d = e;f = un(16) | 0;h[f >> 3] = a;h[f + 8 >> 3] = b;i = d + 4 | 0;c[i >> 2] = f;f = un(8) | 0;i = c[i >> 2] | 0;c[f >> 2] = i;g = un(16) | 0;c[g + 4 >> 2] = 0;c[g + 8 >> 2] = 0;c[g >> 2] = 3512;c[g + 12 >> 2] = i;c[f + 4 >> 2] = g;c[e >> 2] = f;return d | 0;
    }function Ok(b, c, d) {
      b = b | 0;c = +c;d = +d;h[b + 8 >> 3] = c;h[b + 16 >> 3] = d;a[b + 24 >> 0] = 1;return;
    }function Pk(a) {
      a = a | 0;Qk(a + 24 | 0);return;
    }function Qk(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Rk(a) {
      a = a | 0;Ho(a);wn(a);return;
    }function Sk(a) {
      a = a | 0;a = c[a + 12 >> 2] | 0;if (a) wn(a);return;
    }function Tk(a) {
      a = a | 0;wn(a);return;
    }function Uk() {
      var a = 0,
          b = 0,
          d = 0,
          e = 0,
          f = 0;b = cm(8) | 0;a = b;d = un(16) | 0;c[d >> 2] = 0;c[d + 4 >> 2] = 0;c[d + 8 >> 2] = 0;c[d + 12 >> 2] = 0;f = a + 4 | 0;c[f >> 2] = d;d = un(8) | 0;f = c[f >> 2] | 0;c[d >> 2] = f;e = un(16) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e >> 2] = 3512;c[e + 12 >> 2] = f;c[d + 4 >> 2] = e;c[b >> 2] = d;return a | 0;
    }function Vk(b) {
      b = b | 0;var d = 0;d = b + 8 | 0;c[d >> 2] = 0;c[d + 4 >> 2] = 0;c[d + 8 >> 2] = 0;c[d + 12 >> 2] = 0;a[b + 24 >> 0] = 1;return;
    }function Wk(a) {
      a = a | 0;Xk(a + 24 | 0);return;
    }function Xk(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Yk() {
      var b = 0;if (!(a[328] | 0)) {
        c[888] = 0;c[889] = 0;c[890] = 0;c[891] = 3560;c[893] = 0;a[3576] = 0;a[3577] = 0;sb(34, 3536, n | 0) | 0;b = 328;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3536;
    }function Zk(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) wn(b);return;
    }function _k(a) {
      a = a | 0;vg() | 0;return Yb[c[(c[1764 >> 2] | 0) + (a << 3) >> 2] & 7]() | 0;
    }function $k(a) {
      a = a | 0;al(a + 24 | 0);return;
    }function al(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function bl(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function cl(b, d) {
      b = b | 0;d = d | 0;var e = 0,
          f = 0;if (!(a[8517] | 0)) {
        c[895] = 0;sb(68, 3580, n | 0) | 0;a[8517] = 1;
      }e = c[895] | 0;a: do if (e) {
        f = e;while (1) {
          e = c[f + 4 >> 2] | 0;if ((e | 0) != 0 ? (uo(c[e + 12 >> 2] | 0, b) | 0) == 0 : 0) break;f = c[f >> 2] | 0;if (!f) break a;
        }ll(e, d);
      } while (0);return;
    }function dl() {
      if (!(a[8517] | 0)) {
        c[895] = 0;sb(68, 3580, n | 0) | 0;a[8517] = 1;
      }return 3580;
    }function el() {
      if (!(a[8518] | 0)) {
        c[896] = 0;sb(69, 3584, n | 0) | 0;a[8518] = 1;
      }return 3584;
    }function fl() {
      var b = 0;if (!(a[8519] | 0)) {
        if (!(a[8520] | 0)) {
          a[8521] = 8;a[8522] = 0;a[8523] = 16;a[8524] = 8;a[8525] = 0;a[8526] = 8;a[8527] = 0;a[8528] = 8;a[8529] = 0;a[8530] = 8;a[8531] = 0;a[8532] = 32;a[8533] = 32;a[8520] = 1;
        }c[897] = 3592;a[8519] = 1;b = 3592;
      } else b = c[897] | 0;return b | 0;
    }function gl() {
      return 3604;
    }function hl(b) {
      b = b | 0;var d = 0;if (!(a[8517] | 0)) {
        c[895] = 0;sb(68, 3580, n | 0) | 0;a[8517] = 1;
      }d = un(8) | 0;c[d + 4 >> 2] = b;c[d >> 2] = c[895];c[895] = d;return;
    }function il(b, d, e, f, g) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0;if (!(a[8518] | 0)) {
        c[896] = 0;sb(69, 3584, n | 0) | 0;a[8518] = 1;
      }h = un(24) | 0;c[h + 4 >> 2] = b;c[h + 8 >> 2] = d;c[h + 12 >> 2] = e;c[h + 16 >> 2] = f;c[h + 20 >> 2] = g;c[h >> 2] = c[896];c[896] = h;return;
    }function jl() {
      nl(3736, 8630);return;
    }function kl(a) {
      a = a | 0;var b = 0,
          d = 0;b = c[a >> 2] | 0;if (b) do {
        d = b;b = c[b >> 2] | 0;wn(d);
      } while ((b | 0) != 0);c[a >> 2] = 0;return;
    }function ll(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;a = a + 36 | 0;d = c[a >> 2] | 0;if (d) {
        e = c[d >> 2] | 0;if (e) rb(e | 0);wn(d);
      }e = un(4) | 0;b = c[b >> 2] | 0;c[e >> 2] = b;Ha(b | 0);c[a >> 2] = e;return;
    }function ml(a) {
      a = a | 0;var b = 0,
          d = 0;b = c[a >> 2] | 0;if (b) do {
        d = b;b = c[b >> 2] | 0;wn(d);
      } while ((b | 0) != 0);c[a >> 2] = 0;return;
    }function nl(b, d) {
      b = b | 0;d = d | 0;ol() | 0;c[b >> 2] = 3740;c[935] = 8636;c[936] = 3784;c[938] = d;if (!(a[224] | 0)) {
        c[757] = 0;c[758] = 0;d = 224;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[937] = 3028;c[943] = 10;hl(c[b >> 2] | 0);return;
    }function ol() {
      var b = 0;if (!(a[344] | 0)) {
        c[939] = 0;c[940] = 0;c[941] = 0;c[942] = 3764;c[944] = 0;a[3780] = 0;a[3781] = 0;sb(34, 3740, n | 0) | 0;b = 344;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3740;
    }function pl(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) wn(b);return;
    }function ql(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0,
          t = 0,
          u = 0,
          v = 0;v = i;i = i + 48 | 0;u = v + 24 | 0;q = v + 20 | 0;t = v + 8 | 0;r = v + 4 | 0;s = v;b = c[b >> 2] | 0;if (b) {
        m = u + 4 | 0;n = u + 8 | 0;o = t + 4 | 0;p = t + 8 | 0;k = t + 8 | 0;l = u + 8 | 0;do {
          h = b;j = c[h + 16 >> 2] | 0;if (j) {
            f = c[j + 12 >> 2] | 0;c[u >> 2] = 0;c[m >> 2] = 0;c[n >> 2] = 0;e = (c[j + 16 >> 2] | 0) + 1 | 0;tl(u, e);if (e) while (1) {
              e = e + -1 | 0;em(q, c[f >> 2] | 0);g = c[m >> 2] | 0;if (g >>> 0 < (c[l >> 2] | 0) >>> 0) {
                c[g >> 2] = c[q >> 2];c[m >> 2] = (c[m >> 2] | 0) + 4;
              } else ul(u, q);if (!e) break;else f = f + 4 | 0;
            }e = c[j + 8 >> 2] | 0;c[t >> 2] = 0;c[o >> 2] = 0;c[p >> 2] = 0;a: do if (c[e >> 2] | 0) {
              f = 0;g = 0;while (1) {
                if ((f | 0) == (g | 0)) vl(t, e);else {
                  c[f >> 2] = c[e >> 2];c[o >> 2] = (c[o >> 2] | 0) + 4;
                }e = e + 4 | 0;if (!(c[e >> 2] | 0)) break a;f = c[o >> 2] | 0;g = c[k >> 2] | 0;
              }
            } while (0);c[r >> 2] = c[h + 4 >> 2];c[s >> 2] = c[j >> 2];wl(d, a, r, s, u, t);e = c[t >> 2] | 0;f = e;if (e) {
              g = c[o >> 2] | 0;if ((g | 0) != (e | 0)) c[o >> 2] = g + (~((g + -4 - f | 0) >>> 2) << 2);wn(e);
            }e = c[u >> 2] | 0;f = e;if (e) {
              g = c[m >> 2] | 0;if ((g | 0) != (e | 0)) c[m >> 2] = g + (~((g + -4 - f | 0) >>> 2) << 2);wn(e);
            }
          }b = c[b >> 2] | 0;
        } while ((b | 0) != 0);
      }i = v;return;
    }function rl(a, b, d, e, f) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0,
          t = 0,
          u = 0,
          v = 0,
          w = 0,
          x = 0;x = i;i = i + 64 | 0;r = x + 52 | 0;l = x + 48 | 0;m = x + 44 | 0;n = x + 40 | 0;q = x + 36 | 0;o = x + 32 | 0;p = x + 28 | 0;u = x + 24 | 0;v = x + 20 | 0;w = x + 8 | 0;s = x + 4 | 0;t = x;j = fl() | 0;h = c[j >> 2] | 0;g = c[h >> 2] | 0;if (g) {
        k = c[j + 8 >> 2] | 0;j = c[j + 4 >> 2] | 0;while (1) {
          em(l, g);xl(a, l, j, k);h = h + 4 | 0;g = c[h >> 2] | 0;if (!g) break;else {
            k = k + 1 | 0;j = j + 1 | 0;
          }
        }
      }h = gl() | 0;g = c[h >> 2] | 0;if (g) do {
        em(m, g);c[n >> 2] = c[h + 4 >> 2];yl(b, m, n);h = h + 8 | 0;g = c[h >> 2] | 0;
      } while ((g | 0) != 0);g = c[(dl() | 0) >> 2] | 0;if (g) do {
        b = c[g + 4 >> 2] | 0;em(q, c[b >> 2] | 0);c[o >> 2] = c[b + 12 >> 2];zl(d, q, o);g = c[g >> 2] | 0;
      } while ((g | 0) != 0);em(p, 0);g = el() | 0;c[r >> 2] = c[p >> 2];ql(r, g, f);g = c[(dl() | 0) >> 2] | 0;if (g) {
        a = w + 4 | 0;m = w + 8 | 0;n = w + 8 | 0;do {
          l = c[g + 4 >> 2] | 0;em(u, c[l >> 2] | 0);Al(v, l + 16 | 0);h = c[v >> 2] | 0;if (h) {
            c[w >> 2] = 0;c[a >> 2] = 0;c[m >> 2] = 0;do {
              em(s, c[c[h + 4 >> 2] >> 2] | 0);j = c[a >> 2] | 0;if (j >>> 0 < (c[n >> 2] | 0) >>> 0) {
                c[j >> 2] = c[s >> 2];c[a >> 2] = (c[a >> 2] | 0) + 4;
              } else ul(w, s);h = c[h >> 2] | 0;
            } while ((h | 0) != 0);Bl(e, u, w);h = c[w >> 2] | 0;j = h;if (h) {
              k = c[a >> 2] | 0;if ((k | 0) != (h | 0)) c[a >> 2] = k + (~((k + -4 - j | 0) >>> 2) << 2);wn(h);
            }
          }c[t >> 2] = c[u >> 2];c[r >> 2] = c[t >> 2];ql(r, l + 24 | 0, f);h = c[v >> 2] | 0;if (h) do {
            d = h;h = c[h >> 2] | 0;wn(d);
          } while ((h | 0) != 0);c[v >> 2] = 0;g = c[g >> 2] | 0;
        } while ((g | 0) != 0);
      }i = x;return;
    }function sl(b, d) {
      b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0;q = i;i = i + 32 | 0;o = q + 16 | 0;e = q + 31 | 0;f = q + 30 | 0;g = q + 12 | 0;l = q + 8 | 0;m = q + 29 | 0;n = q + 4 | 0;h = q + 28 | 0;j = q;k = gm(b) | 0;c[o >> 2] = 0;p = o + 4 | 0;c[p >> 2] = 0;c[o + 8 >> 2] = 0;switch (k << 24 >> 24) {case 0:
          {
            a[e >> 0] = 0;h = Cl(d, e) | 0;break;
          }case 8:
          {
            h = fm(b) | 0;a[f >> 0] = 8;em(g, c[h + 4 >> 2] | 0);h = Dl(d, f, g, h + 8 | 0) | 0;break;
          }case 9:
          {
            h = fm(b) | 0;e = c[h + 4 >> 2] | 0;if (e) {
              j = o + 8 | 0;g = h + 12 | 0;while (1) {
                e = e + -1 | 0;em(l, c[g >> 2] | 0);f = c[p >> 2] | 0;if (f >>> 0 < (c[j >> 2] | 0) >>> 0) {
                  c[f >> 2] = c[l >> 2];c[p >> 2] = (c[p >> 2] | 0) + 4;
                } else ul(o, l);if (!e) break;else g = g + 4 | 0;
              }
            }a[m >> 0] = 9;em(n, c[h + 8 >> 2] | 0);h = El(d, m, n, o) | 0;break;
          }default:
          {
            n = fm(b) | 0;a[h >> 0] = k;em(j, c[n + 4 >> 2] | 0);h = Fl(d, h, j) | 0;
          }}e = c[o >> 2] | 0;f = e;if (e) {
        g = c[p >> 2] | 0;if ((g | 0) != (e | 0)) c[p >> 2] = g + (~((g + -4 - f | 0) >>> 2) << 2);wn(e);
      }i = q;return h | 0;
    }function tl(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;f = a + 8 | 0;g = c[a >> 2] | 0;d = g;if ((c[f >> 2] | 0) - d >> 2 >>> 0 < b >>> 0) {
        h = a + 4 | 0;d = (c[h >> 2] | 0) - d | 0;if (!b) e = 0;else e = un(b << 2) | 0;So(e | 0, g | 0, d | 0) | 0;c[a >> 2] = e;c[h >> 2] = e + (d >> 2 << 2);c[f >> 2] = e + (b << 2);if (g) wn(g);
      }return;
    }function ul(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0;i = a + 4 | 0;j = c[a >> 2] | 0;k = j;e = ((c[i >> 2] | 0) - k >> 2) + 1 | 0;if (e >>> 0 > 1073741823) tn(a);l = a + 8 | 0;f = j;d = (c[l >> 2] | 0) - f | 0;if (d >> 2 >>> 0 < 536870911) {
        d = d >> 1;d = d >>> 0 < e >>> 0 ? e : d;f = (c[i >> 2] | 0) - f | 0;e = f >> 2;if (!d) {
          h = 0;g = 0;d = f;
        } else m = 6;
      } else {
        f = (c[i >> 2] | 0) - f | 0;d = 1073741823;e = f >> 2;m = 6;
      }if ((m | 0) == 6) {
        h = d;g = un(d << 2) | 0;d = f;
      }c[g + (e << 2) >> 2] = c[b >> 2];So(g | 0, j | 0, d | 0) | 0;c[a >> 2] = g;c[i >> 2] = g + (e + 1 << 2);c[l >> 2] = g + (h << 2);if (k) wn(k);return;
    }function vl(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0;i = a + 4 | 0;j = c[a >> 2] | 0;k = j;e = ((c[i >> 2] | 0) - k >> 2) + 1 | 0;if (e >>> 0 > 1073741823) tn(a);l = a + 8 | 0;f = j;d = (c[l >> 2] | 0) - f | 0;if (d >> 2 >>> 0 < 536870911) {
        d = d >> 1;d = d >>> 0 < e >>> 0 ? e : d;f = (c[i >> 2] | 0) - f | 0;e = f >> 2;if (!d) {
          h = 0;g = 0;d = f;
        } else m = 6;
      } else {
        f = (c[i >> 2] | 0) - f | 0;d = 1073741823;e = f >> 2;m = 6;
      }if ((m | 0) == 6) {
        h = d;g = un(d << 2) | 0;d = f;
      }c[g + (e << 2) >> 2] = c[b >> 2];So(g | 0, j | 0, d | 0) | 0;c[a >> 2] = g;c[i >> 2] = g + (e + 1 << 2);c[l >> 2] = g + (h << 2);if (k) wn(k);return;
    }function wl(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0;l = i;i = i + 48 | 0;m = l + 40 | 0;k = l + 32 | 0;o = l + 24 | 0;j = l + 12 | 0;h = l;im(k);n = c[a >> 2] | 0;c[o >> 2] = c[b >> 2];a = c[d >> 2] | 0;e = c[e >> 2] | 0;Nl(j, f);_l(h, g);c[m >> 2] = c[o >> 2];$l(n, m, a, e, j, h);e = c[h >> 2] | 0;f = e;if (e) {
        b = h + 4 | 0;d = c[b >> 2] | 0;if ((d | 0) != (e | 0)) c[b >> 2] = d + (~((d + -4 - f | 0) >>> 2) << 2);wn(e);
      }e = c[j >> 2] | 0;f = e;if (e) {
        b = j + 4 | 0;d = c[b >> 2] | 0;if ((d | 0) != (e | 0)) c[b >> 2] = d + (~((d + -4 - f | 0) >>> 2) << 2);wn(e);
      }jm(k);i = l;return;
    }function xl(b, d, e, f) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0;g = i;i = i + 32 | 0;j = g + 16 | 0;h = g + 8 | 0;l = g;im(h);k = c[b >> 2] | 0;c[l >> 2] = c[d >> 2];e = a[e >> 0] | 0;b = a[f >> 0] | 0;c[j >> 2] = c[l >> 2];Yl(k, j, e, b);jm(h);i = g;return;
    }function yl(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0;e = i;i = i + 32 | 0;g = e + 16 | 0;f = e + 8 | 0;j = e;im(f);h = c[a >> 2] | 0;c[j >> 2] = c[b >> 2];a = c[d >> 2] | 0;c[g >> 2] = c[j >> 2];Wl(h, g, a);jm(f);i = e;return;
    }function zl(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0;e = i;i = i + 32 | 0;g = e + 16 | 0;f = e + 8 | 0;j = e;im(f);h = c[a >> 2] | 0;c[j >> 2] = c[b >> 2];a = c[d >> 2] | 0;c[g >> 2] = c[j >> 2];Wl(h, g, a);jm(f);i = e;return;
    }function Al(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0;c[a >> 2] = 0;b = c[b >> 2] | 0;if (b) {
        f = un(12) | 0;g = b + 4 | 0;d = c[g + 4 >> 2] | 0;e = f + 4 | 0;c[e >> 2] = c[g >> 2];c[e + 4 >> 2] = d;b = c[b >> 2] | 0;if (!b) b = f;else {
          e = f;while (1) {
            d = un(12) | 0;i = b + 4 | 0;h = c[i + 4 >> 2] | 0;g = d + 4 | 0;c[g >> 2] = c[i >> 2];c[g + 4 >> 2] = h;c[e >> 2] = d;b = c[b >> 2] | 0;if (!b) {
              b = d;break;
            } else e = d;
          }
        }c[b >> 2] = 0;c[a >> 2] = f;
      }return;
    }function Bl(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0;h = i;i = i + 32 | 0;e = h + 24 | 0;g = h + 16 | 0;j = h + 12 | 0;f = h;im(g);a = c[a >> 2] | 0;c[j >> 2] = c[b >> 2];Nl(f, d);c[e >> 2] = c[j >> 2];Ul(a, e, f);a = c[f >> 2] | 0;e = a;if (a) {
        b = f + 4 | 0;d = c[b >> 2] | 0;if ((d | 0) != (a | 0)) c[b >> 2] = d + (~((d + -4 - e | 0) >>> 2) << 2);wn(a);
      }jm(g);i = h;return;
    }function Cl(b, d) {
      b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0;e = i;i = i + 16 | 0;f = e;im(f);g = c[b >> 2] | 0;b = a[d >> 0] | 0;Tl() | 0;b = Db(0, c[990] | 0, g | 0, b & 255 | 0) | 0;jm(f);i = e;return b | 0;
    }function Dl(b, d, e, f) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0;g = i;i = i + 32 | 0;j = g + 16 | 0;h = g + 8 | 0;l = g;im(h);k = c[b >> 2] | 0;d = a[d >> 0] | 0;c[l >> 2] = c[e >> 2];b = c[f >> 2] | 0;c[j >> 2] = c[l >> 2];b = Rl(k, d, j, b) | 0;jm(h);i = g;return b | 0;
    }function El(b, d, e, f) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0;k = i;i = i + 32 | 0;g = k + 24 | 0;j = k + 16 | 0;m = k + 12 | 0;h = k;im(j);l = c[b >> 2] | 0;b = a[d >> 0] | 0;c[m >> 2] = c[e >> 2];Nl(h, f);c[g >> 2] = c[m >> 2];f = Ol(l, b, g, h) | 0;b = c[h >> 2] | 0;g = b;if (b) {
        e = h + 4 | 0;d = c[e >> 2] | 0;if ((d | 0) != (b | 0)) c[e >> 2] = d + (~((d + -4 - g | 0) >>> 2) << 2);wn(b);
      }jm(j);i = k;return f | 0;
    }function Fl(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0;f = i;i = i + 32 | 0;h = f + 16 | 0;g = f + 8 | 0;k = f;im(g);j = c[b >> 2] | 0;b = a[d >> 0] | 0;c[k >> 2] = c[e >> 2];c[h >> 2] = c[k >> 2];b = Gl(j, b, h) | 0;jm(g);i = f;return b | 0;
    }function Gl(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0;e = i;i = i + 16 | 0;f = e;Hl() | 0;g = c[950] | 0;c[f >> 2] = c[d >> 2];a = Cb(0, g | 0, a | 0, b & 255 | 0, Il(f) | 0) | 0;i = e;return a | 0;
    }function Hl() {
      var b = 0;if (!(a[360] | 0)) {
        c[948] = 3876;c[949] = 2;c[950] = pb(3876, 3) | 0;b = 360;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3792;
    }function Il(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0,
          g = 0;f = i;i = i + 32 | 0;e = f + 12 | 0;b = f;Jl() | 0;d = c[960] | 0;if (!d) {
        e = cm(8) | 0;b = e;d = un(4) | 0;c[d >> 2] = c[a >> 2];g = b + 4 | 0;c[g >> 2] = d;a = un(8) | 0;g = c[g >> 2] | 0;c[a >> 2] = g;d = un(16) | 0;c[d + 4 >> 2] = 0;c[d + 8 >> 2] = 0;c[d >> 2] = 3856;c[d + 12 >> 2] = g;c[a + 4 >> 2] = d;c[e >> 2] = a;
      } else {
        c[e >> 2] = d;g = e + 4 | 0;c[g >> 2] = e;c[e + 8 >> 2] = 0;c[b >> 2] = d;c[b + 4 >> 2] = e;c[b + 8 >> 2] = 0;hm(a, b);b = c[(c[g >> 2] | 0) + 8 >> 2] | 0;
      }i = f;return b | 0;
    }function Jl() {
      var b = 0;if (!(a[352] | 0)) {
        c[955] = 0;c[956] = 0;c[957] = 0;c[958] = 3828;c[960] = 0;a[3844] = 0;a[3845] = 0;sb(34, 3804, n | 0) | 0;b = 352;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3804;
    }function Kl(a) {
      a = a | 0;Ho(a);wn(a);return;
    }function Ll(a) {
      a = a | 0;a = c[a + 12 >> 2] | 0;if (a) wn(a);return;
    }function Ml(a) {
      a = a | 0;wn(a);return;
    }function Nl(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;c[a >> 2] = 0;g = a + 4 | 0;c[g >> 2] = 0;c[a + 8 >> 2] = 0;e = b + 4 | 0;f = (c[e >> 2] | 0) - (c[b >> 2] | 0) >> 2;if ((f | 0) != 0 ? (Ql(a, f), d = c[b >> 2] | 0, h = c[e >> 2] | 0, (d | 0) != (h | 0)) : 0) {
        e = c[g >> 2] | 0;do {
          c[e >> 2] = c[d >> 2];e = (c[g >> 2] | 0) + 4 | 0;c[g >> 2] = e;d = d + 4 | 0;
        } while ((d | 0) != (h | 0));
      }return;
    }function Ol(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0;l = i;i = i + 16 | 0;g = l;Pl() | 0;k = c[974] | 0;h = b & 255;c[g >> 2] = c[d >> 2];g = Il(g) | 0;j = c[e >> 2] | 0;b = e + 4 | 0;d = c[b >> 2] | 0;c[e + 8 >> 2] = 0;c[b >> 2] = 0;c[e >> 2] = 0;e = j;d = d - j | 0;b = d >> 2;d = cm(d + 4 | 0) | 0;c[d >> 2] = b;if (b) {
        f = 0;do {
          c[d + 4 + (f << 2) >> 2] = Il(e + (f << 2) | 0) | 0;f = f + 1 | 0;
        } while ((f | 0) != (b | 0));
      }b = Bb(0, k | 0, a | 0, h | 0, g | 0, d | 0) | 0;if (j) wn(j);i = l;return b | 0;
    }function Pl() {
      var b = 0;if (!(a[368] | 0)) {
        c[972] = 3900;c[973] = 3;c[974] = pb(3900, 4) | 0;b = 368;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3888;
    }function Ql(a, b) {
      a = a | 0;b = b | 0;var d = 0;if (b >>> 0 > 1073741823) tn(a);else {
        d = un(b << 2) | 0;c[a + 4 >> 2] = d;c[a >> 2] = d;c[a + 8 >> 2] = d + (b << 2);return;
      }
    }function Rl(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;f = i;i = i + 16 | 0;g = f;Sl() | 0;h = c[983] | 0;c[g >> 2] = c[d >> 2];a = Bb(0, h | 0, a | 0, b & 255 | 0, Il(g) | 0, e | 0) | 0;i = f;return a | 0;
    }function Sl() {
      var b = 0;if (!(a[376] | 0)) {
        c[981] = 3936;c[982] = 3;c[983] = pb(3936, 4) | 0;b = 376;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3924;
    }function Tl() {
      var b = 0;if (!(a[384] | 0)) {
        c[988] = 3964;c[989] = 1;c[990] = pb(3964, 2) | 0;b = 384;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3952;
    }function Ul(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0;k = i;i = i + 16 | 0;g = k;Vl() | 0;j = c[995] | 0;c[g >> 2] = c[b >> 2];g = Il(g) | 0;h = c[d >> 2] | 0;e = d + 4 | 0;b = c[e >> 2] | 0;c[d + 8 >> 2] = 0;c[e >> 2] = 0;c[d >> 2] = 0;e = h;d = b - h | 0;b = d >> 2;d = cm(d + 4 | 0) | 0;c[d >> 2] = b;if (b) {
        f = 0;do {
          c[d + 4 + (f << 2) >> 2] = Il(e + (f << 2) | 0) | 0;f = f + 1 | 0;
        } while ((f | 0) != (b | 0));
      }Cb(0, j | 0, a | 0, g | 0, d | 0) | 0;if (h) wn(h);i = k;return;
    }function Vl() {
      var b = 0;if (!(a[392] | 0)) {
        c[993] = 3984;c[994] = 2;c[995] = pb(3984, 3) | 0;b = 392;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3972;
    }function Wl(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0;e = i;i = i + 16 | 0;f = e;Xl() | 0;g = c[1001] | 0;c[f >> 2] = c[b >> 2];Cb(0, g | 0, a | 0, Il(f) | 0, d | 0) | 0;i = e;return;
    }function Xl() {
      var b = 0;if (!(a[400] | 0)) {
        c[999] = 4008;c[1e3] = 2;c[1001] = pb(4008, 3) | 0;b = 400;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 3996;
    }function Yl(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;f = i;i = i + 16 | 0;g = f;Zl() | 0;h = c[1011] | 0;c[g >> 2] = c[b >> 2];Bb(0, h | 0, a | 0, Il(g) | 0, d & 255 | 0, e & 255 | 0) | 0;i = f;return;
    }function Zl() {
      var b = 0;if (!(a[408] | 0)) {
        c[1009] = 4048;c[1010] = 3;c[1011] = pb(4048, 4) | 0;b = 408;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 4036;
    }function _l(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;c[a >> 2] = 0;g = a + 4 | 0;c[g >> 2] = 0;c[a + 8 >> 2] = 0;e = b + 4 | 0;f = (c[e >> 2] | 0) - (c[b >> 2] | 0) >> 2;if ((f | 0) != 0 ? (bm(a, f), d = c[b >> 2] | 0, h = c[e >> 2] | 0, (d | 0) != (h | 0)) : 0) {
        e = c[g >> 2] | 0;do {
          c[e >> 2] = c[d >> 2];e = (c[g >> 2] | 0) + 4 | 0;c[g >> 2] = e;d = d + 4 | 0;
        } while ((d | 0) != (h | 0));
      }return;
    }function $l(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0;p = i;i = i + 16 | 0;l = p;am() | 0;o = c[1018] | 0;c[l >> 2] = c[b >> 2];l = Il(l) | 0;m = c[f >> 2] | 0;b = f + 4 | 0;k = c[b >> 2] | 0;c[f + 8 >> 2] = 0;c[b >> 2] = 0;c[f >> 2] = 0;f = m;k = k - m | 0;b = k >> 2;k = cm(k + 4 | 0) | 0;c[k >> 2] = b;if (b) {
        h = 0;do {
          c[k + 4 + (h << 2) >> 2] = Il(f + (h << 2) | 0) | 0;h = h + 1 | 0;
        } while ((h | 0) != (b | 0));
      }j = c[g >> 2] | 0;f = g + 4 | 0;h = c[f >> 2] | 0;c[g + 8 >> 2] = 0;c[f >> 2] = 0;c[g >> 2] = 0;f = j;g = h - j | 0;h = g >> 2;g = cm(g + 4 | 0) | 0;c[g >> 2] = h;if (!h) {
        zb(0, o | 0, a | 0, l | 0, d | 0, e | 0, k | 0, g | 0) | 0;if (j) n = 7;
      } else {
        b = 0;do {
          c[g + 4 + (b << 2) >> 2] = c[f + (b << 2) >> 2];b = b + 1 | 0;
        } while ((b | 0) != (h | 0));zb(0, o | 0, a | 0, l | 0, d | 0, e | 0, k | 0, g | 0) | 0;n = 7;
      }if ((n | 0) == 7) wn(j);if (m) wn(m);i = p;return;
    }function am() {
      var b = 0;if (!(a[416] | 0)) {
        c[1016] = 4076;c[1017] = 5;c[1018] = pb(4076, 6) | 0;b = 416;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 4064;
    }function bm(a, b) {
      a = a | 0;b = b | 0;var d = 0;if (b >>> 0 > 1073741823) tn(a);else {
        d = un(b << 2) | 0;c[a + 4 >> 2] = d;c[a >> 2] = d;c[a + 8 >> 2] = d + (b << 2);return;
      }
    }function cm(a) {
      a = a | 0;var b = 0,
          d = 0;a = a + 7 & -8;if (a >>> 0 <= 32768 ? (b = c[1027] | 0, a >>> 0 <= (65536 - b | 0) >>> 0) : 0) {
        d = (c[1028] | 0) + b | 0;c[1027] = b + a;a = d;
      } else {
        a = vn(a + 8 | 0) | 0;c[a >> 2] = c[1029];c[1029] = a;a = a + 8 | 0;
      }return a | 0;
    }function dm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;a: while (1) {
        d = c[1029] | 0;while (1) {
          if ((d | 0) == (b | 0)) break a;e = c[d >> 2] | 0;c[1029] = e;if (!d) d = e;else break;
        }wn(d);
      }c[1027] = a;return;
    }function em(a, b) {
      a = a | 0;b = b | 0;c[a >> 2] = b;return;
    }function fm(a) {
      a = a | 0;return c[a >> 2] | 0;
    }function gm(b) {
      b = b | 0;return a[c[b >> 2] >> 0] | 0;
    }function hm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;d = i;i = i + 16 | 0;e = d;c[e >> 2] = c[a >> 2];a = mm(c[b >> 2] | 0, e) | 0;c[(c[b + 4 >> 2] | 0) + 8 >> 2] = a;i = d;return;
    }function im(a) {
      a = a | 0;c[a >> 2] = c[1027];c[a + 4 >> 2] = c[1029];return;
    }function jm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;e = c[a >> 2] | 0;d = c[a + 4 >> 2] | 0;a: while (1) {
        a = c[1029] | 0;while (1) {
          if ((a | 0) == (d | 0)) break a;b = c[a >> 2] | 0;c[1029] = b;if (!a) a = b;else break;
        }wn(a);
      }c[1027] = e;return;
    }function km() {
      nm();return;
    }function lm() {
      c[1028] = vn(65536) | 0;pm(4140);qm(4144);return;
    }function mm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0;f = c[1027] | 0;e = c[1029] | 0;a = c[a >> 2] | 0;d = c[b >> 2] | 0;om() | 0;d = Db(0, c[1032] | 0, a | 0, d | 0) | 0;a: while (1) {
        b = c[1029] | 0;while (1) {
          if ((b | 0) == (e | 0)) break a;a = c[b >> 2] | 0;c[1029] = a;if (!b) b = a;else break;
        }wn(b);
      }c[1027] = f;return d | 0;
    }function nm() {
      var b = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0;q = i;Fb(65536, 4108, c[1028] | 0, 4116);f = fl() | 0;e = c[f >> 2] | 0;b = c[e >> 2] | 0;if (b) {
        g = c[f + 8 >> 2] | 0;f = c[f + 4 >> 2] | 0;while (1) {
          jb(b | 0, d[f >> 0] | 0, a[g >> 0] | 0);e = e + 4 | 0;b = c[e >> 2] | 0;if (!b) break;else {
            g = g + 1 | 0;f = f + 1 | 0;
          }
        }
      }e = gl() | 0;b = c[e >> 2] | 0;if (b) do {
        Ya(b | 0, c[e + 4 >> 2] | 0);e = e + 8 | 0;b = c[e >> 2] | 0;
      } while ((b | 0) != 0);Ya(8418, 8638);e = dl() | 0;b = c[e >> 2] | 0;f = (b | 0) == 0;a: do if (!f) {
        g = b;do {
          a[(c[g + 4 >> 2] | 0) + 40 >> 0] = 0;g = c[g >> 2] | 0;
        } while ((g | 0) != 0);if (!f) while (1) {
          g = e;h = e;e = b;while (1) {
            f = e;e = c[e >> 2] | 0;f = c[f + 4 >> 2] | 0;b = f + 40 | 0;if (!(a[b >> 0] | 0)) {
              n = e;break;
            }n = c[g >> 2] | 0;c[h >> 2] = c[n >> 2];wn(n);if (!e) break a;
          }a[b >> 0] = 1;e = c[h >> 2] | 0;j = f + 20 | 0;b = c[j >> 2] | 0;k = ib() | 0;l = i;i = i + ((1 * (b << 2) | 0) + 15 & -16) | 0;m = i;i = i + ((1 * (b << 2) | 0) + 15 & -16) | 0;b = c[f + 16 >> 2] | 0;if (b) {
            g = l;h = m;while (1) {
              r = b;c[g >> 2] = c[c[r + 4 >> 2] >> 2];c[h >> 2] = c[r + 8 >> 2];b = c[b >> 2] | 0;if (!b) break;else {
                g = g + 4 | 0;h = h + 4 | 0;
              }
            }
          }eb(f | 0, c[f + 8 >> 2] | 0, l | 0, m | 0, c[j >> 2] | 0, c[f + 32 >> 2] | 0, c[f + 12 >> 2] | 0);Na(k | 0);if (!n) break;else b = n;
        }
      } while (0);b = c[(el() | 0) >> 2] | 0;if (b) do {
        r = b;n = c[r + 16 >> 2] | 0;qb(0, c[n + 8 >> 2] | 0, c[n + 12 >> 2] | 0, (c[n + 16 >> 2] | 0) + 1 | 0, c[n + 4 >> 2] | 0, c[r + 8 >> 2] | 0, c[n >> 2] | 0, c[r + 4 >> 2] | 0, c[r + 12 >> 2] | 0, c[r + 20 >> 2] | 0);b = c[b >> 2] | 0;
      } while ((b | 0) != 0);b = c[(dl() | 0) >> 2] | 0;b: do if (b) {
        c: while (1) {
          e = c[b + 4 >> 2] | 0;if ((e | 0) != 0 ? (o = c[e >> 2] | 0, p = c[e + 24 >> 2] | 0, (p | 0) != 0) : 0) {
            f = p;do {
              e = f;g = e + 4 | 0;h = c[e + 16 >> 2] | 0;d: do if (h) {
                j = c[h >> 2] | 0;switch (j | 0) {case 0:
                    break c;case 4:case 3:case 2:
                    {
                      qb(o | 0, c[h + 8 >> 2] | 0, c[h + 12 >> 2] | 0, (c[h + 16 >> 2] | 0) + 1 | 0, c[h + 4 >> 2] | 0, 0, j | 0, c[g >> 2] | 0, c[e + 12 >> 2] | 0, c[e + 20 >> 2] | 0);break d;
                    }case 1:
                    {
                      qb(o | 0, c[h + 8 >> 2] | 0, c[h + 12 >> 2] | 0, (c[h + 16 >> 2] | 0) + 1 | 0, c[h + 4 >> 2] | 0, c[e + 8 >> 2] | 0, 1, c[g >> 2] | 0, c[e + 12 >> 2] | 0, c[e + 20 >> 2] | 0);break d;
                    }case 5:
                    {
                      qb(o | 0, c[h + 8 >> 2] | 0, c[h + 12 >> 2] | 0, (c[h + 16 >> 2] | 0) + 1 | 0, c[h + 4 >> 2] | 0, c[h + 20 >> 2] | 0, 5, 0, 0, 0);break d;
                    }default:
                    break d;}
              } while (0);f = c[f >> 2] | 0;
            } while ((f | 0) != 0);
          }b = c[b >> 2] | 0;if (!b) break b;
        }fb();
      } while (0);Ga();i = q;return;
    }function om() {
      var b = 0;if (!(a[424] | 0)) {
        c[1030] = 4132;c[1031] = 1;c[1032] = pb(4132, 2) | 0;b = 424;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 4120;
    }function pm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0;ym(a, 8723);b = c[a >> 2] | 0;zm() | 0;b = b + 28 | 0;e = c[b >> 2] | 0;f = un(24) | 0;c[f + 4 >> 2] = 0;c[f + 8 >> 2] = 0;c[f + 12 >> 2] = 0;c[f + 16 >> 2] = 4200;c[f + 20 >> 2] = 0;d = e;c[f >> 2] = c[d >> 2];c[e >> 2] = f;c[b >> 2] = c[d >> 2];Am(a, 8729, 25, 0);Bm(a, 8740, 3, 0);Cm(a, 8748, 12, 0);Dm(a, 8758, 20, 0);Em(a, 8765, 26, 0);return;
    }function qm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;rm(a, 8715);a = c[a >> 2] | 0;sm() | 0;a = a + 28 | 0;d = c[a >> 2] | 0;e = un(24) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e + 12 >> 2] = 0;c[e + 16 >> 2] = 4148;c[e + 20 >> 2] = 0;b = d;c[e >> 2] = c[b >> 2];c[d >> 2] = e;c[a >> 2] = c[b >> 2];return;
    }function rm(b, d) {
      b = b | 0;d = d | 0;Jl() | 0;c[b >> 2] = 3804;c[951] = 8637;c[952] = 4192;c[954] = d;if (!(a[296] | 0)) {
        c[839] = c[838];c[840] = 0;d = 296;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[953] = 3356;c[959] = 11;hl(c[b >> 2] | 0);return;
    }function sm() {
      var b = 0;if (!(a[432] | 0)) {
        c[1037] = 5;c[1038] = 21;c[1039] = 1832;c[1040] = 4184;c[1041] = 1;c[1043] = 0;c[1044] = 0;c[1045] = 0;c[1042] = 27;sb(70, 4148, n | 0) | 0;b = 432;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1037] | 0)) {
        c[1037] = 5;c[1038] = 21;c[1039] = 1832;c[1040] = 4184;c[1041] = 1;c[1043] = 0;c[1044] = 0;c[1045] = 0;c[1042] = 27;
      }return 4148;
    }function tm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0;d = cm(8) | 0;b = d;e = un(4) | 0;c[e >> 2] = a;f = b + 4 | 0;c[f >> 2] = e;a = un(8) | 0;f = c[f >> 2] | 0;c[a >> 2] = f;e = un(16) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e >> 2] = 3856;c[e + 12 >> 2] = f;c[a + 4 >> 2] = e;c[d >> 2] = a;return b | 0;
    }function um(b, d) {
      b = b | 0;d = d | 0;c[b + 4 >> 2] = d;a[b + 8 >> 0] = 1;return;
    }function vm(a) {
      a = a | 0;wm(a + 24 | 0);return;
    }function wm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function xm(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) wn(b);return;
    }function ym(b, d) {
      b = b | 0;d = d | 0;rn() | 0;c[b >> 2] = 4524;c[1131] = 8772;c[1132] = 4488;c[1134] = d;if (!(a[224] | 0)) {
        c[757] = 0;c[758] = 0;d = 224;c[d >> 2] = 1;c[d + 4 >> 2] = 0;
      }c[1133] = 3028;c[1139] = 12;hl(c[b >> 2] | 0);return;
    }function zm() {
      var b = 0;if (!(a[480] | 0)) {
        c[1050] = 5;c[1051] = 7;c[1052] = 1832;c[1053] = 4484;c[1054] = 0;c[1056] = 0;c[1057] = 0;c[1058] = 0;c[1055] = 71;sb(72, 4200, n | 0) | 0;b = 480;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1050] | 0)) {
        c[1050] = 5;c[1051] = 7;c[1052] = 1832;c[1053] = 4484;c[1054] = 0;c[1056] = 0;c[1057] = 0;c[1058] = 0;c[1055] = 71;
      }return 4200;
    }function Am(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;dn() | 0;h = en(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 4436;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Bm(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;Ym() | 0;h = Zm(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 4376;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Cm(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;Rm() | 0;h = Sm(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 4328;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Dm(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;Lm() | 0;h = Mm(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 4284;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Em(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0;a = c[a >> 2] | 0;Fm() | 0;h = Gm(d, e) | 0;a = a + 28 | 0;f = c[a >> 2] | 0;g = un(24) | 0;c[g + 4 >> 2] = b;c[g + 8 >> 2] = d;c[g + 12 >> 2] = h;c[g + 16 >> 2] = 4236;c[g + 20 >> 2] = e;b = f;c[g >> 2] = c[b >> 2];c[f >> 2] = g;c[a >> 2] = c[b >> 2];return;
    }function Fm() {
      var b = 0;if (!(a[440] | 0)) {
        c[1059] = 1;c[1060] = 10;c[1061] = 1832;c[1062] = 4272;c[1063] = 2;c[1065] = 0;c[1066] = 0;c[1067] = 0;sb(73, 4236, n | 0) | 0;b = 440;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1059] | 0)) {
        c[1059] = 0;c[1060] = 0;c[1061] = 0;c[1062] = 0;c[1063] = 0;c[1064] = 0;c[1065] = 0;c[1066] = 0;c[1059] = 1;c[1060] = 10;c[1061] = 1832;c[1062] = 4272;c[1063] = 2;c[1065] = 0;c[1066] = 0;c[1067] = 0;
      }return 4236;
    }function Gm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;Fm() | 0;b = b | 4;c[f >> 2] = b;d = c[1066] | 0;if (d >>> 0 < (c[1067] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[1066] = b;
      } else {
        Hm(4260, e, f);b = c[1066] | 0;
      }i = g;return (b - (c[1065] | 0) >> 3) + -1 | 0;
    }function Hm(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function Im(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;Fm() | 0;Mb[c[(c[4260 >> 2] | 0) + (a << 3) >> 2] & 31](b, d);return;
    }function Jm(a) {
      a = a | 0;Km(a + 24 | 0);return;
    }function Km(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Lm() {
      var b = 0;if (!(a[448] | 0)) {
        c[1071] = 1;c[1072] = 13;c[1073] = 1832;c[1074] = 4320;c[1075] = 1;c[1077] = 0;c[1078] = 0;c[1079] = 0;sb(74, 4284, n | 0) | 0;b = 448;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1071] | 0)) {
        c[1071] = 0;c[1072] = 0;c[1073] = 0;c[1074] = 0;c[1075] = 0;c[1076] = 0;c[1077] = 0;c[1078] = 0;c[1071] = 1;c[1072] = 13;c[1073] = 1832;c[1074] = 4320;c[1075] = 1;c[1077] = 0;c[1078] = 0;c[1079] = 0;
      }return 4284;
    }function Mm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;Lm() | 0;b = b | 4;c[f >> 2] = b;d = c[1078] | 0;if (d >>> 0 < (c[1079] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[1078] = b;
      } else {
        Nm(4308, e, f);b = c[1078] | 0;
      }i = g;return (b - (c[1077] | 0) >> 3) + -1 | 0;
    }function Nm(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function Om(a, b) {
      a = a | 0;b = b | 0;Lm() | 0;return Nb[c[(c[4308 >> 2] | 0) + (a << 3) >> 2] & 31](b) | 0;
    }function Pm(a) {
      a = a | 0;Qm(a + 24 | 0);return;
    }function Qm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Rm() {
      var b = 0;if (!(a[456] | 0)) {
        c[1082] = 1;c[1083] = 9;c[1084] = 1832;c[1085] = 4364;c[1086] = 2;c[1088] = 0;c[1089] = 0;c[1090] = 0;sb(75, 4328, n | 0) | 0;b = 456;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1082] | 0)) {
        c[1082] = 0;c[1083] = 0;c[1084] = 0;c[1085] = 0;c[1086] = 0;c[1087] = 0;c[1088] = 0;c[1089] = 0;c[1082] = 1;c[1083] = 9;c[1084] = 1832;c[1085] = 4364;c[1086] = 2;c[1088] = 0;c[1089] = 0;c[1090] = 0;
      }return 4328;
    }function Sm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;Rm() | 0;b = b | 4;c[f >> 2] = b;d = c[1089] | 0;if (d >>> 0 < (c[1090] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[1089] = b;
      } else {
        Tm(4352, e, f);b = c[1089] | 0;
      }i = g;return (b - (c[1088] | 0) >> 3) + -1 | 0;
    }function Tm(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function Um(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;Rm() | 0;return Xm(c[(c[1088] | 0) + (a << 3) >> 2] | 0, b, d) | 0;
    }function Vm(a) {
      a = a | 0;Wm(a + 24 | 0);return;
    }function Wm(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function Xm(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0;k = i;i = i + 32 | 0;f = k + 8 | 0;g = k + 4 | 0;j = k;h = d;if (!(h & 1)) c[g >> 2] = c[d >> 2];else {
        c[f >> 2] = 0;l = f + 4 | 0;c[l >> 2] = 0;d = f + 8 | 0;a[d >> 0] = 0;Ta(h | 0, f | 0) | 0;c[g >> 2] = c[l >> 2];a[d >> 0] = 0;
      }c[j >> 2] = e;c[f >> 2] = c[g >> 2];g = Ub[b & 15](f, j) | 0;if (g) rb(g | 0);f = c[j >> 2] | 0;if (f) rb(f | 0);i = k;return g | 0;
    }function Ym() {
      var b = 0;if (!(a[464] | 0)) {
        c[1094] = 1;c[1095] = 3;c[1096] = 1832;c[1097] = 4412;c[1098] = 5;c[1100] = 0;c[1101] = 0;c[1102] = 0;sb(76, 4376, n | 0) | 0;b = 464;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1094] | 0)) {
        c[1094] = 0;c[1095] = 0;c[1096] = 0;c[1097] = 0;c[1098] = 0;c[1099] = 0;c[1100] = 0;c[1101] = 0;c[1094] = 1;c[1095] = 3;c[1096] = 1832;c[1097] = 4412;c[1098] = 5;c[1100] = 0;c[1101] = 0;c[1102] = 0;
      }return 4376;
    }function Zm(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;Ym() | 0;b = b | 4;c[f >> 2] = b;d = c[1101] | 0;if (d >>> 0 < (c[1102] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[1101] = b;
      } else {
        _m(4400, e, f);b = c[1101] | 0;
      }i = g;return (b - (c[1100] | 0) >> 3) + -1 | 0;
    }function _m(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function $m(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;Ym() | 0;cn(c[(c[1100] | 0) + (a << 3) >> 2] | 0, b, d, e, f, g);return;
    }function an(a) {
      a = a | 0;bn(a + 24 | 0);return;
    }function bn(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function cn(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;m = i;i = i + 32 | 0;l = m + 16 | 0;k = m + 12 | 0;j = m + 8 | 0;h = m + 4 | 0;n = m;c[l >> 2] = b;c[k >> 2] = d;c[j >> 2] = e;c[h >> 2] = f;c[n >> 2] = g;Ib[a & 3](l, k, j, h, n);b = c[n >> 2] | 0;if (b) rb(b | 0);b = c[h >> 2] | 0;if (b) rb(b | 0);b = c[j >> 2] | 0;if (b) rb(b | 0);b = c[k >> 2] | 0;if (b) rb(b | 0);b = c[l >> 2] | 0;if (b) rb(b | 0);i = m;return;
    }function dn() {
      var b = 0;if (!(a[472] | 0)) {
        c[1109] = 1;c[1110] = 11;c[1111] = 1832;c[1112] = 4472;c[1113] = 2;c[1115] = 0;c[1116] = 0;c[1117] = 0;sb(77, 4436, n | 0) | 0;b = 472;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }if (!(c[1109] | 0)) {
        c[1109] = 0;c[1110] = 0;c[1111] = 0;c[1112] = 0;c[1113] = 0;c[1114] = 0;c[1115] = 0;c[1116] = 0;c[1109] = 1;c[1110] = 11;c[1111] = 1832;c[1112] = 4472;c[1113] = 2;c[1115] = 0;c[1116] = 0;c[1117] = 0;
      }return 4436;
    }function en(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;e = g + 4 | 0;f = g;c[e >> 2] = a;dn() | 0;b = b | 4;c[f >> 2] = b;d = c[1116] | 0;if (d >>> 0 < (c[1117] | 0) >>> 0) {
        c[d >> 2] = a;c[d + 4 >> 2] = b;b = d + 8 | 0;c[1116] = b;
      } else {
        fn(4460, e, f);b = c[1116] | 0;
      }i = g;return (b - (c[1115] | 0) >> 3) + -1 | 0;
    }function fn(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;j = a + 4 | 0;k = c[a >> 2] | 0;l = k;f = ((c[j >> 2] | 0) - l >> 3) + 1 | 0;if (f >>> 0 > 536870911) tn(a);m = a + 8 | 0;g = k;e = (c[m >> 2] | 0) - g | 0;if (e >> 3 >>> 0 < 268435455) {
        e = e >> 2;e = e >>> 0 < f >>> 0 ? f : e;g = (c[j >> 2] | 0) - g | 0;f = g >> 3;if (!e) {
          i = 0;h = 0;e = g;
        } else n = 6;
      } else {
        g = (c[j >> 2] | 0) - g | 0;e = 536870911;f = g >> 3;n = 6;
      }if ((n | 0) == 6) {
        i = e;h = un(e << 3) | 0;e = g;
      }n = c[d >> 2] | 0;c[h + (f << 3) >> 2] = c[b >> 2];c[h + (f << 3) + 4 >> 2] = n;So(h | 0, k | 0, e | 0) | 0;c[a >> 2] = h;c[j >> 2] = h + (f + 1 << 3);c[m >> 2] = h + (i << 3);if (l) wn(l);return;
    }function gn(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0;e = i;i = i + 16 | 0;f = e;dn() | 0;a = c[(c[1115] | 0) + (a << 3) >> 2] | 0;c[f >> 2] = d;Mb[a & 31](b, f);b = c[f >> 2] | 0;if (b) rb(b | 0);i = e;return;
    }function hn(a) {
      a = a | 0;jn(a + 24 | 0);return;
    }function jn(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function kn() {
      var a = 0,
          b = 0,
          d = 0,
          e = 0,
          f = 0;b = cm(8) | 0;a = b;f = a + 4 | 0;c[f >> 2] = un(1) | 0;d = un(8) | 0;f = c[f >> 2] | 0;c[d >> 2] = f;e = un(16) | 0;c[e + 4 >> 2] = 0;c[e + 8 >> 2] = 0;c[e >> 2] = 4504;c[e + 12 >> 2] = f;c[d + 4 >> 2] = e;c[b >> 2] = d;return a | 0;
    }function ln(b) {
      b = b | 0;a[b + 8 >> 0] = 1;return;
    }function mn(a) {
      a = a | 0;nn(a + 24 | 0);return;
    }function nn(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0;d = c[a >> 2] | 0;e = d;if (d) {
        a = a + 4 | 0;b = c[a >> 2] | 0;if ((b | 0) != (d | 0)) c[a >> 2] = b + (~((b + -8 - e | 0) >>> 3) << 3);wn(d);
      }return;
    }function on(a) {
      a = a | 0;Ho(a);wn(a);return;
    }function pn(a) {
      a = a | 0;a = c[a + 12 >> 2] | 0;if (a) wn(a);return;
    }function qn(a) {
      a = a | 0;wn(a);return;
    }function rn() {
      var b = 0;if (!(a[488] | 0)) {
        c[1135] = 0;c[1136] = 0;c[1137] = 0;c[1138] = 4548;c[1140] = 0;a[4564] = 0;a[4565] = 0;sb(34, 4524, n | 0) | 0;b = 488;c[b >> 2] = 1;c[b + 4 >> 2] = 0;
      }return 4524;
    }function sn(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((e & 896 | 0) == 512) {
        if (d) {
          a = c[d + 4 >> 2] | 0;if (a) Jo(a);wn(d);
        }
      } else if (b) wn(b);return;
    }function tn(a) {
      a = a | 0;Oa(8916, 8939, 303, 9025);
    }function un(a) {
      a = a | 0;var b = 0;b = (a | 0) == 0 ? 1 : a;a = Co(b) | 0;a: do if (!a) {
        while (1) {
          a = An() | 0;if (!a) break;bc[a & 0]();a = Co(b) | 0;if (a) break a;
        }b = Pa(4) | 0;c[b >> 2] = 4576;tb(b | 0, 496, 18);
      } while (0);return a | 0;
    }function vn(a) {
      a = a | 0;return un(a) | 0;
    }function wn(a) {
      a = a | 0;Do(a);return;
    }function xn(a) {
      a = a | 0;return;
    }function yn(a) {
      a = a | 0;wn(a);return;
    }function zn(a) {
      a = a | 0;return 9046;
    }function An() {
      var a = 0;a = c[1147] | 0;c[1147] = a + 0;return a | 0;
    }function Bn(a) {
      a = a | 0;return;
    }function Cn(a) {
      a = a | 0;return;
    }function Dn(a) {
      a = a | 0;return;
    }function En(a) {
      a = a | 0;return;
    }function Fn(a) {
      a = a | 0;return;
    }function Gn(a) {
      a = a | 0;wn(a);return;
    }function Hn(a) {
      a = a | 0;wn(a);return;
    }function In(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0;h = i;i = i + 64 | 0;g = h;if ((a | 0) != (b | 0)) {
        if ((b | 0) != 0 ? (f = Mn(b, 528, 544, 0) | 0, (f | 0) != 0) : 0) {
          b = g;e = b + 56 | 0;do {
            c[b >> 2] = 0;b = b + 4 | 0;
          } while ((b | 0) < (e | 0));c[g >> 2] = f;c[g + 8 >> 2] = a;c[g + 12 >> 2] = -1;c[g + 48 >> 2] = 1;ec[c[(c[f >> 2] | 0) + 28 >> 2] & 15](f, g, c[d >> 2] | 0, 1);if ((c[g + 24 >> 2] | 0) == 1) {
            c[d >> 2] = c[g + 16 >> 2];b = 1;
          } else b = 0;
        } else b = 0;
      } else b = 1;i = h;return b | 0;
    }function Jn(b, d, e, f) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0;b = d + 16 | 0;g = c[b >> 2] | 0;do if (g) {
        if ((g | 0) != (e | 0)) {
          f = d + 36 | 0;c[f >> 2] = (c[f >> 2] | 0) + 1;c[d + 24 >> 2] = 2;a[d + 54 >> 0] = 1;break;
        }b = d + 24 | 0;if ((c[b >> 2] | 0) == 2) c[b >> 2] = f;
      } else {
        c[b >> 2] = e;c[d + 24 >> 2] = f;c[d + 36 >> 2] = 1;
      } while (0);return;
    }function Kn(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((a | 0) == (c[b + 8 >> 2] | 0)) Jn(0, b, d, e);return;
    }function Ln(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;if ((a | 0) == (c[b + 8 >> 2] | 0)) Jn(0, b, d, e);else {
        a = c[a + 8 >> 2] | 0;ec[c[(c[a >> 2] | 0) + 28 >> 2] & 15](a, b, d, e);
      }return;
    }function Mn(d, e, f, g) {
      d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0;r = i;i = i + 64 | 0;q = r;p = c[d >> 2] | 0;o = d + (c[p + -8 >> 2] | 0) | 0;p = c[p + -4 >> 2] | 0;c[q >> 2] = f;c[q + 4 >> 2] = d;c[q + 8 >> 2] = e;c[q + 12 >> 2] = g;g = q + 16 | 0;d = q + 20 | 0;e = q + 24 | 0;h = q + 28 | 0;j = q + 32 | 0;k = q + 40 | 0;l = (p | 0) == (f | 0);m = g;n = m + 36 | 0;do {
        c[m >> 2] = 0;m = m + 4 | 0;
      } while ((m | 0) < (n | 0));b[g + 36 >> 1] = 0;a[g + 38 >> 0] = 0;a: do if (l) {
        c[q + 48 >> 2] = 1;Wb[c[(c[f >> 2] | 0) + 20 >> 2] & 3](f, q, o, o, 1, 0);g = (c[e >> 2] | 0) == 1 ? o : 0;
      } else {
        Ib[c[(c[p >> 2] | 0) + 24 >> 2] & 3](p, q, o, 1, 0);switch (c[q + 36 >> 2] | 0) {case 0:
            {
              g = (c[k >> 2] | 0) == 1 & (c[h >> 2] | 0) == 1 & (c[j >> 2] | 0) == 1 ? c[d >> 2] | 0 : 0;break a;
            }case 1:
            break;default:
            {
              g = 0;break a;
            }}if ((c[e >> 2] | 0) != 1 ? !((c[k >> 2] | 0) == 0 & (c[h >> 2] | 0) == 1 & (c[j >> 2] | 0) == 1) : 0) {
          g = 0;break;
        }g = c[g >> 2] | 0;
      } while (0);i = r;return g | 0;
    }function Nn(b, d, e, f, g) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;a[d + 53 >> 0] = 1;do if ((c[d + 4 >> 2] | 0) == (f | 0)) {
        a[d + 52 >> 0] = 1;f = d + 16 | 0;b = c[f >> 2] | 0;if (!b) {
          c[f >> 2] = e;c[d + 24 >> 2] = g;c[d + 36 >> 2] = 1;if (!((g | 0) == 1 ? (c[d + 48 >> 2] | 0) == 1 : 0)) break;a[d + 54 >> 0] = 1;break;
        }if ((b | 0) != (e | 0)) {
          g = d + 36 | 0;c[g >> 2] = (c[g >> 2] | 0) + 1;a[d + 54 >> 0] = 1;break;
        }b = d + 24 | 0;f = c[b >> 2] | 0;if ((f | 0) == 2) {
          c[b >> 2] = g;f = g;
        }if ((f | 0) == 1 ? (c[d + 48 >> 2] | 0) == 1 : 0) a[d + 54 >> 0] = 1;
      } while (0);return;
    }function On(b, d, e, f, g) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0,
          i = 0,
          j = 0,
          k = 0;a: do if ((b | 0) == (c[d + 8 >> 2] | 0)) {
        if ((c[d + 4 >> 2] | 0) == (e | 0) ? (h = d + 28 | 0, (c[h >> 2] | 0) != 1) : 0) c[h >> 2] = f;
      } else {
        if ((b | 0) != (c[d >> 2] | 0)) {
          j = c[b + 8 >> 2] | 0;Ib[c[(c[j >> 2] | 0) + 24 >> 2] & 3](j, d, e, f, g);break;
        }if ((c[d + 16 >> 2] | 0) != (e | 0) ? (i = d + 20 | 0, (c[i >> 2] | 0) != (e | 0)) : 0) {
          c[d + 32 >> 2] = f;f = d + 44 | 0;if ((c[f >> 2] | 0) == 4) break;h = d + 52 | 0;a[h >> 0] = 0;k = d + 53 | 0;a[k >> 0] = 0;b = c[b + 8 >> 2] | 0;Wb[c[(c[b >> 2] | 0) + 20 >> 2] & 3](b, d, e, e, 1, g);if (a[k >> 0] | 0) {
            if (!(a[h >> 0] | 0)) {
              h = 1;j = 13;
            }
          } else {
            h = 0;j = 13;
          }do if ((j | 0) == 13) {
            c[i >> 2] = e;k = d + 40 | 0;c[k >> 2] = (c[k >> 2] | 0) + 1;if ((c[d + 36 >> 2] | 0) == 1 ? (c[d + 24 >> 2] | 0) == 2 : 0) {
              a[d + 54 >> 0] = 1;if (h) break;
            } else j = 16;if ((j | 0) == 16 ? h : 0) break;c[f >> 2] = 4;break a;
          } while (0);c[f >> 2] = 3;break;
        }if ((f | 0) == 1) c[d + 32 >> 2] = 1;
      } while (0);return;
    }function Pn(b, d, e, f, g) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;var h = 0,
          i = 0;do if ((b | 0) == (c[d + 8 >> 2] | 0)) {
        if ((c[d + 4 >> 2] | 0) == (e | 0) ? (i = d + 28 | 0, (c[i >> 2] | 0) != 1) : 0) c[i >> 2] = f;
      } else if ((b | 0) == (c[d >> 2] | 0)) {
        if ((c[d + 16 >> 2] | 0) != (e | 0) ? (h = d + 20 | 0, (c[h >> 2] | 0) != (e | 0)) : 0) {
          c[d + 32 >> 2] = f;c[h >> 2] = e;g = d + 40 | 0;c[g >> 2] = (c[g >> 2] | 0) + 1;if ((c[d + 36 >> 2] | 0) == 1 ? (c[d + 24 >> 2] | 0) == 2 : 0) a[d + 54 >> 0] = 1;c[d + 44 >> 2] = 4;break;
        }if ((f | 0) == 1) c[d + 32 >> 2] = 1;
      } while (0);return;
    }function Qn(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;if ((a | 0) == (c[b + 8 >> 2] | 0)) Nn(0, b, d, e, f);else {
        a = c[a + 8 >> 2] | 0;Wb[c[(c[a >> 2] | 0) + 20 >> 2] & 3](a, b, d, e, f, g);
      }return;
    }function Rn(a, b, d, e, f, g) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;if ((a | 0) == (c[b + 8 >> 2] | 0)) Nn(0, b, d, e, f);return;
    }function Sn() {
      var a = 0;if (!(c[1168] | 0)) a = 4724;else a = c[(hb() | 0) + 60 >> 2] | 0;return a | 0;
    }function Tn(b) {
      b = b | 0;var c = 0,
          e = 0;c = 0;while (1) {
        if ((d[9061 + c >> 0] | 0) == (b | 0)) {
          e = 2;break;
        }c = c + 1 | 0;if ((c | 0) == 87) {
          c = 87;b = 9149;e = 5;break;
        }
      }if ((e | 0) == 2) if (!c) b = 9149;else {
        b = 9149;e = 5;
      }if ((e | 0) == 5) while (1) {
        e = b;while (1) {
          b = e + 1 | 0;if (!(a[e >> 0] | 0)) break;else e = b;
        }c = c + -1 | 0;if (!c) break;else e = 5;
      }return b | 0;
    }function Un(a) {
      a = a | 0;if (a >>> 0 > 4294963200) {
        c[(Sn() | 0) >> 2] = 0 - a;a = -1;
      }return a | 0;
    }function Vn(a, b) {
      a = ca(a);b = ca(b);var d = 0,
          e = 0;d = (g[k >> 2] = a, c[k >> 2] | 0);do if ((d & 2147483647) >>> 0 <= 2139095040) {
        e = (g[k >> 2] = b, c[k >> 2] | 0);if ((e & 2147483647) >>> 0 <= 2139095040) if ((e ^ d | 0) < 0) {
          a = (d | 0) < 0 ? b : a;break;
        } else {
          a = a < b ? b : a;break;
        }
      } else a = b; while (0);return ca(a);
    }function Wn(a, b) {
      a = ca(a);b = ca(b);var d = 0,
          e = 0;d = (g[k >> 2] = a, c[k >> 2] | 0);do if ((d & 2147483647) >>> 0 <= 2139095040) {
        e = (g[k >> 2] = b, c[k >> 2] | 0);if ((e & 2147483647) >>> 0 <= 2139095040) if ((e ^ d | 0) < 0) {
          a = (d | 0) < 0 ? a : b;break;
        } else {
          a = a < b ? a : b;break;
        }
      } else a = b; while (0);return ca(a);
    }function Xn(a, b) {
      a = ca(a);b = ca(b);var d = 0,
          e = 0,
          f = 0,
          h = 0,
          i = 0,
          j = 0,
          l = 0,
          m = 0,
          n = 0;h = (g[k >> 2] = a, c[k >> 2] | 0);l = (g[k >> 2] = b, c[k >> 2] | 0);d = h >>> 23 & 255;i = l >>> 23 & 255;m = h & -2147483648;f = l << 1;a: do if ((f | 0) != 0 ? !((l & 2147483647) >>> 0 > 2139095040 | (d | 0) == 255) : 0) {
        e = h << 1;if (e >>> 0 <= f >>> 0) {
          b = ca(a * ca(0.0));return ca((e | 0) == (f | 0) ? b : a);
        }if (!d) {
          d = h << 9;if ((d | 0) > -1) {
            e = 0;do {
              e = e + -1 | 0;d = d << 1;
            } while ((d | 0) > -1);
          } else e = 0;d = e;j = h << 1 - e;
        } else j = h & 8388607 | 8388608;if (!i) {
          e = l << 9;if ((e | 0) > -1) {
            f = 0;do {
              f = f + -1 | 0;e = e << 1;
            } while ((e | 0) > -1);
          } else f = 0;i = f;l = l << 1 - f;
        } else l = l & 8388607 | 8388608;e = j - l | 0;f = (e | 0) > -1;b: do if ((d | 0) > (i | 0)) {
          h = f;f = j;while (1) {
            if (h) {
              if ((f | 0) == (l | 0)) break;
            } else e = f;f = e << 1;d = d + -1 | 0;e = f - l | 0;h = (e | 0) > -1;if ((d | 0) <= (i | 0)) break b;
          }b = ca(a * ca(0.0));break a;
        } else {
          h = f;f = j;
        } while (0);if (h) {
          if ((f | 0) == (l | 0)) {
            b = ca(a * ca(0.0));break;
          }
        } else e = f;if (e >>> 0 < 8388608) do {
          e = e << 1;d = d + -1 | 0;
        } while (e >>> 0 < 8388608);if ((d | 0) > 0) d = e + -8388608 | d << 23;else d = e >>> (1 - d | 0);b = (c[k >> 2] = d | m, ca(g[k >> 2]));
      } else n = 3; while (0);if ((n | 0) == 3) {
        b = ca(a * b);b = ca(b / b);
      }return ca(b);
    }function Yn(a, b) {
      a = +a;b = b | 0;var d = 0,
          e = 0,
          f = 0;h[k >> 3] = a;d = c[k >> 2] | 0;e = c[k + 4 >> 2] | 0;f = Ro(d | 0, e | 0, 52) | 0;f = f & 2047;switch (f | 0) {case 0:
          {
            if (a != 0.0) {
              a = +Yn(a * 18446744073709551616.0, b);d = (c[b >> 2] | 0) + -64 | 0;
            } else d = 0;c[b >> 2] = d;break;
          }case 2047:
          break;default:
          {
            c[b >> 2] = f + -1022;c[k >> 2] = d;c[k + 4 >> 2] = e & -2146435073 | 1071644672;a = +h[k >> 3];
          }}return +a;
    }function Zn(a, b) {
      a = +a;b = b | 0;return + +Yn(a, b);
    }function fc(a) {
      a = a | 0;var b = 0;b = i;i = i + a | 0;i = i + 15 & -16;return b | 0;
    }function gc() {
      return i | 0;
    }function hc(a) {
      a = a | 0;i = a;
    }function ic(a, b) {
      a = a | 0;b = b | 0;i = a;j = b;
    }function jc(a, b) {
      a = a | 0;b = b | 0;if (!o) {
        o = a;p = b;
      }
    }function kc(b) {
      b = b | 0;a[k >> 0] = a[b >> 0];a[k + 1 >> 0] = a[b + 1 >> 0];a[k + 2 >> 0] = a[b + 2 >> 0];a[k + 3 >> 0] = a[b + 3 >> 0];
    }function lc(b) {
      b = b | 0;a[k >> 0] = a[b >> 0];a[k + 1 >> 0] = a[b + 1 >> 0];a[k + 2 >> 0] = a[b + 2 >> 0];a[k + 3 >> 0] = a[b + 3 >> 0];a[k + 4 >> 0] = a[b + 4 >> 0];a[k + 5 >> 0] = a[b + 5 >> 0];a[k + 6 >> 0] = a[b + 6 >> 0];a[k + 7 >> 0] = a[b + 7 >> 0];
    }function mc(a) {
      a = a | 0;D = a;
    }function nc() {
      return D | 0;
    }function oc(a) {
      a = a | 0;var b = 0;b = Nb[c[576 >> 2] & 31](12) | 0;Ec((b | 0) != 0, 5560);c[b >> 2] = a;c[b + 4 >> 2] = 0;a = Nb[c[576 >> 2] & 31](a << 2) | 0;c[b + 8 >> 2] = a;Ec((a | 0) != 0, 5595);return b | 0;
    }function pc(a) {
      a = a | 0;if (!a) return;Lb[c[584 >> 2] & 127](c[a + 8 >> 2] | 0);Lb[c[584 >> 2] & 127](a);return;
    }function qc(a) {
      a = a | 0;if (!a) {
        a = 0;return a | 0;
      }a = c[a + 4 >> 2] | 0;return a | 0;
    }function rc(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0;e = c[a >> 2] | 0;if (!e) {
        e = oc(4) | 0;c[a >> 2] = e;
      }f = e + 4 | 0;a = c[f >> 2] | 0;if ((a | 0) == (c[e >> 2] | 0)) {
        c[e >> 2] = a << 1;g = e + 8 | 0;a = Ub[c[580 >> 2] & 15](c[g >> 2] | 0, a << 3) | 0;c[g >> 2] = a;Ec((a | 0) != 0, 5631);a = c[f >> 2] | 0;
      }e = e + 8 | 0;if (a >>> 0 <= d >>> 0) {
        g = a;g = g + 1 | 0;c[f >> 2] = g;g = c[e >> 2] | 0;g = g + (d << 2) | 0;c[g >> 2] = b;return;
      }do {
        g = a;a = a + -1 | 0;h = c[e >> 2] | 0;c[h + (g << 2) >> 2] = c[h + (a << 2) >> 2];
      } while (a >>> 0 > d >>> 0);h = c[f >> 2] | 0;h = h + 1 | 0;c[f >> 2] = h;h = c[e >> 2] | 0;h = h + (d << 2) | 0;c[h >> 2] = b;return;
    }function sc(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;d = a + 8 | 0;e = (c[d >> 2] | 0) + (b << 2) | 0;f = c[e >> 2] | 0;c[e >> 2] = 0;e = a + 4 | 0;a = (c[e >> 2] | 0) + -1 | 0;if (a >>> 0 <= b >>> 0) {
        d = a;c[e >> 2] = d;return f | 0;
      }do {
        a = b;b = b + 1 | 0;g = c[d >> 2] | 0;c[g + (a << 2) >> 2] = c[g + (b << 2) >> 2];c[(c[d >> 2] | 0) + (b << 2) >> 2] = 0;a = (c[e >> 2] | 0) + -1 | 0;
      } while (b >>> 0 < a >>> 0);c[e >> 2] = a;return f | 0;
    }function tc(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;e = c[a + 4 >> 2] | 0;if (!e) {
        g = 0;return g | 0;
      }f = c[a + 8 >> 2] | 0;d = 0;while (1) {
        if ((c[f + (d << 2) >> 2] | 0) == (b | 0)) break;d = d + 1 | 0;if (d >>> 0 >= e >>> 0) {
          d = 0;g = 6;break;
        }
      }if ((g | 0) == 6) return d | 0;g = sc(a, d) | 0;return g | 0;
    }function uc(a, b) {
      a = a | 0;b = b | 0;if (!a) {
        a = 0;return a | 0;
      }if (!(c[a + 4 >> 2] | 0)) {
        a = 0;return a | 0;
      }a = c[(c[a + 8 >> 2] | 0) + (b << 2) >> 2] | 0;return a | 0;
    }function vc(b) {
      b = b | 0;var d = 0,
          e = 0,
          f = 0;f = i;i = i + 16 | 0;e = f;d = Nb[c[576 >> 2] & 31](992) | 0;if (!d) {
        c[e >> 2] = 5676;ee(b, 5, 5672, e);
      }c[147] = (c[147] | 0) + 1;So(d | 0, 604, 992) | 0;if (!(a[b + 2 >> 0] | 0)) {
        e = d + 968 | 0;c[e >> 2] = b;i = f;return d | 0;
      }c[d + 4 >> 2] = 2;c[d + 12 >> 2] = 4;e = d + 968 | 0;c[e >> 2] = b;i = f;return d | 0;
    }function wc() {
      return vc(1596) | 0;
    }function xc(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0;b = a + 944 | 0;d = c[b >> 2] | 0;if (d) {
        tc(c[d + 948 >> 2] | 0, a) | 0;c[b >> 2] = 0;
      }e = a + 948 | 0;f = qc(c[e >> 2] | 0) | 0;b = c[e >> 2] | 0;if (f) {
        d = 0;do {
          c[(uc(b, d) | 0) + 944 >> 2] = 0;d = d + 1 | 0;b = c[e >> 2] | 0;
        } while ((d | 0) != (f | 0));
      }pc(b);Lb[c[584 >> 2] & 127](a);c[147] = (c[147] | 0) + -1;return;
    }function yc(a) {
      a = a | 0;return qc(c[a + 948 >> 2] | 0) | 0;
    }function zc(a, b) {
      a = a | 0;b = b | 0;return uc(c[a + 948 >> 2] | 0, b) | 0;
    }function Ac(b, d) {
      b = b | 0;d = d | 0;if (!(tc(c[b + 948 >> 2] | 0, d) | 0)) return;So(d + 400 | 0, 1004, 540) | 0;c[d + 944 >> 2] = 0;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 5;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 5;break;
        }
      }if ((d | 0) == 5) return;
    }function Bc(b) {
      b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;g = i;i = i + 16 | 0;f = g + 8 | 0;e = g;d = b + 948 | 0;if (qc(c[d >> 2] | 0) | 0) {
        c[e >> 2] = 5711;fe(b, 5, 5672, e);
      }if (c[b + 944 >> 2] | 0) {
        c[f >> 2] = 5765;fe(b, 5, 5672, f);
      }pc(c[d >> 2] | 0);d = b + 968 | 0;e = c[d >> 2] | 0;So(b | 0, 604, 992) | 0;if (!(a[e + 2 >> 0] | 0)) {
        c[d >> 2] = e;i = g;return;
      }c[b + 4 >> 2] = 2;c[b + 12 >> 2] = 4;c[d >> 2] = e;i = g;return;
    }function Cc() {
      return c[147] | 0;
    }function Dc() {
      var a = 0,
          b = 0,
          d = 0;d = i;i = i + 16 | 0;b = d;a = Nb[c[576 >> 2] & 31](16) | 0;if (!a) {
        c[b >> 2] = 5812;fe(0, 5, 5672, b);
      }c[148] = (c[148] | 0) + 1;c[a >> 2] = c[399];c[a + 4 >> 2] = c[400];c[a + 8 >> 2] = c[401];c[a + 12 >> 2] = c[402];i = d;return a | 0;
    }function Ec(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = i;i = i + 16 | 0;d = e;if (a) {
        i = e;return;
      }c[d >> 2] = b;fe(0, 5, 5672, d);i = e;return;
    }function Fc(a) {
      a = a | 0;Lb[c[584 >> 2] & 127](a);c[148] = (c[148] | 0) + -1;return;
    }function Gc(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = i;i = i + 16 | 0;d = e;if (!b) {
        c[a + 956 >> 2] = 0;c[a + 980 >> 2] = 0;i = e;return;
      }if (qc(c[a + 948 >> 2] | 0) | 0) {
        c[d >> 2] = 5849;fe(a, 5, 5672, d);
      }c[a + 956 >> 2] = b;c[a + 980 >> 2] = 1;i = e;return;
    }function Hc(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          h = 0,
          j = 0,
          k = 0;k = i;i = i + 16 | 0;j = k + 8 | 0;h = k;f = d + 944 | 0;if (c[f >> 2] | 0) {
        c[h >> 2] = 5929;fe(b, 5, 5672, h);
      }if (c[b + 956 >> 2] | 0) {
        c[j >> 2] = 5983;fe(b, 5, 5672, j);
      }rc(b + 948 | 0, d, e);c[f >> 2] = b;while (1) {
        f = b + 976 | 0;if (a[f >> 0] | 0) {
          f = 8;break;
        }a[f >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          f = 8;break;
        }
      }if ((f | 0) == 8) {
        i = k;return;
      }
    }function Ic(a) {
      a = a | 0;return c[a + 944 >> 2] | 0;
    }function Jc(b) {
      b = b | 0;var d = 0,
          e = 0;e = i;i = i + 16 | 0;d = e;if (!(c[b + 956 >> 2] | 0)) {
        c[d >> 2] = 6052;fe(b, 5, 5672, d);d = b;
      } else d = b;while (1) {
        b = d + 976 | 0;if (a[b >> 0] | 0) {
          b = 5;break;
        }a[b >> 0] = 1;g[d + 504 >> 2] = ca(s);d = c[d + 944 >> 2] | 0;if (!d) {
          b = 5;break;
        }
      }if ((b | 0) == 5) {
        i = e;return;
      }
    }function Kc(b) {
      b = b | 0;return (a[b + 976 >> 0] | 0) != 0 | 0;
    }function Lc(b, d) {
      b = b | 0;d = d | 0;if (!(to(b, d, 400) | 0)) return;So(b | 0, d | 0, 400) | 0;d = b;while (1) {
        b = d + 976 | 0;if (a[b >> 0] | 0) {
          b = 5;break;
        }a[b >> 0] = 1;g[d + 504 >> 2] = ca(s);d = c[d + 944 >> 2] | 0;if (!d) {
          b = 5;break;
        }
      }if ((b | 0) == 5) return;
    }function Mc(a) {
      a = a | 0;var b = Hb;b = ca(g[a + 44 >> 2]);return ca(((g[k >> 2] = b, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? ca(0.0) : b);
    }function Nc(b) {
      b = b | 0;var d = Hb;d = ca(g[b + 48 >> 2]);if (((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) return ca(d);d = (a[(c[b + 968 >> 2] | 0) + 2 >> 0] | 0) != 0 ? ca(1.0) : ca(0.0);return ca(d);
    }function Oc(a, b) {
      a = a | 0;b = b | 0;c[a + 972 >> 2] = b;return;
    }function Pc(a) {
      a = a | 0;return c[a + 972 >> 2] | 0;
    }function Qc(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 4 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function Rc(a) {
      a = a | 0;return c[a + 4 >> 2] | 0;
    }function Sc(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 8 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function Tc(a) {
      a = a | 0;return c[a + 8 >> 2] | 0;
    }function Uc(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 12 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function Vc(a) {
      a = a | 0;return c[a + 12 >> 2] | 0;
    }function Wc(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 16 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function Xc(a) {
      a = a | 0;return c[a + 16 >> 2] | 0;
    }function Yc(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 20 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function Zc(a) {
      a = a | 0;return c[a + 20 >> 2] | 0;
    }function _c(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 24 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function $c(a) {
      a = a | 0;return c[a + 24 >> 2] | 0;
    }function ad(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 28 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function bd(a) {
      a = a | 0;return c[a + 28 >> 2] | 0;
    }function cd(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 32 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function dd(a) {
      a = a | 0;return c[a + 32 >> 2] | 0;
    }function ed(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 36 | 0;if ((c[e >> 2] | 0) == (d | 0)) return;c[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function fd(a) {
      a = a | 0;return c[a + 36 >> 2] | 0;
    }function gd(b, d) {
      b = b | 0;d = ca(d);var e = 0;e = b + 40 | 0;if (!(ca(g[e >> 2]) != d)) return;g[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function hd(b, d) {
      b = b | 0;d = ca(d);var e = 0;e = b + 44 | 0;if (!(ca(g[e >> 2]) != d)) return;g[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function id(b, d) {
      b = b | 0;d = ca(d);var e = 0;e = b + 48 | 0;if (!(ca(g[e >> 2]) != d)) return;g[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function jd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 52 | 0;e = b + 56 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function kd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 52 | 0;e = b + 56 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function ld(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 52 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function md(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 132 + (d << 3) | 0;d = b + 132 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 1 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function nd(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 132 + (d << 3) | 0;d = b + 132 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 2 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 0 : 2;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function od(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;e = b + 132 + (d << 3) | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function pd(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 60 + (d << 3) | 0;d = b + 60 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 1 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function qd(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 60 + (d << 3) | 0;d = b + 60 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 2 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 0 : 2;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function rd(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;e = b + 60 + (d << 3) | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function sd(b, d) {
      b = b | 0;d = d | 0;var e = 0;e = b + 60 + (d << 3) + 4 | 0;if ((c[e >> 2] | 0) == 3) return;g[b + 60 + (d << 3) >> 2] = ca(s);c[e >> 2] = 3;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function td(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 204 + (d << 3) | 0;d = b + 204 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 1 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function ud(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 204 + (d << 3) | 0;d = b + 204 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 2 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 0 : 2;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function vd(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0;e = b + 204 + (d << 3) | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function wd(b, d, e) {
      b = b | 0;d = d | 0;e = ca(e);var f = 0;f = b + 276 + (d << 3) | 0;d = b + 276 + (d << 3) + 4 | 0;if (!(ca(g[f >> 2]) != e) ? (c[d >> 2] | 0) == 1 : 0) return;g[f >> 2] = e;c[d >> 2] = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 6;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 6;break;
        }
      }if ((d | 0) == 6) return;
    }function xd(a, b) {
      a = a | 0;b = b | 0;return ca(g[a + 276 + (b << 3) >> 2]);
    }function yd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 348 | 0;e = b + 352 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function zd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 348 | 0;e = b + 352 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Ad(b) {
      b = b | 0;var d = 0;d = b + 352 | 0;if ((c[d >> 2] | 0) == 3) return;g[b + 348 >> 2] = ca(s);c[d >> 2] = 3;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 5;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 5;break;
        }
      }if ((d | 0) == 5) return;
    }function Bd(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 348 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function Cd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 356 | 0;e = b + 360 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Dd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 356 | 0;e = b + 360 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Ed(b) {
      b = b | 0;var d = 0;d = b + 360 | 0;if ((c[d >> 2] | 0) == 3) return;g[b + 356 >> 2] = ca(s);c[d >> 2] = 3;while (1) {
        d = b + 976 | 0;if (a[d >> 0] | 0) {
          d = 5;break;
        }a[d >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          d = 5;break;
        }
      }if ((d | 0) == 5) return;
    }function Fd(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 356 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function Gd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 364 | 0;e = b + 368 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Hd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 364 | 0;e = b + 368 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Id(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 364 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function Jd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 372 | 0;e = b + 376 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Kd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 372 | 0;e = b + 376 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Ld(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 372 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function Md(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 380 | 0;e = b + 384 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Nd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 380 | 0;e = b + 384 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Od(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 380 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function Pd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 388 | 0;e = b + 392 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 1 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 1;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Qd(b, d) {
      b = b | 0;d = ca(d);var e = 0,
          f = 0;f = b + 388 | 0;e = b + 392 | 0;if (!(ca(g[f >> 2]) != d) ? (c[e >> 2] | 0) == 2 : 0) return;g[f >> 2] = d;c[e >> 2] = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 ? 3 : 2;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 6;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 6;break;
        }
      }if ((e | 0) == 6) return;
    }function Rd(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;e = b + 388 | 0;d = c[e + 4 >> 2] | 0;b = a;c[b >> 2] = c[e >> 2];c[b + 4 >> 2] = d;return;
    }function Sd(b, d) {
      b = b | 0;d = ca(d);var e = 0;e = b + 396 | 0;if (!(ca(g[e >> 2]) != d)) return;g[e >> 2] = d;while (1) {
        e = b + 976 | 0;if (a[e >> 0] | 0) {
          e = 5;break;
        }a[e >> 0] = 1;g[b + 504 >> 2] = ca(s);b = c[b + 944 >> 2] | 0;if (!b) {
          e = 5;break;
        }
      }if ((e | 0) == 5) return;
    }function Td(a) {
      a = a | 0;return ca(g[a + 396 >> 2]);
    }function Ud(a) {
      a = a | 0;return ca(g[a + 400 >> 2]);
    }function Vd(a) {
      a = a | 0;return ca(g[a + 404 >> 2]);
    }function Wd(a) {
      a = a | 0;return ca(g[a + 408 >> 2]);
    }function Xd(a) {
      a = a | 0;return ca(g[a + 412 >> 2]);
    }function Yd(a) {
      a = a | 0;return ca(g[a + 416 >> 2]);
    }function Zd(a) {
      a = a | 0;return ca(g[a + 420 >> 2]);
    }function _d(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = Hb;e = i;i = i + 16 | 0;d = e;if (b >>> 0 >= 5) {
        c[d >> 2] = 6138;fe(a, 5, 5672, d);
      }a: do switch (b | 0) {case 0:
          if ((c[a + 496 >> 2] | 0) == 2) {
            b = a + 444 | 0;break a;
          } else {
            b = a + 440 | 0;break a;
          }case 2:
          if ((c[a + 496 >> 2] | 0) == 2) {
            b = a + 440 | 0;break a;
          } else {
            b = a + 444 | 0;break a;
          }default:
          b = a + 424 + (b << 2) | 0;} while (0);f = ca(g[b >> 2]);i = e;return ca(f);
    }function $d(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = Hb;e = i;i = i + 16 | 0;d = e;if (b >>> 0 >= 5) {
        c[d >> 2] = 6138;fe(a, 5, 5672, d);
      }a: do switch (b | 0) {case 0:
          if ((c[a + 496 >> 2] | 0) == 2) {
            b = a + 468 | 0;break a;
          } else {
            b = a + 464 | 0;break a;
          }case 2:
          if ((c[a + 496 >> 2] | 0) == 2) {
            b = a + 464 | 0;break a;
          } else {
            b = a + 468 | 0;break a;
          }default:
          b = a + 448 + (b << 2) | 0;} while (0);f = ca(g[b >> 2]);i = e;return ca(f);
    }function ae(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = Hb;e = i;i = i + 16 | 0;d = e;if (b >>> 0 >= 5) {
        c[d >> 2] = 6138;fe(a, 5, 5672, d);
      }a: do switch (b | 0) {case 0:
          if ((c[a + 496 >> 2] | 0) == 2) {
            b = a + 492 | 0;break a;
          } else {
            b = a + 488 | 0;break a;
          }case 2:
          if ((c[a + 496 >> 2] | 0) == 2) {
            b = a + 488 | 0;break a;
          } else {
            b = a + 492 | 0;break a;
          }default:
          b = a + 472 + (b << 2) | 0;} while (0);f = ca(g[b >> 2]);i = e;return ca(f);
    }function be(a, b, d, e, f, h, i, j, l, m, n, o, p) {
      a = a | 0;b = ca(b);d = d | 0;e = ca(e);f = f | 0;h = ca(h);i = i | 0;j = ca(j);l = ca(l);m = ca(m);n = ca(n);o = ca(o);p = p | 0;var q = Hb,
          r = Hb,
          s = Hb,
          t = Hb,
          u = 0;if (l < ca(0.0) | m < ca(0.0)) {
        i = 0;return i | 0;
      }if ((p | 0) != 0 ? (q = ca(g[p + 4 >> 2]), q != ca(0.0)) : 0) {
        s = ca(je(b, q, 0, 0));t = ca(je(e, q, 0, 0));r = ca(je(h, q, 0, 0));q = ca(je(j, q, 0, 0));
      } else {
        r = h;s = b;q = j;t = e;
      }do if ((f | 0) == (a | 0)) {
        if (((g[k >> 2] = r, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
          p = ((g[k >> 2] = s, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;break;
        } else {
          p = ca(O(ca(r - s))) < ca(.0000999999974);break;
        }
      } else p = 0; while (0);do if ((i | 0) == (d | 0)) {
        if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
          u = ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;break;
        } else {
          u = ca(O(ca(q - t))) < ca(.0000999999974);break;
        }
      } else u = 0; while (0);a: do if (!p) {
        q = ca(b - n);if ((a | 0) == 1) {
          if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
            if (((g[k >> 2] = l, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              a = 1;break;
            }
          } else if (ca(O(ca(q - l))) < ca(.0000999999974)) {
            a = 1;break;
          }a = 0;break;
        }p = (a | 0) == 2;do if (p & (f | 0) == 0) {
          if (q >= l) {
            a = 1;break a;
          }if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
            if (((g[k >> 2] = l, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              a = 1;break a;
            } else {
              p = 1;break;
            }
          } else if (ca(O(ca(q - l))) < ca(.0000999999974)) {
            a = 1;break a;
          } else {
            p = 1;break;
          }
        } while (0);if (q < h & ((f | 0) == 2 & p)) {
          if (!(q >= l)) {
            if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              a = ((g[k >> 2] = l, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;break;
            } else {
              a = ca(O(ca(q - l))) < ca(.0000999999974);break;
            }
          } else a = 1;
        } else a = 0;
      } else a = 1; while (0);b: do if (!u) {
        q = ca(e - o);if ((d | 0) == 1) {
          if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
            if (((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              p = 1;break;
            }
          } else if (ca(O(ca(q - m))) < ca(.0000999999974)) {
            p = 1;break;
          }p = 0;break;
        }p = (d | 0) == 2;do if (p & (i | 0) == 0) {
          if (q >= m) {
            p = 1;break b;
          }if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
            if (((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              p = 1;break b;
            } else {
              p = 1;break;
            }
          } else if (ca(O(ca(q - m))) < ca(.0000999999974)) {
            p = 1;break b;
          } else {
            p = 1;break;
          }
        } while (0);if (q < j & ((i | 0) == 2 & p)) {
          if (!(q >= m)) {
            if (((g[k >> 2] = q, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              p = ((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;break;
            } else {
              p = ca(O(ca(q - m))) < ca(.0000999999974);break;
            }
          } else p = 1;
        } else p = 0;
      } else p = 1; while (0);i = a & p;return i | 0;
    }function ce(b, d, e, f, j, l, m, n, o, p, q) {
      b = b | 0;d = ca(d);e = ca(e);f = f | 0;j = j | 0;l = l | 0;m = ca(m);n = ca(n);o = o | 0;p = p | 0;q = q | 0;var r = 0,
          t = 0,
          u = 0,
          v = 0,
          w = 0,
          x = Hb,
          y = Hb,
          z = 0,
          A = 0,
          B = 0,
          C = 0,
          D = 0,
          E = 0,
          F = 0,
          G = 0,
          H = 0,
          I = 0,
          J = Hb,
          K = Hb,
          L = Hb,
          M = 0.0,
          N = 0.0;I = i;i = i + 160 | 0;F = I + 120 | 0;D = I + 104 | 0;C = I + 72 | 0;A = I + 56 | 0;E = I + 8 | 0;B = I;c[150] = (c[150] | 0) + 1;H = b + 976 | 0;if ((a[H >> 0] | 0) != 0 ? (c[b + 512 >> 2] | 0) != (c[149] | 0) : 0) z = 4;else if ((c[b + 516 >> 2] | 0) == (f | 0)) G = 0;else z = 4;if ((z | 0) == 4) {
        c[b + 520 >> 2] = 0;c[b + 924 >> 2] = -1;c[b + 928 >> 2] = -1;g[b + 932 >> 2] = ca(-1.0);g[b + 936 >> 2] = ca(-1.0);G = 1;
      }a: do if (!(c[b + 956 >> 2] | 0)) {
        if (o) {
          r = b + 916 | 0;x = ca(g[r >> 2]);if (((g[k >> 2] = x, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
            if (((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
              r = 0;z = 62;break;
            }
          } else if (!(ca(O(ca(x - d))) < ca(.0000999999974))) {
            r = 0;z = 62;break;
          }x = ca(g[b + 920 >> 2]);if (((g[k >> 2] = x, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
            if (((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
              r = 0;z = 62;break;
            }
          } else if (!(ca(O(ca(x - e))) < ca(.0000999999974))) {
            r = 0;z = 62;break;
          }if ((c[b + 924 >> 2] | 0) != (j | 0)) {
            r = 0;z = 62;break;
          }r = (c[b + 928 >> 2] | 0) == (l | 0) ? r : 0;z = 53;break;
        }t = c[b + 520 >> 2] | 0;if (!t) {
          r = 0;z = 62;
        } else {
          u = ((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;v = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;w = 0;while (1) {
            r = b + 524 + (w * 24 | 0) | 0;x = ca(g[r >> 2]);if (((g[k >> 2] = x, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              if (u) z = 47;
            } else if (ca(O(ca(x - d))) < ca(.0000999999974)) z = 47;do if ((z | 0) == 47) {
              z = 0;x = ca(g[b + 524 + (w * 24 | 0) + 4 >> 2]);if (((g[k >> 2] = x, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                if (!v) break;
              } else if (!(ca(O(ca(x - e))) < ca(.0000999999974))) break;if ((c[b + 524 + (w * 24 | 0) + 8 >> 2] | 0) == (j | 0) ? (c[b + 524 + (w * 24 | 0) + 12 >> 2] | 0) == (l | 0) : 0) {
                z = 53;break a;
              }
            } while (0);w = w + 1 | 0;if (w >>> 0 >= t >>> 0) {
              r = 0;z = 62;break;
            }
          }
        }
      } else {
        r = c[b + 96 >> 2] | 0;b: do if (!r) {
          do if (!(c[b + 64 >> 2] | 0)) {
            if (!(c[b + 112 >> 2] | 0)) {
              r = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
            } else {
              r = b + 108 | 0;break;
            }
          } else r = b + 60 | 0; while (0);t = c[r + 4 >> 2] | 0;if ((t | 0) == 3) x = ca(0.0);else switch (t | 0) {case 2:
              {
                x = ca(ca(ca(g[r >> 2]) * m) / ca(100.0));break b;
              }case 1:
              {
                x = ca(g[r >> 2]);break b;
              }default:
              {
                x = ca(s);break b;
              }}
        } else {
          t = b + 92 | 0;if ((r | 0) == 3) x = ca(0.0);else switch (r | 0) {case 2:
              {
                x = ca(ca(ca(g[t >> 2]) * m) / ca(100.0));break b;
              }case 1:
              {
                x = ca(g[t >> 2]);break b;
              }default:
              {
                x = ca(s);break b;
              }}
        } while (0);y = ca(x + ca(ke(b, 2, m)));do if (!(c[b + 72 >> 2] | 0)) {
          if (!(c[b + 120 >> 2] | 0)) {
            r = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
          } else {
            r = b + 116 | 0;break;
          }
        } else r = b + 68 | 0; while (0);t = c[r + 4 >> 2] | 0;c: do if ((t | 0) == 3) x = ca(0.0);else switch (t | 0) {case 2:
            {
              x = ca(ca(ca(g[r >> 2]) * m) / ca(100.0));break c;
            }case 1:
            {
              x = ca(g[r >> 2]);break c;
            }default:
            {
              x = ca(s);break c;
            }} while (0);x = ca(x + ca(ke(b, 0, m)));r = b + 916 | 0;L = ca(g[r >> 2]);K = ca(g[b + 920 >> 2]);J = ca(g[b + 932 >> 2]);if (!(be(j, d, l, e, c[b + 924 >> 2] | 0, L, c[b + 928 >> 2] | 0, K, J, ca(g[b + 936 >> 2]), y, x, q) | 0)) {
          t = c[b + 520 >> 2] | 0;if (!t) {
            r = 0;z = 62;
          } else {
            u = 0;while (1) {
              r = b + 524 + (u * 24 | 0) | 0;J = ca(g[r >> 2]);K = ca(g[b + 524 + (u * 24 | 0) + 4 >> 2]);L = ca(g[b + 524 + (u * 24 | 0) + 16 >> 2]);if (be(j, d, l, e, c[b + 524 + (u * 24 | 0) + 8 >> 2] | 0, J, c[b + 524 + (u * 24 | 0) + 12 >> 2] | 0, K, L, ca(g[b + 524 + (u * 24 | 0) + 20 >> 2]), y, x, q) | 0) {
                z = 53;break a;
              }u = u + 1 | 0;if (u >>> 0 >= t >>> 0) {
                r = 0;z = 62;break;
              }
            }
          }
        } else z = 53;
      } while (0);if ((z | 0) == 53) if ((r | 0) != 0 & (G ^ 1)) {
        v = r + 16 | 0;c[b + 908 >> 2] = c[v >> 2];w = r + 20 | 0;c[b + 912 >> 2] = c[w >> 2];if (!((a[5670] | 0) == 0 | (a[5671] | 0) == 0)) {
          t = c[150] | 0;c[B >> 2] = t >>> 0 > 60 ? 6192 : 6192 + (60 - t) | 0;c[B + 4 >> 2] = t;mo(6253, B) | 0;t = c[b + 964 >> 2] | 0;if (t) Lb[t & 127](b);if (j >>> 0 > 2) u = 6270;else u = c[(o ? 1620 : 1632) + (j << 2) >> 2] | 0;if (l >>> 0 > 2) t = 6270;else t = c[(o ? 1620 : 1632) + (l << 2) >> 2] | 0;N = +ca(g[v >> 2]);M = +ca(g[w >> 2]);c[E >> 2] = u;c[E + 4 >> 2] = t;h[E + 8 >> 3] = +d;h[E + 16 >> 3] = +e;h[E + 24 >> 3] = N;h[E + 32 >> 3] = M;c[E + 40 >> 2] = p;mo(6271, E) | 0;
        }
      } else z = 62;if ((z | 0) == 62) {
        if (a[5670] | 0) {
          t = c[150] | 0;c[A >> 2] = t >>> 0 > 60 ? 6192 : 6192 + (60 - t) | 0;c[A + 4 >> 2] = t;c[A + 8 >> 2] = G ? 6320 : 6270;mo(6322, A) | 0;t = c[b + 964 >> 2] | 0;if (t) Lb[t & 127](b);if (j >>> 0 > 2) u = 6270;else u = c[(o ? 1620 : 1632) + (j << 2) >> 2] | 0;if (l >>> 0 > 2) t = 6270;else t = c[(o ? 1620 : 1632) + (l << 2) >> 2] | 0;c[C >> 2] = u;c[C + 4 >> 2] = t;h[C + 8 >> 3] = +d;h[C + 16 >> 3] = +e;c[C + 24 >> 2] = p;mo(6331, C) | 0;
        }le(b, d, e, f, j, l, m, n, o, q);if (a[5670] | 0) {
          t = c[150] | 0;c[D >> 2] = t >>> 0 > 60 ? 6192 : 6192 + (60 - t) | 0;c[D + 4 >> 2] = t;c[D + 8 >> 2] = G ? 6320 : 6270;mo(6365, D) | 0;t = c[b + 964 >> 2] | 0;if (t) Lb[t & 127](b);if (j >>> 0 > 2) u = 6270;else u = c[(o ? 1620 : 1632) + (j << 2) >> 2] | 0;if (l >>> 0 > 2) t = 6270;else t = c[(o ? 1620 : 1632) + (l << 2) >> 2] | 0;M = +ca(g[b + 908 >> 2]);N = +ca(g[b + 912 >> 2]);c[F >> 2] = u;c[F + 4 >> 2] = t;h[F + 8 >> 3] = M;h[F + 16 >> 3] = N;c[F + 24 >> 2] = p;mo(6374, F) | 0;
        }c[b + 516 >> 2] = f;if (!r) {
          t = b + 520 | 0;r = c[t >> 2] | 0;if ((r | 0) == 16) {
            if (a[5670] | 0) no(6406) | 0;c[t >> 2] = 0;r = 0;
          }if (o) r = b + 916 | 0;else {
            c[t >> 2] = r + 1;r = b + 524 + (r * 24 | 0) | 0;
          }g[r >> 2] = d;g[r + 4 >> 2] = e;c[r + 8 >> 2] = j;c[r + 12 >> 2] = l;c[r + 16 >> 2] = c[b + 908 >> 2];c[r + 20 >> 2] = c[b + 912 >> 2];r = 0;
        }
      }if (!o) {
        H = c[150] | 0;H = H + -1 | 0;c[150] = H;H = c[149] | 0;o = b + 512 | 0;c[o >> 2] = H;o = (r | 0) == 0;o = G | o;i = I;return o | 0;
      }c[b + 416 >> 2] = c[b + 908 >> 2];c[b + 420 >> 2] = c[b + 912 >> 2];a[b + 977 >> 0] = 1;a[H >> 0] = 0;H = c[150] | 0;H = H + -1 | 0;c[150] = H;H = c[149] | 0;o = b + 512 | 0;c[o >> 2] = H;o = (r | 0) == 0;o = G | o;i = I;return o | 0;
    }function de(b, e, f, h) {
      b = b | 0;e = ca(e);f = ca(f);h = h | 0;var i = Hb,
          j = 0,
          l = 0,
          m = Hb,
          n = 0,
          o = Hb,
          p = Hb,
          q = 0,
          r = 0,
          t = 0,
          u = Hb;c[149] = (c[149] | 0) + 1;l = b + 380 | 0;n = c[b + 384 >> 2] | 0;if (((n | 0) != 0 ? (t = b + 368 | 0, (n | 0) == (d[t >> 0] | d[t + 1 >> 0] << 8 | d[t + 2 >> 0] << 16 | d[t + 3 >> 0] << 24 | 0)) : 0) ? (a[k >> 0] = a[l >> 0], a[k + 1 >> 0] = a[l + 1 >> 0], a[k + 2 >> 0] = a[l + 2 >> 0], a[k + 3 >> 0] = a[l + 3 >> 0], u = ca(g[k >> 2]), t = b + 364 | 0, a[k >> 0] = a[t >> 0], a[k + 1 >> 0] = a[t + 1 >> 0], a[k + 2 >> 0] = a[t + 2 >> 0], a[k + 3 >> 0] = a[t + 3 >> 0], ca(O(ca(u - ca(g[k >> 2])))) < ca(.0000999999974)) : 0) {
        c[b + 984 >> 2] = l;j = l;
      } else {
        j = b + 348 | 0;c[b + 984 >> 2] = j;
      }q = b + 388 | 0;r = c[b + 392 >> 2] | 0;if (((r | 0) != 0 ? (t = b + 376 | 0, (r | 0) == (d[t >> 0] | d[t + 1 >> 0] << 8 | d[t + 2 >> 0] << 16 | d[t + 3 >> 0] << 24 | 0)) : 0) ? (a[k >> 0] = a[q >> 0], a[k + 1 >> 0] = a[q + 1 >> 0], a[k + 2 >> 0] = a[q + 2 >> 0], a[k + 3 >> 0] = a[q + 3 >> 0], u = ca(g[k >> 2]), t = b + 372 | 0, a[k >> 0] = a[t >> 0], a[k + 1 >> 0] = a[t + 1 >> 0], a[k + 2 >> 0] = a[t + 2 >> 0], a[k + 3 >> 0] = a[t + 3 >> 0], ca(O(ca(u - ca(g[k >> 2])))) < ca(.0000999999974)) : 0) {
        c[b + 988 >> 2] = q;t = q;
      } else {
        t = b + 356 | 0;c[b + 988 >> 2] = t;
      }switch (c[j + 4 >> 2] | 0) {case 0:case 3:
          {
            j = 32;break;
          }case 1:
          {
            if (ca(g[j >> 2]) < ca(0.0)) j = 32;else {
              o = ca(g[j >> 2]);j = 17;
            }break;
          }case 2:
          {
            if (!(ca(g[j >> 2]) < ca(0.0)) ? ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 : 0) {
              o = ca(ca(ca(g[j >> 2]) * e) / ca(100.0));j = 17;
            } else j = 32;break;
          }default:
          {
            o = ca(s);j = 17;
          }}a: do if ((j | 0) == 17) {
        j = c[b + 96 >> 2] | 0;b: do if (!j) {
          do if (!(c[b + 64 >> 2] | 0)) {
            if (!(c[b + 112 >> 2] | 0)) {
              j = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
            } else {
              j = b + 108 | 0;break;
            }
          } else j = b + 60 | 0; while (0);l = c[j + 4 >> 2] | 0;if ((l | 0) == 3) m = ca(0.0);else switch (l | 0) {case 2:
              {
                m = ca(ca(ca(g[j >> 2]) * e) / ca(100.0));break b;
              }case 1:
              {
                m = ca(g[j >> 2]);break b;
              }default:
              {
                m = ca(s);break b;
              }}
        } else {
          l = b + 92 | 0;if ((j | 0) == 3) m = ca(0.0);else switch (j | 0) {case 2:
              {
                m = ca(ca(ca(g[l >> 2]) * e) / ca(100.0));break b;
              }case 1:
              {
                m = ca(g[l >> 2]);break b;
              }default:
              {
                m = ca(s);break b;
              }}
        } while (0);o = ca(o + ca(m + ca(ke(b, 2, e))));n = 1;
      } else if ((j | 0) == 32) {
        switch (n | 0) {case 2:
            {
              o = ca(g[l >> 2]);m = ca(ca(o * e) / ca(100.0));j = 35;break;
            }case 1:
            {
              o = ca(g[l >> 2]);m = o;j = 35;break;
            }default:
            {}}if ((j | 0) == 35 ? m >= ca(0.0) : 0) switch (n | 0) {case 2:
            {
              o = ca(ca(o * e) / ca(100.0));n = 2;break a;
            }case 1:
            {
              n = 2;break a;
            }default:
            {
              o = ca(s);n = 2;break a;
            }}o = e;n = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1;
      } while (0);switch (c[t + 4 >> 2] | 0) {case 0:case 3:
          {
            j = 56;break;
          }case 1:
          {
            if (ca(g[t >> 2]) < ca(0.0)) j = 56;else {
              m = ca(g[t >> 2]);j = 46;
            }break;
          }case 2:
          {
            if (!(ca(g[t >> 2]) < ca(0.0)) ? ((g[k >> 2] = f, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 : 0) {
              m = ca(ca(ca(g[t >> 2]) * f) / ca(100.0));j = 46;
            } else j = 56;break;
          }default:
          {
            m = ca(s);j = 46;
          }}c: do if ((j | 0) == 46) {
        do if (!(c[b + 72 >> 2] | 0)) {
          if (!(c[b + 120 >> 2] | 0)) {
            j = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
          } else {
            j = b + 116 | 0;break;
          }
        } else j = b + 68 | 0; while (0);l = c[j + 4 >> 2] | 0;d: do if ((l | 0) == 3) i = ca(0.0);else switch (l | 0) {case 2:
            {
              i = ca(ca(ca(g[j >> 2]) * e) / ca(100.0));break d;
            }case 1:
            {
              i = ca(g[j >> 2]);break d;
            }default:
            {
              i = ca(s);break d;
            }} while (0);i = ca(m + ca(i + ca(ke(b, 0, e))));l = 1;
      } else if ((j | 0) == 56) {
        switch (r | 0) {case 2:
            {
              i = ca(g[q >> 2]);p = ca(ca(i * f) / ca(100.0));j = 59;break;
            }case 1:
            {
              i = ca(g[q >> 2]);p = i;j = 59;break;
            }default:
            {}}if ((j | 0) == 59 ? p >= ca(0.0) : 0) switch (r | 0) {case 2:
            {
              i = ca(ca(i * f) / ca(100.0));l = 2;break c;
            }case 1:
            {
              l = 2;break c;
            }default:
            {
              i = ca(s);l = 2;break c;
            }}i = f;l = ((g[k >> 2] = f, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1;
      } while (0);j = b + 968 | 0;if (!(ce(b, o, i, h, n, l, e, f, 1, 6428, c[j >> 2] | 0) | 0)) return;me(b, c[b + 496 >> 2] | 0, e, f, e);ne(b, ca(g[(c[j >> 2] | 0) + 4 >> 2]), ca(0.0), ca(0.0));if (!(a[5669] | 0)) return;ie(b, 7, 0);return;
    }function ee(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0;f = i;i = i + 16 | 0;g = f;c[g >> 2] = e;e = (a | 0) != 0 ? a : 1596;Zb[c[e + 8 >> 2] & 1](e, 0, b, d, g) | 0;if ((b | 0) == 5) fb();else {
        i = f;return;
      }
    }function fe(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0;g = i;i = i + 16 | 0;f = g;c[f >> 2] = e;if (!a) e = 0;else e = c[a + 968 >> 2] | 0;e = (e | 0) != 0 ? e : 1596;Zb[c[e + 8 >> 2] & 1](e, a, b, d, f) | 0;if ((b | 0) == 5) fb();else {
        i = g;return;
      }
    }function ge(b, c, d) {
      b = b | 0;c = c | 0;d = d | 0;a[b + c >> 0] = d & 1;return;
    }function he(b, c) {
      b = b | 0;c = c | 0;return (a[b + c >> 0] | 0) != 0 | 0;
    }function ie(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          j = 0,
          l = 0,
          m = Hb,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0,
          t = 0,
          u = 0,
          v = 0,
          w = 0,
          x = 0,
          y = 0,
          z = 0,
          A = 0,
          B = 0,
          C = 0,
          D = 0,
          E = 0,
          F = 0,
          G = 0,
          H = 0,
          I = 0,
          J = 0,
          K = 0,
          L = 0,
          M = 0,
          N = 0;N = i;i = i + 256 | 0;M = N + 240 | 0;L = N + 232 | 0;K = N + 224 | 0;J = N + 216 | 0;H = N + 208 | 0;G = N + 200 | 0;F = N + 192 | 0;E = N + 184 | 0;D = N + 176 | 0;C = N + 168 | 0;B = N + 160 | 0;A = N + 144 | 0;z = N + 128 | 0;y = N + 112 | 0;x = N + 104 | 0;w = N + 96 | 0;v = N + 88 | 0;u = N + 80 | 0;t = N + 72 | 0;p = N + 64 | 0;o = N + 56 | 0;n = N + 48 | 0;l = N + 40 | 0;s = N + 32 | 0;r = N + 24 | 0;q = N + 16 | 0;j = N + 8 | 0;f = N;I = (d | 0) == 0;if (!I) {
        e = 0;do {
          fe(a, 3, 6774, f);e = e + 1 | 0;
        } while ((e | 0) != (d | 0));
      }fe(a, 3, 6777, j);e = c[a + 964 >> 2] | 0;if (e) Lb[e & 127](a);if (b & 1) {
        fe(a, 3, 6783, q);h[r >> 3] = +ca(g[a + 416 >> 2]);fe(a, 3, 6792, r);h[s >> 3] = +ca(g[a + 420 >> 2]);fe(a, 3, 6804, s);h[l >> 3] = +ca(g[a + 404 >> 2]);fe(a, 3, 6817, l);h[n >> 3] = +ca(g[a + 400 >> 2]);fe(a, 3, 6827, n);fe(a, 3, 6837, o);
      }do if (b & 2) {
        fe(a, 3, 6840, p);e = c[a + 4 >> 2] | 0;if (e) {
          c[t >> 2] = Ka(e | 0) | 0;fe(a, 3, 6848, t);
        }e = c[a + 8 >> 2] | 0;if (e) {
          c[u >> 2] = Xa(e | 0) | 0;fe(a, 3, 6869, u);
        }e = c[a + 16 >> 2] | 0;if ((e | 0) != 4) {
          c[v >> 2] = _a(e | 0) | 0;fe(a, 3, 6891, v);
        }e = c[a + 12 >> 2] | 0;if ((e | 0) != 1) {
          c[w >> 2] = _a(e | 0) | 0;fe(a, 3, 6909, w);
        }e = c[a + 20 >> 2] | 0;if (e) {
          c[x >> 2] = _a(e | 0) | 0;fe(a, 3, 6929, x);
        }m = ca(g[a + 44 >> 2]);if (((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
          c[y >> 2] = 6955;h[y + 8 >> 3] = +m;fe(a, 3, 6946, y);
        }m = ca(g[a + 48 >> 2]);if (((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
          c[z >> 2] = 6965;h[z + 8 >> 3] = +m;fe(a, 3, 6946, z);
        }if ((c[a + 56 >> 2] | 0) != 3) Be(a, 6977, a + 52 | 0);m = ca(g[a + 40 >> 2]);if (((g[k >> 2] = m, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
          c[A >> 2] = 6606;h[A + 8 >> 3] = +m;fe(a, 3, 6946, A);
        }e = c[a + 28 >> 2] | 0;if (e) {
          c[B >> 2] = Za(e | 0) | 0;fe(a, 3, 6988, B);
        }e = c[a + 32 >> 2] | 0;if (e) {
          c[C >> 2] = Sa(e | 0) | 0;fe(a, 3, 7003, C);
        }e = c[a + 36 >> 2] | 0;if (e) {
          c[D >> 2] = Fa(e | 0) | 0;fe(a, 3, 7018, D);
        }Ce(a, 7032, a + 60 | 0);Ce(a, 7039, a + 204 | 0);Ce(a, 7047, a + 276 | 0);if ((c[a + 352 >> 2] | 0) != 3) Be(a, 7054, a + 348 | 0);if ((c[a + 360 >> 2] | 0) != 3) Be(a, 7060, a + 356 | 0);if ((c[a + 384 >> 2] | 0) != 3) Be(a, 7067, a + 380 | 0);if ((c[a + 392 >> 2] | 0) != 3) Be(a, 7077, a + 388 | 0);if ((c[a + 368 >> 2] | 0) != 3) Be(a, 7088, a + 364 | 0);if ((c[a + 376 >> 2] | 0) != 3) Be(a, 7098, a + 372 | 0);e = c[a + 24 >> 2] | 0;if (e) {
          c[E >> 2] = kb(e | 0) | 0;fe(a, 3, 7109, E);
        }e = a + 132 | 0;do if (!(c[a + 136 >> 2] | 0)) if (!(c[a + 184 >> 2] | 0)) {
          e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
        } else {
          e = a + 180 | 0;break;
        } while (0);Be(a, 7124, e);do if (!(c[a + 152 >> 2] | 0)) {
          if (!(c[a + 184 >> 2] | 0)) {
            e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
          } else {
            e = a + 180 | 0;break;
          }
        } else e = a + 148 | 0; while (0);Be(a, 7129, e);do if (!(c[a + 144 >> 2] | 0)) {
          if (!(c[a + 192 >> 2] | 0)) {
            e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
          } else {
            e = a + 188 | 0;break;
          }
        } else e = a + 140 | 0; while (0);Be(a, 7135, e);do if (!(c[a + 160 >> 2] | 0)) {
          if (!(c[a + 192 >> 2] | 0)) {
            e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
          } else {
            e = a + 188 | 0;break;
          }
        } else e = a + 156 | 0; while (0);Be(a, 7139, e);fe(a, 3, 6837, F);if (!(c[a + 956 >> 2] | 0)) break;fe(a, 3, 7146, G);
      } while (0);fe(a, 3, 7172, H);e = a + 948 | 0;f = qc(c[e >> 2] | 0) | 0;if (!((b & 4 | 0) != 0 & (f | 0) != 0)) {
        fe(a, 3, 7176, M);i = N;return;
      }j = d + 1 | 0;l = 0;do {
        fe(a, 3, 7174, J);ie(uc(c[e >> 2] | 0, l) | 0, b, j);l = l + 1 | 0;
      } while ((l | 0) != (f | 0));if (!I) {
        e = 0;do {
          fe(a, 3, 6774, K);e = e + 1 | 0;
        } while ((e | 0) != (d | 0));
      }fe(a, 3, 7174, L);fe(a, 3, 7176, M);i = N;return;
    }function je(a, b, d, e) {
      a = ca(a);b = ca(b);d = d | 0;e = e | 0;var f = Hb,
          h = 0;a = ca(a * b);f = ca(Xn(a, ca(1.0)));if (((g[k >> 2] = f, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
        a = ca(a - f);if (!(ca(O(ca(f))) < ca(.0000999999974))) h = 4;
      } else {
        a = ca(a - f);h = 4;
      }do if ((h | 0) == 4) {
        if (d) {
          a = ca(a + ca(1.0));break;
        }if (!e) {
          h = f >= ca(.5);a = ca((h ? 1.0 : 0.0) + +a);
        }
      } while (0);return ca(a / b);
    }function ke(a, b, d) {
      a = a | 0;b = b | 0;d = ca(d);var e = 0,
          f = 0;if ((b & -2 | 0) == 2 ? (f = c[a + 104 >> 2] | 0, (f | 0) != 0) : 0) {
        e = a + 100 | 0;if ((f | 0) == 3) {
          d = ca(0.0);return ca(d);
        }switch (f | 0) {case 2:
            {
              d = ca(ca(ca(g[e >> 2]) * d) / ca(100.0));return ca(d);
            }case 1:
            {
              d = ca(g[e >> 2]);return ca(d);
            }default:
            {
              d = ca(s);return ca(d);
            }}
      }e = c[1660 + (b << 2) >> 2] | 0;a: do if (!(c[a + 60 + (e << 3) + 4 >> 2] | 0)) {
        if (b >>> 0 < 2 ? (c[a + 120 >> 2] | 0) != 0 : 0) {
          e = a + 116 | 0;break;
        }switch (e | 0) {case 0:case 2:case 4:case 5:
            {
              if (c[a + 112 >> 2] | 0) {
                e = a + 108 | 0;break a;
              }break;
            }default:
            {}}e = (c[a + 128 >> 2] | 0) == 0 ? 1612 : a + 124 | 0;
      } else e = a + 60 + (e << 3) | 0; while (0);f = c[e + 4 >> 2] | 0;if ((f | 0) == 3) {
        d = ca(0.0);return ca(d);
      }switch (f | 0) {case 2:
          {
            d = ca(ca(ca(g[e >> 2]) * d) / ca(100.0));return ca(d);
          }case 1:
          {
            d = ca(g[e >> 2]);return ca(d);
          }default:
          {
            d = ca(s);return ca(d);
          }}return ca(0);
    }function le(b, e, f, h, j, l, m, n, o, p) {
      b = b | 0;e = ca(e);f = ca(f);h = h | 0;j = j | 0;l = l | 0;m = ca(m);n = ca(n);o = o | 0;p = p | 0;var q = 0,
          r = Hb,
          t = Hb,
          u = Hb,
          v = 0,
          w = 0,
          x = 0,
          y = 0,
          z = 0,
          A = 0,
          B = 0,
          C = 0,
          D = Hb,
          E = Hb,
          F = Hb,
          G = Hb,
          H = Hb,
          I = Hb,
          J = Hb,
          K = 0,
          L = 0,
          M = 0,
          N = 0,
          P = Hb,
          Q = Hb,
          R = 0,
          S = 0,
          T = 0,
          U = 0,
          V = 0,
          W = 0,
          X = 0,
          Y = 0,
          Z = 0,
          _ = 0,
          $ = 0,
          aa = 0,
          ba = 0,
          da = 0,
          ea = 0,
          fa = 0,
          ga = 0,
          ha = 0,
          ia = 0,
          ja = 0,
          ka = Hb,
          la = 0,
          ma = 0,
          na = 0,
          oa = 0,
          pa = 0,
          qa = 0,
          ra = 0,
          sa = 0,
          ta = 0,
          ua = Hb,
          va = Hb,
          wa = 0,
          xa = 0,
          ya = Hb,
          za = Hb,
          Aa = 0,
          Ba = 0,
          Ca = 0,
          Da = 0,
          Ea = 0,
          Fa = 0,
          Ga = 0,
          Ha = 0,
          Ia = 0,
          Ja = 0,
          Ka = 0,
          La = 0,
          Ma = 0,
          Na = 0,
          Oa = 0,
          Pa = 0,
          Qa = 0,
          Ra = Hb,
          Sa = Hb,
          Ta = Hb,
          Ua = 0,
          Va = Hb,
          Wa = Hb,
          Xa = 0,
          Ya = Hb,
          Za = Hb,
          _a = 0,
          $a = 0,
          ab = Hb,
          bb = Hb,
          cb = 0,
          db = 0,
          eb = 0,
          fb = 0,
          gb = 0,
          hb = 0,
          ib = 0,
          jb = 0,
          kb = 0,
          lb = 0,
          mb = 0,
          nb = 0,
          ob = 0,
          pb = Hb,
          qb = Hb,
          rb = Hb;ob = i;i = i + 64 | 0;v = ob + 8 | 0;q = ob;ja = ob + 56 | 0;ga = ob + 52 | 0;ia = ob + 48 | 0;ha = ob + 44 | 0;La = ob + 40 | 0;Pa = ob + 36 | 0;Ja = ob + 32 | 0;Na = ob + 28 | 0;Qa = ob + 24 | 0;Ma = ob + 20 | 0;Oa = ob + 16 | 0;Ka = ob + 12 | 0;B = ((g[k >> 2] = e, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;if (!((j | 0) == 0 | B ^ 1)) {
        c[q >> 2] = 6436;fe(b, 5, 5672, q);
      }C = ((g[k >> 2] = f, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;if (!((l | 0) == 0 | C ^ 1)) {
        c[v >> 2] = 6516;fe(b, 5, 5672, v);
      }jb = c[b >> 2] | 0;jb = (jb | 0) == 0 ? (h | 0) != 0 ? h : 1 : jb;c[b + 496 >> 2] = jb;lb = (jb | 0) == 2;kb = lb ? 3 : 2;K = b + 96 | 0;y = c[K >> 2] | 0;v = (y | 0) == 0;a: do if (v) {
        q = c[1644 + (kb << 2) >> 2] | 0;b: do if (!(c[b + 60 + (q << 3) + 4 >> 2] | 0)) {
          switch (q | 0) {case 0:case 2:case 4:case 5:
              {
                if (c[b + 112 >> 2] | 0) {
                  q = b + 108 | 0;break b;
                }break;
              }default:
              {}}q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;
        } else q = b + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
            {
              r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break a;
            }case 1:
            {
              r = ca(g[q >> 2]);break a;
            }default:
            {
              r = ca(s);break a;
            }}
      } else {
        q = b + 92 | 0;if ((y | 0) == 3) r = ca(0.0);else switch (y | 0) {case 2:
            {
              r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break a;
            }case 1:
            {
              r = ca(g[q >> 2]);break a;
            }default:
            {
              r = ca(s);break a;
            }}
      } while (0);g[b + 440 >> 2] = r;g[b + 444 >> 2] = ca(ke(b, kb, m));L = b + 72 | 0;w = (c[L >> 2] | 0) == 0;do if (w) {
        if (!(c[b + 120 >> 2] | 0)) {
          q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
        } else {
          q = b + 116 | 0;break;
        }
      } else q = b + 68 | 0; while (0);h = c[q + 4 >> 2] | 0;c: do if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
          {
            r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break c;
          }case 1:
          {
            r = ca(g[q >> 2]);break c;
          }default:
          {
            r = ca(s);break c;
          }} while (0);g[b + 428 >> 2] = r;g[b + 436 >> 2] = ca(ke(b, 0, m));g[b + 464 >> 2] = ca(se(b, kb));g[b + 468 >> 2] = ca(te(b, kb));mb = b + 288 | 0;z = (c[mb >> 2] | 0) == 0;do if (z) {
        if (!(c[b + 336 >> 2] | 0)) {
          q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
        } else {
          q = b + 332 | 0;break;
        }
      } else q = b + 284 | 0; while (0);g[b + 452 >> 2] = ca(Vn(ca(g[q >> 2]), ca(0.0)));nb = b + 304 | 0;A = (c[nb >> 2] | 0) == 0;do if (A) {
        if (!(c[b + 336 >> 2] | 0)) {
          q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
        } else {
          q = b + 332 | 0;break;
        }
      } else q = b + 300 | 0; while (0);g[b + 460 >> 2] = ca(Vn(ca(g[q >> 2]), ca(0.0)));g[b + 488 >> 2] = ca(ue(b, kb, m));g[b + 492 >> 2] = ca(ve(b, kb, m));g[b + 476 >> 2] = ca(ue(b, 0, m));g[b + 484 >> 2] = ca(ve(b, 0, m));x = c[b + 956 >> 2] | 0;if (x) {
        r = ca(ue(b, 2, e));r = ca(r + ca(se(b, 2)));F = ca(ve(b, 2, e));F = ca(r + ca(F + ca(te(b, 2))));r = ca(ue(b, 0, e));do if (z) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 284 | 0; while (0);r = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));t = ca(ve(b, 0, e));do if (A) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 300 | 0; while (0);E = ca(r + ca(t + ca(Vn(ca(g[q >> 2]), ca(0.0)))));d: do if (v) {
          do if (!(c[b + 64 >> 2] | 0)) {
            if (!(c[b + 112 >> 2] | 0)) {
              q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
            } else {
              q = b + 108 | 0;break;
            }
          } else q = b + 60 | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
              {
                r = ca(ca(ca(g[q >> 2]) * e) / ca(100.0));break d;
              }case 1:
              {
                r = ca(g[q >> 2]);break d;
              }default:
              {
                r = ca(s);break d;
              }}
        } else {
          q = b + 92 | 0;if ((y | 0) == 3) r = ca(0.0);else switch (y | 0) {case 2:
              {
                r = ca(ca(ca(g[q >> 2]) * e) / ca(100.0));break d;
              }case 1:
              {
                r = ca(g[q >> 2]);break d;
              }default:
              {
                r = ca(s);break d;
              }}
        } while (0);D = ca(r + ca(ke(b, 2, e)));do if (w) {
          if (!(c[b + 120 >> 2] | 0)) {
            q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
          } else {
            q = b + 116 | 0;break;
          }
        } else q = b + 68 | 0; while (0);h = c[q + 4 >> 2] | 0;e: do if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
            {
              r = ca(ca(ca(g[q >> 2]) * e) / ca(100.0));break e;
            }case 1:
            {
              r = ca(g[q >> 2]);break e;
            }default:
            {
              r = ca(s);break e;
            }} while (0);u = ca(r + ca(ke(b, 0, e)));if (B) t = e;else t = ca(Vn(ca(0.0), ca(ca(e - D) - F)));if (C) r = f;else r = ca(Vn(ca(0.0), ca(ca(f - u) - E)));if ((j | 0) == 1 & (l | 0) == 1) {
          ab = ca(we(b, 2, ca(e - D), m));bb = ca(ue(b, 2, m));bb = ca(bb + ca(se(b, 2)));r = ca(ve(b, 2, m));g[b + 908 >> 2] = ca(Vn(ab, ca(bb + ca(r + ca(te(b, 2))))));u = ca(we(b, 0, ca(f - u), n));r = ca(ue(b, 0, m));do if (z) {
            if (!(c[b + 336 >> 2] | 0)) {
              q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
            } else {
              q = b + 332 | 0;break;
            }
          } else q = b + 284 | 0; while (0);t = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));r = ca(ve(b, 0, m));do if (A) {
            if (!(c[b + 336 >> 2] | 0)) {
              q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
            } else {
              q = b + 332 | 0;break;
            }
          } else q = b + 300 | 0; while (0);g[b + 912 >> 2] = ca(Vn(u, ca(t + ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0)))))));
        } else {
          $b[x & 1](ja, b, t, j, r, l);bb = ca(F + ca(g[ja >> 2]));ab = ca(e - D);ab = ca(we(b, 2, (j & -3 | 0) == 0 ? bb : ab, e));bb = ca(ue(b, 2, e));bb = ca(bb + ca(se(b, 2)));r = ca(ve(b, 2, e));g[b + 908 >> 2] = ca(Vn(ab, ca(bb + ca(r + ca(te(b, 2))))));r = ca(E + ca(g[ja + 4 >> 2]));u = ca(f - u);u = ca(we(b, 0, (l & -3 | 0) == 0 ? r : u, f));r = ca(ue(b, 0, e));do if (!(c[mb >> 2] | 0)) {
            if (!(c[b + 336 >> 2] | 0)) {
              q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
            } else {
              q = b + 332 | 0;break;
            }
          } else q = b + 284 | 0; while (0);t = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));r = ca(ve(b, 0, e));do if (!(c[nb >> 2] | 0)) {
            if (!(c[b + 336 >> 2] | 0)) {
              q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
            } else {
              q = b + 332 | 0;break;
            }
          } else q = b + 300 | 0; while (0);g[b + 912 >> 2] = ca(Vn(u, ca(t + ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0)))))));
        }i = ob;return;
      }hb = b + 948 | 0;ib = qc(c[hb >> 2] | 0) | 0;if (!ib) {
        r = ca(ue(b, 2, m));r = ca(r + ca(se(b, 2)));D = ca(ve(b, 2, m));D = ca(r + ca(D + ca(te(b, 2))));r = ca(ue(b, 0, m));v = (c[mb >> 2] | 0) == 0;do if (v) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 284 | 0; while (0);r = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));t = ca(ve(b, 0, m));w = (c[nb >> 2] | 0) == 0;do if (w) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 300 | 0; while (0);u = ca(r + ca(t + ca(Vn(ca(g[q >> 2]), ca(0.0)))));q = c[K >> 2] | 0;f: do if (!q) {
          do if (!(c[b + 64 >> 2] | 0)) {
            if (!(c[b + 112 >> 2] | 0)) {
              q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
            } else {
              q = b + 108 | 0;break;
            }
          } else q = b + 60 | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
              {
                r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break f;
              }case 1:
              {
                r = ca(g[q >> 2]);break f;
              }default:
              {
                r = ca(s);break f;
              }}
        } else {
          h = b + 92 | 0;if ((q | 0) == 3) r = ca(0.0);else switch (q | 0) {case 2:
              {
                r = ca(ca(ca(g[h >> 2]) * m) / ca(100.0));break f;
              }case 1:
              {
                r = ca(g[h >> 2]);break f;
              }default:
              {
                r = ca(s);break f;
              }}
        } while (0);t = ca(r + ca(ke(b, 2, m)));do if (!(c[L >> 2] | 0)) {
          if (!(c[b + 120 >> 2] | 0)) {
            q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
          } else {
            q = b + 116 | 0;break;
          }
        } else q = b + 68 | 0; while (0);h = c[q + 4 >> 2] | 0;g: do if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
            {
              r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break g;
            }case 1:
            {
              r = ca(g[q >> 2]);break g;
            }default:
            {
              r = ca(s);break g;
            }} while (0);r = ca(r + ca(ke(b, 0, m)));Za = ca(e - t);Za = ca(we(b, 2, (j & -3 | 0) == 0 ? D : Za, m));ab = ca(ue(b, 2, m));ab = ca(ab + ca(se(b, 2)));bb = ca(ve(b, 2, m));g[b + 908 >> 2] = ca(Vn(Za, ca(ab + ca(bb + ca(te(b, 2))))));r = ca(f - r);u = ca(we(b, 0, (l & -3 | 0) == 0 ? u : r, n));r = ca(ue(b, 0, m));do if (v) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 284 | 0; while (0);t = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));r = ca(ve(b, 0, m));do if (w) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 300 | 0; while (0);g[b + 912 >> 2] = ca(Vn(u, ca(t + ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0)))))));i = ob;return;
      }do if (!o) {
        v = (j | 0) == 2;if ((!(e <= ca(0.0) & v) ? !(f <= ca(0.0) & (l | 0) == 2) : 0) ? !((j | 0) == 1 & (l | 0) == 1) : 0) break;do if (!(c[L >> 2] | 0)) {
          if (!(c[b + 120 >> 2] | 0)) {
            q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
          } else {
            q = b + 116 | 0;break;
          }
        } else q = b + 68 | 0; while (0);h = c[q + 4 >> 2] | 0;h: do if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
            {
              r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break h;
            }case 1:
            {
              r = ca(g[q >> 2]);break h;
            }default:
            {
              r = ca(s);break h;
            }} while (0);t = ca(r + ca(ke(b, 0, m)));q = c[K >> 2] | 0;i: do if (!q) {
          do if (!(c[b + 64 >> 2] | 0)) {
            if (!(c[b + 112 >> 2] | 0)) {
              q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
            } else {
              q = b + 108 | 0;break;
            }
          } else q = b + 60 | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) r = ca(0.0);else switch (h | 0) {case 2:
              {
                r = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break i;
              }case 1:
              {
                r = ca(g[q >> 2]);break i;
              }default:
              {
                r = ca(s);break i;
              }}
        } else {
          h = b + 92 | 0;if ((q | 0) == 3) r = ca(0.0);else switch (q | 0) {case 2:
              {
                r = ca(ca(ca(g[h >> 2]) * m) / ca(100.0));break i;
              }case 1:
              {
                r = ca(g[h >> 2]);break i;
              }default:
              {
                r = ca(s);break i;
              }}
        } while (0);p = B | e < ca(0.0) & v;Za = ca(e - ca(r + ca(ke(b, 2, m))));Za = ca(we(b, 2, p ? ca(0.0) : Za, m));ab = ca(ue(b, 2, m));ab = ca(ab + ca(se(b, 2)));bb = ca(ve(b, 2, m));g[b + 908 >> 2] = ca(Vn(Za, ca(ab + ca(bb + ca(te(b, 2))))));if (C) r = ca(0.0);else {
          p = f < ca(0.0) & (l | 0) == 2;r = ca(f - t);r = p ? ca(0.0) : r;
        }u = ca(we(b, 0, r, n));r = ca(ue(b, 0, m));do if (!(c[mb >> 2] | 0)) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 284 | 0; while (0);t = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));r = ca(ve(b, 0, m));do if (!(c[nb >> 2] | 0)) {
          if (!(c[b + 336 >> 2] | 0)) {
            q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
          } else {
            q = b + 332 | 0;break;
          }
        } else q = b + 300 | 0; while (0);g[b + 912 >> 2] = ca(Vn(u, ca(t + ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0)))))));i = ob;return;
      } while (0);Aa = b + 508 | 0;a[Aa >> 0] = 0;eb = b + 4 | 0;q = c[eb >> 2] | 0;j: do if (lb) {
        switch (q | 0) {case 2:
            {
              fb = 3;Ua = 0;gb = 0;break j;
            }case 3:
            break;default:
            {
              $a = 189;break j;
            }}fb = 2;Ua = 0;gb = 0;
      } else $a = 189; while (0);if (($a | 0) == 189) {
        gb = q >>> 0 < 2;fb = q;Ua = gb;gb = gb ? kb : 0;
      }_a = (fb & -2 | 0) == 2;cb = b + 8 | 0;wa = c[cb >> 2] | 0;db = b + 28 | 0;xa = (c[db >> 2] | 0) != 0;Va = _a ? m : n;Ya = _a ? n : m;ya = ca(ue(b, fb, m));ya = ca(ya + ca(se(b, fb)));za = ca(ve(b, fb, m));za = ca(za + ca(te(b, fb)));r = ca(ue(b, gb, m));r = ca(r + ca(se(b, gb)));Wa = ca(ya + za);Za = ca(ve(b, gb, m));Za = ca(r + ca(Za + ca(te(b, gb))));fa = _a ? j : l;Xa = _a ? l : j;I = _a ? Wa : Za;J = _a ? Za : Wa;q = c[K >> 2] | 0;k: do if (!q) {
        do if (!(c[b + 64 >> 2] | 0)) {
          if (!(c[b + 112 >> 2] | 0)) {
            q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
          } else {
            q = b + 108 | 0;break;
          }
        } else q = b + 60 | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) t = ca(0.0);else switch (h | 0) {case 2:
            {
              t = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break k;
            }case 1:
            {
              t = ca(g[q >> 2]);break k;
            }default:
            {
              t = ca(s);break k;
            }}
      } else {
        h = b + 92 | 0;if ((q | 0) == 3) t = ca(0.0);else switch (q | 0) {case 2:
            {
              t = ca(ca(ca(g[h >> 2]) * m) / ca(100.0));break k;
            }case 1:
            {
              t = ca(g[h >> 2]);break k;
            }default:
            {
              t = ca(s);break k;
            }}
      } while (0);H = ca(t + ca(ke(b, 2, m)));do if (!(c[L >> 2] | 0)) {
        if (!(c[b + 120 >> 2] | 0)) {
          q = (c[b + 128 >> 2] | 0) == 0 ? 1612 : b + 124 | 0;break;
        } else {
          q = b + 116 | 0;break;
        }
      } else q = b + 68 | 0; while (0);h = c[q + 4 >> 2] | 0;l: do if ((h | 0) == 3) t = ca(0.0);else switch (h | 0) {case 2:
          {
            t = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break l;
          }case 1:
          {
            t = ca(g[q >> 2]);break l;
          }default:
          {
            t = ca(s);break l;
          }} while (0);G = ca(t + ca(ke(b, 0, m)));q = b + 364 | 0;switch (c[b + 368 >> 2] | 0) {case 2:
          {
            t = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break;
          }case 1:
          {
            t = ca(g[q >> 2]);break;
          }default:
          t = ca(s);}F = ca(ca(t - H) - I);q = b + 380 | 0;switch (c[b + 384 >> 2] | 0) {case 2:
          {
            t = ca(ca(ca(g[q >> 2]) * m) / ca(100.0));break;
          }case 1:
          {
            t = ca(g[q >> 2]);break;
          }default:
          t = ca(s);}D = ca(ca(t - H) - I);q = b + 372 | 0;switch (c[b + 376 >> 2] | 0) {case 2:
          {
            t = ca(ca(ca(g[q >> 2]) * n) / ca(100.0));break;
          }case 1:
          {
            t = ca(g[q >> 2]);break;
          }default:
          t = ca(s);}E = ca(ca(t - G) - J);q = b + 388 | 0;switch (c[b + 392 >> 2] | 0) {case 2:
          {
            t = ca(ca(ca(g[q >> 2]) * n) / ca(100.0));break;
          }case 1:
          {
            t = ca(g[q >> 2]);break;
          }default:
          t = ca(s);}u = ca(ca(t - G) - J);ua = _a ? F : E;va = _a ? D : u;Sa = ca(e - H);t = ca(Sa - I);if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) bb = t;else bb = ca(Vn(ca(Wn(t, D)), F));Ra = ca(f - G);t = ca(Ra - J);if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) ab = t;else ab = ca(Vn(ca(Wn(t, u)), E));f = _a ? bb : ab;Ta = _a ? ab : bb;m: do if ((fa | 0) == 1) {
        v = 0;h = 0;while (1) {
          q = uc(c[hb >> 2] | 0, v) | 0;n: do if (h) {
            if (c[q + 24 >> 2] | 0) {
              q = h;break;
            }if (!(c[q + 944 >> 2] | 0)) {
              q = h;break;
            }t = ca(g[q + 44 >> 2]);if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              t = ca(g[q + 40 >> 2]);if (t > ca(0.0) & ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041) {
                Q = t;$a = 235;
              }
            } else {
              Q = t;$a = 235;
            }if (($a | 0) == 235 ? ($a = 0, Q != ca(0.0)) : 0) {
              q = 0;break m;
            }t = ca(g[q + 48 >> 2]);if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              if (a[(c[q + 968 >> 2] | 0) + 2 >> 0] | 0) {
                q = 0;break m;
              }t = ca(g[q + 40 >> 2]);if (!(t < ca(0.0) & ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) {
                q = h;break;
              }t = ca(-t);
            }if (t != ca(0.0)) {
              q = 0;break m;
            } else q = h;
          } else {
            if (!(c[q + 944 >> 2] | 0)) {
              q = 0;break;
            }t = ca(g[q + 44 >> 2]);if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              t = ca(g[q + 40 >> 2]);if (!(t > ca(0.0) & ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) {
                q = 0;break;
              }
            }if (!(t > ca(0.0))) {
              q = 0;break;
            }t = ca(g[q + 48 >> 2]);do if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              if (a[(c[q + 968 >> 2] | 0) + 2 >> 0] | 0) break;t = ca(g[q + 40 >> 2]);if (!(t < ca(0.0) & ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) {
                q = 0;break n;
              }P = ca(-t);$a = 249;
            } else {
              P = t;$a = 249;
            } while (0);if (($a | 0) == 249 ? ($a = 0, !(P > ca(0.0))) : 0) {
              q = 0;break;
            }
          } while (0);v = v + 1 | 0;if (v >>> 0 >= ib >>> 0) break;else h = q;
        }
      } else q = 0; while (0);_ = (jb | 0) != 0 ? jb : 1;$ = 1644 + (fb << 2) | 0;W = (g[k >> 2] = bb, c[k >> 2] | 0) & 2147483647;da = W >>> 0 < 2139095041;ba = (g[k >> 2] = ab, c[k >> 2] | 0) & 2147483647;ea = ba >>> 0 < 2139095041;aa = b + 32 | 0;ba = ba >>> 0 > 2139095040;T = (l | 0) == 1;U = b + 16 | 0;V = (j | 0) == 1;W = W >>> 0 > 2139095040;X = q + 500 | 0;Y = q + 504 | 0;w = 0;x = 0;Z = 0;t = ca(0.0);while (1) {
        S = uc(c[hb >> 2] | 0, Z) | 0;if ((c[S + 36 >> 2] | 0) == 1) {
          xe(S);a[S + 977 >> 0] = 1;a[S + 976 >> 0] = 0;v = w;h = x;
        } else {
          h = S + 380 | 0;v = c[S + 384 >> 2] | 0;do if (!v) $a = 259;else {
            ta = S + 368 | 0;if ((v | 0) != (d[ta >> 0] | d[ta + 1 >> 0] << 8 | d[ta + 2 >> 0] << 16 | d[ta + 3 >> 0] << 24 | 0)) {
              $a = 259;break;
            }a[k >> 0] = a[h >> 0];a[k + 1 >> 0] = a[h + 1 >> 0];a[k + 2 >> 0] = a[h + 2 >> 0];a[k + 3 >> 0] = a[h + 3 >> 0];ka = ca(g[k >> 2]);ta = S + 364 | 0;a[k >> 0] = a[ta >> 0];a[k + 1 >> 0] = a[ta + 1 >> 0];a[k + 2 >> 0] = a[ta + 2 >> 0];a[k + 3 >> 0] = a[ta + 3 >> 0];if (!(ca(O(ca(ka - ca(g[k >> 2])))) < ca(.0000999999974))) {
              $a = 259;break;
            }c[S + 984 >> 2] = h;
          } while (0);if (($a | 0) == 259) {
            $a = 0;c[S + 984 >> 2] = S + 348;
          }h = S + 388 | 0;v = c[S + 392 >> 2] | 0;do if (!v) $a = 264;else {
            ta = S + 376 | 0;if ((v | 0) != (d[ta >> 0] | d[ta + 1 >> 0] << 8 | d[ta + 2 >> 0] << 16 | d[ta + 3 >> 0] << 24 | 0)) {
              $a = 264;break;
            }a[k >> 0] = a[h >> 0];a[k + 1 >> 0] = a[h + 1 >> 0];a[k + 2 >> 0] = a[h + 2 >> 0];a[k + 3 >> 0] = a[h + 3 >> 0];ka = ca(g[k >> 2]);ta = S + 372 | 0;a[k >> 0] = a[ta >> 0];a[k + 1 >> 0] = a[ta + 1 >> 0];a[k + 2 >> 0] = a[ta + 2 >> 0];a[k + 3 >> 0] = a[ta + 3 >> 0];if (!(ca(O(ca(ka - ca(g[k >> 2])))) < ca(.0000999999974))) {
              $a = 264;break;
            }c[S + 988 >> 2] = h;
          } while (0);if (($a | 0) == 264) {
            $a = 0;c[S + 988 >> 2] = S + 356;
          }if (o) {
            ta = c[S >> 2] | 0;me(S, (ta | 0) == 0 ? _ : ta, f, Ta, bb);
          }do if ((c[S + 24 >> 2] | 0) == 1) {
            if (w) c[w + 952 >> 2] = S;c[S + 952 >> 2] = 0;w = S;x = (x | 0) == 0 ? S : x;
          } else {
            if ((S | 0) == (q | 0)) {
              c[X >> 2] = c[149];g[Y >> 2] = ca(0.0);break;
            }h = c[eb >> 2] | 0;o: do if (lb) {
              switch (h | 0) {case 2:
                  {
                    h = 3;break o;
                  }case 3:
                  break;default:
                  {
                    $a = 276;break o;
                  }}h = 2;
            } else $a = 276; while (0);R = (h & -2 | 0) == 2;D = R ? bb : ab;p: do switch (c[S + 56 >> 2] | 0) {case 0:case 3:
                {
                  ka = ca(g[S + 40 >> 2]);if (!(ka > ca(0.0) & ((g[k >> 2] = ka, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) {
                    v = 1684;break p;
                  }v = (a[(c[S + 968 >> 2] | 0) + 2 >> 0] | 0) != 0 ? 1684 : 1612;break;
                }default:
                v = S + 52 | 0;} while (0);switch (c[v + 4 >> 2] | 0) {case 2:
                {
                  u = ca(ca(D * ca(g[v >> 2])) / ca(100.0));break;
                }case 1:
                {
                  u = ca(g[v >> 2]);break;
                }default:
                u = ca(s);}z = c[S + 984 >> 2] | 0;A = c[z + 4 >> 2] | 0;q: do switch (A | 0) {case 0:case 3:
                {
                  B = 0;break;
                }case 1:
                {
                  if (ca(g[z >> 2]) < ca(0.0)) {
                    B = 0;break q;
                  }B = 1;break;
                }default:
                {
                  if ((A | 0) != 2) {
                    B = 1;break q;
                  }if (ca(g[z >> 2]) < ca(0.0)) {
                    B = 0;break q;
                  }B = da;
                }} while (0);C = c[S + 988 >> 2] | 0;K = c[C + 4 >> 2] | 0;r: do switch (K | 0) {case 0:case 3:
                {
                  L = 0;break;
                }case 1:
                {
                  if (ca(g[C >> 2]) < ca(0.0)) {
                    L = 0;break r;
                  }L = 1;break;
                }default:
                {
                  if ((K | 0) != 2) {
                    L = 1;break r;
                  }if (ca(g[C >> 2]) < ca(0.0)) {
                    L = 0;break r;
                  }L = ea;
                }} while (0);do if (((g[k >> 2] = u, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) $a = 301;else {
              if (((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                $a = 301;break;
              }v = S + 504 | 0;if ((c[v >> 2] & 2147483647) >>> 0 <= 2139095040) {
                if (!(a[c[S + 968 >> 2] >> 0] | 0)) {
                  $a = 387;break;
                }if ((c[S + 500 >> 2] | 0) == (c[149] | 0)) {
                  $a = 387;break;
                }
              }e = ca(ue(S, h, bb));e = ca(e + ca(se(S, h)));ka = ca(ve(S, h, bb));g[v >> 2] = ca(Vn(u, ca(e + ca(ka + ca(te(S, h))))));$a = 387;
            } while (0);s: do if (($a | 0) == 301) {
              N = R ^ 1;M = B ^ 1;if (!(N | M)) {
                switch (A | 0) {case 2:
                    {
                      u = ca(ca(bb * ca(g[z >> 2])) / ca(100.0));break;
                    }case 1:
                    {
                      u = ca(g[z >> 2]);break;
                    }default:
                    u = ca(s);}e = ca(ue(S, 2, bb));e = ca(e + ca(se(S, 2)));ka = ca(ve(S, 2, bb));g[S + 504 >> 2] = ca(Vn(u, ca(e + ca(ka + ca(te(S, 2))))));$a = 387;break;
              }l = L ^ 1;if (!(R | l)) {
                switch (K | 0) {case 2:
                    {
                      E = ca(ca(ab * ca(g[C >> 2])) / ca(100.0));break;
                    }case 1:
                    {
                      E = ca(g[C >> 2]);break;
                    }default:
                    E = ca(s);}u = ca(ue(S, 0, bb));do if (!(c[S + 288 >> 2] | 0)) {
                  if (!(c[S + 336 >> 2] | 0)) {
                    h = (c[S + 344 >> 2] | 0) == 0 ? 1612 : S + 340 | 0;break;
                  } else {
                    h = S + 332 | 0;break;
                  }
                } else h = S + 284 | 0; while (0);u = ca(u + ca(Vn(ca(g[h >> 2]), ca(0.0))));D = ca(ve(S, 0, bb));do if (!(c[S + 304 >> 2] | 0)) {
                  if (!(c[S + 336 >> 2] | 0)) {
                    h = (c[S + 344 >> 2] | 0) == 0 ? 1612 : S + 340 | 0;break;
                  } else {
                    h = S + 332 | 0;break;
                  }
                } else h = S + 300 | 0; while (0);g[S + 504 >> 2] = ca(Vn(E, ca(u + ca(D + ca(Vn(ca(g[h >> 2]), ca(0.0)))))));$a = 387;break;
              }g[ja >> 2] = ca(s);g[ga >> 2] = ca(s);c[ia >> 2] = 0;c[ha >> 2] = 0;v = c[S + 96 >> 2] | 0;t: do if (!v) {
                do if (!(c[S + 64 >> 2] | 0)) {
                  if (!(c[S + 112 >> 2] | 0)) {
                    v = (c[S + 128 >> 2] | 0) == 0 ? 1612 : S + 124 | 0;break;
                  } else {
                    v = S + 108 | 0;break;
                  }
                } else v = S + 60 | 0; while (0);y = c[v + 4 >> 2] | 0;if ((y | 0) == 3) {
                  u = ca(0.0);break;
                }switch (y | 0) {case 2:
                    {
                      u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break t;
                    }case 1:
                    {
                      u = ca(g[v >> 2]);break t;
                    }default:
                    {
                      u = ca(s);break t;
                    }}
              } else {
                y = S + 92 | 0;if ((v | 0) == 3) {
                  u = ca(0.0);break;
                }switch (v | 0) {case 2:
                    {
                      u = ca(ca(bb * ca(g[y >> 2])) / ca(100.0));break t;
                    }case 1:
                    {
                      u = ca(g[y >> 2]);break t;
                    }default:
                    {
                      u = ca(s);break t;
                    }}
              } while (0);G = ca(u + ca(ke(S, 2, bb)));do if (!(c[S + 72 >> 2] | 0)) {
                if (!(c[S + 120 >> 2] | 0)) {
                  v = (c[S + 128 >> 2] | 0) == 0 ? 1612 : S + 124 | 0;break;
                } else {
                  v = S + 116 | 0;break;
                }
              } else v = S + 68 | 0; while (0);y = c[v + 4 >> 2] | 0;u: do if ((y | 0) == 3) u = ca(0.0);else switch (y | 0) {case 2:
                  {
                    u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break u;
                  }case 1:
                  {
                    u = ca(g[v >> 2]);break u;
                  }default:
                  {
                    u = ca(s);break u;
                  }} while (0);F = ca(u + ca(ke(S, 0, bb)));if (B) {
                switch (A | 0) {case 2:
                    {
                      u = ca(ca(bb * ca(g[z >> 2])) / ca(100.0));break;
                    }case 1:
                    {
                      u = ca(g[z >> 2]);break;
                    }default:
                    u = ca(s);}E = ca(G + u);g[ja >> 2] = E;c[ia >> 2] = 1;A = (g[k >> 2] = E, c[k >> 2] | 0);y = 1;
              } else {
                A = 2143289344;E = ca(s);y = 0;
              }if (L) {
                switch (K | 0) {case 2:
                    {
                      u = ca(ca(ab * ca(g[C >> 2])) / ca(100.0));break;
                    }case 1:
                    {
                      u = ca(g[C >> 2]);break;
                    }default:
                    u = ca(s);}D = ca(F + u);g[ga >> 2] = D;c[ha >> 2] = 1;B = (g[k >> 2] = D, c[k >> 2] | 0);z = 1;
              } else {
                B = 2143289344;D = ca(s);z = 0;
              }v = c[aa >> 2] | 0;if (!(R & (v | 0) == 2)) {
                if (!((A & 2147483647) >>> 0 < 2139095041 | W)) {
                  g[ja >> 2] = bb;c[ia >> 2] = 2;E = bb;y = 2;
                }if ((v | 0) == 2 & (R ^ 1)) $a = 361;else $a = 358;
              } else $a = 358;do if (($a | 0) == 358) {
                $a = 0;if (!((B & 2147483647) >>> 0 < 2139095041 | ba)) {
                  g[ga >> 2] = ab;c[ha >> 2] = 2;D = ab;z = 2;
                }if (!R) {
                  $a = 361;break;
                }if (!(ea & (T & l))) {
                  v = z;break;
                }v = c[S + 20 >> 2] | 0;if (!v) v = c[U >> 2] | 0;if ((v | 0) != 4) {
                  v = z;break;
                }g[ga >> 2] = ab;c[ha >> 2] = 1;v = 1;D = ab;
              } while (0);do if (($a | 0) == 361) {
                $a = 0;if (!(da & (V & M))) {
                  v = z;break;
                }v = c[S + 20 >> 2] | 0;if (!v) v = c[U >> 2] | 0;if ((v | 0) != 4) {
                  v = z;break;
                }g[ja >> 2] = bb;c[ia >> 2] = 1;y = 1;E = bb;v = z;
              } while (0);u = ca(g[S + 396 >> 2]);do if (((g[k >> 2] = u, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
                if (!((y | 0) == 1 & N)) {
                  if (!(R & (v | 0) == 1)) break;Q = ca(u * ca(D - F));e = ca(ue(S, 2, bb));e = ca(e + ca(se(S, 2)));ka = ca(ve(S, 2, bb));g[S + 504 >> 2] = ca(Vn(Q, ca(e + ca(ka + ca(te(S, 2))))));break s;
                }E = ca(ca(E - G) / u);u = ca(ue(S, 0, bb));do if (!(c[S + 288 >> 2] | 0)) {
                  if (!(c[S + 336 >> 2] | 0)) {
                    h = (c[S + 344 >> 2] | 0) == 0 ? 1612 : S + 340 | 0;break;
                  } else {
                    h = S + 332 | 0;break;
                  }
                } else h = S + 284 | 0; while (0);u = ca(u + ca(Vn(ca(g[h >> 2]), ca(0.0))));D = ca(ve(S, 0, bb));do if (!(c[S + 304 >> 2] | 0)) {
                  if (!(c[S + 336 >> 2] | 0)) {
                    h = (c[S + 344 >> 2] | 0) == 0 ? 1612 : S + 340 | 0;break;
                  } else {
                    h = S + 332 | 0;break;
                  }
                } else h = S + 300 | 0; while (0);g[S + 504 >> 2] = ca(Vn(E, ca(u + ca(D + ca(Vn(ca(g[h >> 2]), ca(0.0)))))));break s;
              } while (0);ye(S, 2, bb, bb, ia, ja);ye(S, 0, ab, bb, ha, ga);e = ca(g[ja >> 2]);Q = ca(g[ga >> 2]);ce(S, e, Q, jb, c[ia >> 2] | 0, c[ha >> 2] | 0, bb, ab, 0, 6598, p) | 0;Q = ca(g[S + 908 + (c[1692 + (h << 2) >> 2] << 2) >> 2]);e = ca(ue(S, h, bb));e = ca(e + ca(se(S, h)));ka = ca(ve(S, h, bb));g[S + 504 >> 2] = ca(Vn(Q, ca(e + ca(ka + ca(te(S, h))))));$a = 387;
            } while (0);if (($a | 0) == 387) {
              $a = 0;c[S + 500 >> 2] = c[149];
            }
          } while (0);D = ca(g[S + 504 >> 2]);v: do if (_a) {
            h = c[S + 96 >> 2] | 0;if (!h) {
              $a = 395;break;
            }v = S + 92 | 0;if ((h | 0) == 3) {
              u = ca(0.0);break;
            }switch (h | 0) {case 2:
                {
                  u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break v;
                }case 1:
                {
                  u = ca(g[v >> 2]);break v;
                }default:
                {
                  u = ca(s);break v;
                }}
          } else $a = 395; while (0);w: do if (($a | 0) == 395) {
            $a = 0;h = c[$ >> 2] | 0;x: do if (!(c[S + 60 + (h << 3) + 4 >> 2] | 0)) {
              do if (Ua) {
                if (!(c[S + 120 >> 2] | 0)) break;h = S + 116 | 0;break x;
              } while (0);y: do switch (h | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[S + 112 >> 2] | 0)) break y;h = S + 108 | 0;break x;
                  }default:
                  {}} while (0);h = (c[S + 128 >> 2] | 0) == 0 ? 1612 : S + 124 | 0;
            } else h = S + 60 + (h << 3) | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
              u = ca(0.0);break;
            }switch (v | 0) {case 2:
                {
                  u = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break w;
                }case 1:
                {
                  u = ca(g[h >> 2]);break w;
                }default:
                {
                  u = ca(s);break w;
                }}
          } while (0);v = w;h = x;t = ca(t + ca(D + ca(u + ca(ke(S, fb, bb)))));
        }Z = Z + 1 | 0;if ((Z | 0) == (ib | 0)) {
          ta = h;break;
        } else {
          w = v;x = h;
        }
      }q = (fa | 0) == 0 ? 0 : t > f & 1;if (xa) fa = (fa | 0) == 2 & (q | 0) != 0 ? 1 : fa;N = (Xa | 0) == 1;T = N & (o ^ 1);U = (fa | 0) == 1;V = (fa | 0) == 2;W = 1692 + (fb << 2) | 0;X = (Xa & -3 | 0) == 0;qa = N & (xa ^ 1);Y = (gb & -2 | 0) == 2;Z = 1644 + (gb << 2) | 0;_ = gb >>> 0 < 2;$ = 1644 + (gb << 2) | 0;aa = b + 16 | 0;ba = 1692 + (gb << 2) | 0;da = 1660 + (gb << 2) | 0;ea = 1644 + (fb << 2) | 0;ia = (g[k >> 2] = Ta, c[k >> 2] | 0) & 2147483647;ra = ia >>> 0 < 2139095041;ga = 1644 + (fb << 2) | 0;ha = 1660 + (fb << 2) | 0;ia = ia >>> 0 > 2139095040;ja = (Xa | 0) != 1;la = ia ? 0 : 2;R = ((g[k >> 2] = ua, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041;S = ((g[k >> 2] = va, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041;ma = b + 968 | 0;na = b + 944 | 0;oa = b + 44 | 0;pa = b + 40 | 0;sa = ra ^ 1;N = xa & (q | 0) != 0 | N ^ 1;l = 0;v = 0;ka = ca(0.0);u = ca(0.0);while (1) {
        z: do if (l >>> 0 < ib >>> 0) {
          A = 0;q = l;B = 0;x = 0;J = ca(0.0);H = ca(0.0);D = ca(0.0);t = ca(0.0);while (1) {
            z = uc(c[hb >> 2] | 0, q) | 0;do if ((c[z + 36 >> 2] | 0) == 1) {
              h = A;w = B;E = J;F = H;
            } else {
              c[z + 940 >> 2] = v;y = c[z + 24 >> 2] | 0;if ((y | 0) == 1) {
                h = A;w = B;E = J;F = H;break;
              }A: do if (_a) {
                h = c[z + 96 >> 2] | 0;if (!h) {
                  $a = 422;break;
                }w = z + 92 | 0;if ((h | 0) == 3) {
                  E = ca(0.0);break;
                }switch (h | 0) {case 2:
                    {
                      E = ca(ca(bb * ca(g[w >> 2])) / ca(100.0));break A;
                    }case 1:
                    {
                      E = ca(g[w >> 2]);break A;
                    }default:
                    {
                      E = ca(s);break A;
                    }}
              } else $a = 422; while (0);B: do if (($a | 0) == 422) {
                $a = 0;h = c[ea >> 2] | 0;C: do if (!(c[z + 60 + (h << 3) + 4 >> 2] | 0)) {
                  do if (Ua) {
                    if (!(c[z + 120 >> 2] | 0)) break;h = z + 116 | 0;break C;
                  } while (0);D: do switch (h | 0) {case 0:case 2:case 4:case 5:
                      {
                        if (!(c[z + 112 >> 2] | 0)) break D;h = z + 108 | 0;break C;
                      }default:
                      {}} while (0);h = (c[z + 128 >> 2] | 0) == 0 ? 1612 : z + 124 | 0;
                } else h = z + 60 + (h << 3) | 0; while (0);w = c[h + 4 >> 2] | 0;if ((w | 0) == 3) {
                  E = ca(0.0);break;
                }switch (w | 0) {case 2:
                    {
                      E = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break B;
                    }case 1:
                    {
                      E = ca(g[h >> 2]);break B;
                    }default:
                    {
                      E = ca(s);break B;
                    }}
              } while (0);G = ca(E + ca(ke(z, fb, bb)));w = c[W >> 2] | 0;h = z + 380 + (w << 3) | 0;switch (c[z + 380 + (w << 3) + 4 >> 2] | 0) {case 2:
                  {
                    E = ca(ca(Va * ca(g[h >> 2])) / ca(100.0));break;
                  }case 1:
                  {
                    E = ca(g[h >> 2]);break;
                  }default:
                  E = ca(s);}I = ca(g[z + 504 >> 2]);F = ca(Wn(E, I));h = z + 364 + (w << 3) | 0;switch (c[z + 364 + (w << 3) + 4 >> 2] | 0) {case 2:
                  {
                    E = ca(ca(Va * ca(g[h >> 2])) / ca(100.0));break;
                  }case 1:
                  {
                    E = ca(g[h >> 2]);break;
                  }default:
                  E = ca(s);}E = ca(Vn(E, F));if (xa & (x | 0) != 0 & ca(G + ca(H + E)) > f) {
                M = q;w = B;L = x;E = J;break z;
              }G = ca(G + E);H = ca(H + G);G = ca(J + G);x = x + 1 | 0;E: do if (!y) {
                if (!(c[z + 944 >> 2] | 0)) break;E = ca(g[z + 44 >> 2]);h = ((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;if (h) {
                  F = ca(g[z + 40 >> 2]);if (F > ca(0.0) & ((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041) $a = 446;else $a = 447;
                } else {
                  F = E;$a = 446;
                }if (($a | 0) == 446 ? ($a = 0, !(F != ca(0.0))) : 0) $a = 447;do if (($a | 0) == 447) {
                  $a = 0;F = ca(g[z + 48 >> 2]);if (((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                    if (a[(c[z + 968 >> 2] | 0) + 2 >> 0] | 0) break;F = ca(g[z + 40 >> 2]);if (!(F < ca(0.0) & ((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break E;F = ca(-F);
                  }if (!(F != ca(0.0))) break E;
                } while (0);if (h) {
                  E = ca(g[z + 40 >> 2]);M = E > ca(0.0) & ((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041;E = M ? E : ca(0.0);
                }D = ca(D + E);E = ca(g[z + 48 >> 2]);F: do if (((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                  h = a[(c[z + 968 >> 2] | 0) + 2 >> 0] | 0;do if (!(h << 24 >> 24)) {
                    E = ca(g[z + 40 >> 2]);if (!(E < ca(0.0) & ((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break;E = ca(-E);break F;
                  } while (0);E = h << 24 >> 24 != 0 ? ca(1.0) : ca(0.0);
                } while (0);t = ca(t - ca(E * I));
              } while (0);if (A) c[A + 952 >> 2] = z;c[z + 952 >> 2] = 0;h = z;w = (B | 0) == 0 ? z : B;E = G;F = H;
            } while (0);q = q + 1 | 0;if (q >>> 0 < ib >>> 0) {
              A = h;B = w;J = E;H = F;
            } else {
              M = q;L = x;break;
            }
          }
        } else {
          M = l;w = 0;L = 0;E = ca(0.0);D = ca(0.0);t = ca(0.0);
        } while (0);K = D > ca(0.0) & D < ca(1.0);Q = K ? ca(1.0) : D;K = t > ca(0.0) & t < ca(1.0);P = K ? ca(1.0) : t;G: do if (!U) {
          if (R & E < ua) {
            f = ua;break;
          }if (S & E > va) {
            f = va;break;
          }if (a[(c[ma >> 2] | 0) + 3 >> 0] | 0) break;do if (!(Q == ca(0.0))) {
            if (!(c[na >> 2] | 0)) break;t = ca(g[oa >> 2]);if (((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
              t = ca(g[pa >> 2]);if (!(t > ca(0.0) & ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break;
            }if (!(t == ca(0.0))) break G;
          } while (0);f = E;
        } while (0);do if (((g[k >> 2] = f, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
          if (!(E < ca(0.0))) {
            e = ca(0.0);break;
          }e = ca(-E);
        } else e = ca(f - E); while (0);H: do if (T) t = ca(0.0);else {
          A = (w | 0) == 0;if (A) {
            t = ca(0.0);break;
          }h = c[W >> 2] | 0;x = e < ca(0.0);I = ca(e / P);y = e > ca(0.0);J = ca(e / Q);z = w;E = ca(0.0);t = ca(0.0);D = ca(0.0);do {
            q = z + 380 + (h << 3) | 0;switch (c[z + 380 + (h << 3) + 4 >> 2] | 0) {case 2:
                {
                  G = ca(ca(Va * ca(g[q >> 2])) / ca(100.0));break;
                }case 1:
                {
                  G = ca(g[q >> 2]);break;
                }default:
                G = ca(s);}q = z + 364 + (h << 3) | 0;switch (c[z + 364 + (h << 3) + 4 >> 2] | 0) {case 2:
                {
                  F = ca(ca(Va * ca(g[q >> 2])) / ca(100.0));break;
                }case 1:
                {
                  F = ca(g[q >> 2]);break;
                }default:
                F = ca(s);}H = ca(Wn(G, ca(Vn(F, ca(g[z + 504 >> 2])))));do if (x) {
              I: do if (!(c[z + 944 >> 2] | 0)) F = ca(0.0);else {
                F = ca(g[z + 48 >> 2]);if (((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) break;q = a[(c[z + 968 >> 2] | 0) + 2 >> 0] | 0;do if (!(q << 24 >> 24)) {
                  F = ca(g[z + 40 >> 2]);if (!(F < ca(0.0) & ((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break;F = ca(-F);break I;
                } while (0);F = q << 24 >> 24 != 0 ? ca(1.0) : ca(0.0);
              } while (0);F = ca(H * F);if (!(F != ca(-0.0))) break;pb = ca(H - ca(F * I));rb = ca(we(z, fb, pb, f));qb = ca(ue(z, fb, bb));qb = ca(qb + ca(se(z, fb)));G = ca(ve(z, fb, bb));G = ca(Vn(rb, ca(qb + ca(G + ca(te(z, fb))))));if (!(pb != G)) break;t = ca(t + F);D = ca(D - ca(G - H));
            } else {
              if (!y) break;if (!(c[z + 944 >> 2] | 0)) break;F = ca(g[z + 44 >> 2]);if (((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                F = ca(g[z + 40 >> 2]);if (!(F > ca(0.0) & ((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break;
              }if (!(F != ca(0.0))) break;rb = ca(H + ca(F * J));pb = ca(we(z, fb, rb, f));qb = ca(ue(z, fb, bb));qb = ca(qb + ca(se(z, fb)));G = ca(ve(z, fb, bb));G = ca(Vn(pb, ca(qb + ca(G + ca(te(z, fb))))));if (!(rb != G)) break;E = ca(E - F);D = ca(D - ca(G - H));
            } while (0);z = c[z + 952 >> 2] | 0;
          } while ((z | 0) != 0);t = ca(P + t);D = ca(e + D);if (A) {
            t = ca(0.0);break;
          }I = ca(Q + E);B = c[W >> 2] | 0;C = D < ca(0.0);K = t == ca(0.0);J = ca(D / t);z = c[ba >> 2] | 0;A = D > ca(0.0);I = ca(D / I);y = w;t = ca(0.0);while (1) {
            q = y + 380 + (B << 3) | 0;switch (c[y + 380 + (B << 3) + 4 >> 2] | 0) {case 2:
                {
                  E = ca(ca(Va * ca(g[q >> 2])) / ca(100.0));break;
                }case 1:
                {
                  E = ca(g[q >> 2]);break;
                }default:
                E = ca(s);}q = y + 364 + (B << 3) | 0;switch (c[y + 364 + (B << 3) + 4 >> 2] | 0) {case 2:
                {
                  D = ca(ca(Va * ca(g[q >> 2])) / ca(100.0));break;
                }case 1:
                {
                  D = ca(g[q >> 2]);break;
                }default:
                D = ca(s);}E = ca(Wn(E, ca(Vn(D, ca(g[y + 504 >> 2])))));do if (C) {
              J: do if (!(c[y + 944 >> 2] | 0)) D = ca(0.0);else {
                D = ca(g[y + 48 >> 2]);if (((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) break;q = a[(c[y + 968 >> 2] | 0) + 2 >> 0] | 0;do if (!(q << 24 >> 24)) {
                  D = ca(g[y + 40 >> 2]);if (!(D < ca(0.0) & ((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break;D = ca(-D);break J;
                } while (0);D = q << 24 >> 24 != 0 ? ca(1.0) : ca(0.0);
              } while (0);rb = ca(E * D);D = ca(-rb);if (!(rb != ca(-0.0))) {
                F = E;break;
              }qb = ca(J * D);qb = ca(we(y, fb, ca(E + (K ? D : qb)), f));rb = ca(ue(y, fb, bb));rb = ca(rb + ca(se(y, fb)));F = ca(ve(y, fb, bb));F = ca(Vn(qb, ca(rb + ca(F + ca(te(y, fb))))));
            } else {
              if (!A) {
                F = E;break;
              }if (!(c[y + 944 >> 2] | 0)) {
                F = E;break;
              }D = ca(g[y + 44 >> 2]);if (((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                D = ca(g[y + 40 >> 2]);if (!(D > ca(0.0) & ((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) {
                  F = E;break;
                }
              }if (!(D != ca(0.0))) {
                F = E;break;
              }qb = ca(we(y, fb, ca(E + ca(D * I)), f));rb = ca(ue(y, fb, bb));rb = ca(rb + ca(se(y, fb)));F = ca(ve(y, fb, bb));F = ca(Vn(qb, ca(rb + ca(F + ca(te(y, fb))))));
            } while (0);t = ca(t - ca(F - E));K: do if (_a) {
              q = c[y + 96 >> 2] | 0;if (!q) {
                $a = 534;break;
              }h = y + 92 | 0;if ((q | 0) == 3) {
                D = ca(0.0);break;
              }switch (q | 0) {case 2:
                  {
                    D = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break K;
                  }case 1:
                  {
                    D = ca(g[h >> 2]);break K;
                  }default:
                  {
                    D = ca(s);break K;
                  }}
            } else $a = 534; while (0);L: do if (($a | 0) == 534) {
              $a = 0;q = c[ea >> 2] | 0;M: do if (!(c[y + 60 + (q << 3) + 4 >> 2] | 0)) {
                do if (Ua) {
                  if (!(c[y + 120 >> 2] | 0)) break;q = y + 116 | 0;break M;
                } while (0);N: do switch (q | 0) {case 0:case 2:case 4:case 5:
                    {
                      if (!(c[y + 112 >> 2] | 0)) break N;q = y + 108 | 0;break M;
                    }default:
                    {}} while (0);q = (c[y + 128 >> 2] | 0) == 0 ? 1612 : y + 124 | 0;
              } else q = y + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                D = ca(0.0);break;
              }switch (h | 0) {case 2:
                  {
                    D = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break L;
                  }case 1:
                  {
                    D = ca(g[q >> 2]);break L;
                  }default:
                  {
                    D = ca(s);break L;
                  }}
            } while (0);H = ca(D + ca(ke(y, fb, bb)));O: do if (Y) {
              q = c[y + 96 >> 2] | 0;if (!q) {
                $a = 553;break;
              }h = y + 92 | 0;if ((q | 0) == 3) {
                D = ca(0.0);break;
              }switch (q | 0) {case 2:
                  {
                    D = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break O;
                  }case 1:
                  {
                    D = ca(g[h >> 2]);break O;
                  }default:
                  {
                    D = ca(s);break O;
                  }}
            } else $a = 553; while (0);P: do if (($a | 0) == 553) {
              $a = 0;q = c[Z >> 2] | 0;Q: do if (!(c[y + 60 + (q << 3) + 4 >> 2] | 0)) {
                do if (_) {
                  if (!(c[y + 120 >> 2] | 0)) break;q = y + 116 | 0;break Q;
                } while (0);R: do switch (q | 0) {case 0:case 2:case 4:case 5:
                    {
                      if (!(c[y + 112 >> 2] | 0)) break R;q = y + 108 | 0;break Q;
                    }default:
                    {}} while (0);q = (c[y + 128 >> 2] | 0) == 0 ? 1612 : y + 124 | 0;
              } else q = y + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                D = ca(0.0);break;
              }switch (h | 0) {case 2:
                  {
                    D = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break P;
                  }case 1:
                  {
                    D = ca(g[q >> 2]);break P;
                  }default:
                  {
                    D = ca(s);break P;
                  }}
            } while (0);G = ca(D + ca(ke(y, gb, bb)));E = ca(F + H);g[Pa >> 2] = E;c[Na >> 2] = 1;x = y + 984 + (z << 2) | 0;h = c[x >> 2] | 0;w = c[h + 4 >> 2] | 0;S: do if (ia) $a = 575;else {
              switch (w | 0) {case 0:case 3:
                  break;case 1:
                  {
                    if (!(ca(g[h >> 2]) < ca(0.0))) {
                      $a = 576;break S;
                    }break;
                  }case 2:
                  {
                    if (!(ca(g[h >> 2]) < ca(0.0))) {
                      $a = 577;break S;
                    }break;
                  }default:
                  {
                    D = ca(s);$a = 581;break S;
                  }}if (N) {
                $a = 575;break;
              }q = c[y + 20 >> 2] | 0;if (!q) q = c[aa >> 2] | 0;if ((q | 0) != 4) {
                $a = 575;break;
              }g[La >> 2] = Ta;c[Ja >> 2] = 1;
            } while (0);if (($a | 0) == 575) switch (w | 0) {case 0:case 3:
                {
                  $a = 578;break;
                }case 1:
                {
                  $a = 576;break;
                }case 2:
                {
                  $a = 577;break;
                }default:
                {
                  D = ca(s);$a = 581;
                }}do if (($a | 0) == 576) {
              if (ca(g[h >> 2]) < ca(0.0)) {
                $a = 578;break;
              }D = ca(g[h >> 2]);$a = 581;
            } else if (($a | 0) == 577) {
              if (!(ra & !(ca(g[h >> 2]) < ca(0.0)))) {
                $a = 578;break;
              }D = ca(ca(Ta * ca(g[h >> 2])) / ca(100.0));$a = 581;
            } while (0);if (($a | 0) == 578) {
              $a = 0;g[La >> 2] = Ta;c[Ja >> 2] = la;
            } else if (($a | 0) == 581) {
              $a = 0;rb = ca(G + D);g[La >> 2] = rb;c[Ja >> 2] = (((g[k >> 2] = rb, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040 | ja & (c[(c[x >> 2] | 0) + 4 >> 2] | 0) == 2) & 1 ^ 1;
            }q = y + 396 | 0;D = ca(g[q >> 2]);if (((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
              qb = ca(E - H);pb = ca(qb / D);qb = ca(D * qb);rb = ca(ue(y, gb, bb));rb = ca(rb + ca(se(y, gb)));D = ca(ve(y, gb, bb));D = ca(Vn(_a ? pb : qb, ca(rb + ca(D + ca(te(y, gb))))));g[La >> 2] = D;c[Ja >> 2] = 1;T: do if (!(c[y + 24 >> 2] | 0)) {
                if (!(c[y + 944 >> 2] | 0)) break;E = ca(g[y + 44 >> 2]);if (((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                  E = ca(g[y + 40 >> 2]);if (E > ca(0.0) & ((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041) $a = 587;else $a = 588;
                } else $a = 587;if (($a | 0) == 587 ? ($a = 0, !(E != ca(0.0))) : 0) $a = 588;do if (($a | 0) == 588) {
                  $a = 0;E = ca(g[y + 48 >> 2]);if (((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                    if (a[(c[y + 968 >> 2] | 0) + 2 >> 0] | 0) break;E = ca(g[y + 40 >> 2]);if (!(E < ca(0.0) & ((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041)) break T;E = ca(-E);
                  }if (!(E != ca(0.0))) break T;
                } while (0);D = ca(Wn(ca(D - G), Ta));g[La >> 2] = D;rb = ca(g[q >> 2]);qb = ca(D * rb);rb = ca(D / rb);g[Pa >> 2] = ca(H + (_a ? qb : rb));
              } while (0);g[La >> 2] = ca(G + D);
            }ye(y, fb, f, bb, Na, Pa);ye(y, gb, Ta, bb, Ja, La);q = c[y + 984 + (z << 2) >> 2] | 0;switch (c[q + 4 >> 2] | 0) {case 0:case 3:
                {
                  $a = 598;break;
                }case 1:
                {
                  if (ca(g[q >> 2]) < ca(0.0)) $a = 598;else q = 0;break;
                }case 2:
                {
                  if (ra & !(ca(g[q >> 2]) < ca(0.0))) q = 0;else $a = 598;break;
                }default:
                q = 0;}if (($a | 0) == 598) {
              $a = 0;q = c[y + 20 >> 2] | 0;if (!q) q = c[aa >> 2] | 0;if ((q | 0) == 5 ? (c[eb >> 2] | 0) >>> 0 < 2 : 0) q = 1;q = (q | 0) == 4;
            }D = ca(g[Pa >> 2]);E = ca(g[La >> 2]);h = c[Na >> 2] | 0;w = c[Ja >> 2] | 0;if (o) q = q ^ 1;else q = 0;ce(y, _a ? D : E, _a ? E : D, jb, _a ? h : w, _a ? w : h, bb, ab, q, 6606, p) | 0;a[Aa >> 0] = a[Aa >> 0] | a[y + 508 >> 0];y = c[y + 952 >> 2] | 0;if (!y) break H;
          }
        } while (0);E = ca(e + t);K = E < ca(0.0) & 1;a[Aa >> 0] = K | d[Aa >> 0];U: do if (V & E > ca(0.0)) {
          q = c[W >> 2] | 0;h = c[b + 364 + (q << 3) + 4 >> 2] | 0;if (!h) {
            E = ca(0.0);break;
          }q = b + 364 + (q << 3) | 0;switch (h | 0) {case 2:
              {
                t = ca(g[q >> 2]);D = ca(ca(Va * t) / ca(100.0));break;
              }case 1:
              {
                t = ca(g[q >> 2]);D = t;break;
              }default:
              {
                E = ca(0.0);break U;
              }}if (!(D >= ca(0.0))) {
            E = ca(0.0);break;
          }switch (h | 0) {case 2:
              {
                t = ca(ca(Va * t) / ca(100.0));break;
              }case 1:
              break;default:
              t = ca(s);}E = ca(Vn(ca(0.0), ca(t - ca(f - E))));
        } while (0);y = l >>> 0 < M >>> 0;if (y) {
          x = l;q = 0;do {
            w = uc(c[hb >> 2] | 0, x) | 0;if (!(c[w + 24 >> 2] | 0)) {
              if (_a) {
                h = c[w + 96 >> 2] | 0;if (!h) h = c[w + 60 + (c[ea >> 2] << 3) + 4 >> 2] | 0;q = ((h | 0) == 3 & 1) + q | 0;h = c[w + 104 >> 2] | 0;if (!h) $a = 624;
              } else {
                q = ((c[w + 60 + (c[ea >> 2] << 3) + 4 >> 2] | 0) == 3 & 1) + q | 0;$a = 624;
              }if (($a | 0) == 624) {
                $a = 0;h = c[w + 60 + (c[ha >> 2] << 3) + 4 >> 2] | 0;
              }q = ((h | 0) == 3 & 1) + q | 0;
            }x = x + 1 | 0;
          } while ((x | 0) != (M | 0));if (q) {
            H = ca(0.0);I = ca(0.0);
          } else $a = 628;
        } else $a = 628;V: do if (($a | 0) == 628) {
          $a = 0;switch (wa | 0) {case 1:
              {
                H = ca(0.0);I = ca(E * ca(.5));q = 0;break V;
              }case 2:
              {
                H = ca(0.0);I = E;q = 0;break V;
              }case 3:
              {
                if (L >>> 0 <= 1) {
                  H = ca(0.0);I = ca(0.0);q = 0;break V;
                }H = ca(ca(Vn(E, ca(0.0))) / ca((L + -1 | 0) >>> 0));I = ca(0.0);q = 0;break V;
              }case 4:
              {
                I = ca(E / ca(L >>> 0));H = I;I = ca(I * ca(.5));q = 0;break V;
              }default:
              {
                H = ca(0.0);I = ca(0.0);q = 0;break V;
              }}
        } while (0);t = ca(ya + I);if (y) {
          G = ca(E / ca(q | 0));D = ca(0.0);x = l;do {
            w = uc(c[hb >> 2] | 0, x) | 0;W: do if ((c[w + 36 >> 2] | 0) != 1) {
              X: do switch (c[w + 24 >> 2] | 0) {case 1:
                  {
                    if (_a) {
                      do if (!(c[w + 168 >> 2] | 0)) {
                        if (!(c[w + 184 >> 2] | 0)) {
                          q = (c[w + 200 >> 2] | 0) == 0 ? 1676 : w + 196 | 0;break;
                        } else {
                          q = w + 180 | 0;break;
                        }
                      } else q = w + 164 | 0; while (0);if (!(c[q + 4 >> 2] | 0)) $a = 645;
                    } else $a = 645;if (($a | 0) == 645) {
                      $a = 0;q = c[ea >> 2] | 0;Y: do if (!(c[w + 132 + (q << 3) + 4 >> 2] | 0)) {
                        do if (Ua) {
                          if (!(c[w + 192 >> 2] | 0)) break;q = w + 188 | 0;break Y;
                        } while (0);Z: do switch (q | 0) {case 0:case 2:case 4:case 5:
                            {
                              if (!(c[w + 184 >> 2] | 0)) break Z;q = w + 180 | 0;break Y;
                            }default:
                            {}} while (0);q = (c[w + 200 >> 2] | 0) == 0 ? 1676 : w + 196 | 0;
                      } else q = w + 132 + (q << 3) | 0; while (0);if (!(c[q + 4 >> 2] | 0)) break X;
                    }if (!o) break W;F = ca(ca(qe(w, fb, f)) + ca(se(b, fb)));_: do if (_a) {
                      q = c[w + 96 >> 2] | 0;if (!q) {
                        $a = 662;break;
                      }h = w + 92 | 0;if ((q | 0) == 3) {
                        E = ca(0.0);break;
                      }switch (q | 0) {case 2:
                          {
                            E = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break _;
                          }case 1:
                          {
                            E = ca(g[h >> 2]);break _;
                          }default:
                          {
                            E = ca(s);break _;
                          }}
                    } else $a = 662; while (0);$: do if (($a | 0) == 662) {
                      $a = 0;q = c[ea >> 2] | 0;aa: do if (!(c[w + 60 + (q << 3) + 4 >> 2] | 0)) {
                        do if (Ua) {
                          if (!(c[w + 120 >> 2] | 0)) break;q = w + 116 | 0;break aa;
                        } while (0);ba: do switch (q | 0) {case 0:case 2:case 4:case 5:
                            {
                              if (!(c[w + 112 >> 2] | 0)) break ba;q = w + 108 | 0;break aa;
                            }default:
                            {}} while (0);q = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                      } else q = w + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                        E = ca(0.0);break;
                      }switch (h | 0) {case 2:
                          {
                            E = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break $;
                          }case 1:
                          {
                            E = ca(g[q >> 2]);break $;
                          }default:
                          {
                            E = ca(s);break $;
                          }}
                    } while (0);rb = ca(F + E);g[w + 400 + (c[ga >> 2] << 2) >> 2] = rb;break W;
                  }case 0:
                  {
                    if (_a ? (Ba = c[w + 96 >> 2] | 0, (Ba | 0) != 0) : 0) q = Ba;else q = c[w + 60 + (c[ea >> 2] << 3) + 4 >> 2] | 0;rb = ca(t + G);t = (q | 0) == 3 ? rb : t;if (o) {
                      L = w + 400 + (c[ga >> 2] << 2) | 0;g[L >> 2] = ca(t + ca(g[L >> 2]));
                    }if (_a ? (Ca = c[w + 104 >> 2] | 0, (Ca | 0) != 0) : 0) q = Ca;else q = c[w + 60 + (c[ha >> 2] << 3) + 4 >> 2] | 0;F = ca(t + G);F = (q | 0) == 3 ? F : t;if (T) {
                      ca: do if (_a) {
                        q = c[w + 96 >> 2] | 0;if (!q) {
                          $a = 691;break;
                        }h = w + 92 | 0;if ((q | 0) == 3) {
                          t = ca(0.0);break;
                        }switch (q | 0) {case 2:
                            {
                              t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break ca;
                            }case 1:
                            {
                              t = ca(g[h >> 2]);break ca;
                            }default:
                            {
                              t = ca(s);break ca;
                            }}
                      } else $a = 691; while (0);da: do if (($a | 0) == 691) {
                        $a = 0;q = c[ea >> 2] | 0;ea: do if (!(c[w + 60 + (q << 3) + 4 >> 2] | 0)) {
                          do if (Ua) {
                            if (!(c[w + 120 >> 2] | 0)) break;q = w + 116 | 0;break ea;
                          } while (0);fa: do switch (q | 0) {case 0:case 2:case 4:case 5:
                              {
                                if (!(c[w + 112 >> 2] | 0)) break fa;q = w + 108 | 0;break ea;
                              }default:
                              {}} while (0);q = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                        } else q = w + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                          t = ca(0.0);break;
                        }switch (h | 0) {case 2:
                            {
                              t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break da;
                            }case 1:
                            {
                              t = ca(g[q >> 2]);break da;
                            }default:
                            {
                              t = ca(s);break da;
                            }}
                      } while (0);t = ca(H + ca(t + ca(ke(w, fb, bb))));D = Ta;t = ca(F + ca(ca(g[w + 504 >> 2]) + t));break W;
                    }E = ca(g[w + 908 + (c[W >> 2] << 2) >> 2]);ga: do if (_a) {
                      q = c[w + 96 >> 2] | 0;if (!q) {
                        $a = 711;break;
                      }h = w + 92 | 0;if ((q | 0) == 3) {
                        t = ca(0.0);break;
                      }switch (q | 0) {case 2:
                          {
                            t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break ga;
                          }case 1:
                          {
                            t = ca(g[h >> 2]);break ga;
                          }default:
                          {
                            t = ca(s);break ga;
                          }}
                    } else $a = 711; while (0);ha: do if (($a | 0) == 711) {
                      $a = 0;q = c[ea >> 2] | 0;ia: do if (!(c[w + 60 + (q << 3) + 4 >> 2] | 0)) {
                        do if (Ua) {
                          if (!(c[w + 120 >> 2] | 0)) break;q = w + 116 | 0;break ia;
                        } while (0);ja: do switch (q | 0) {case 0:case 2:case 4:case 5:
                            {
                              if (!(c[w + 112 >> 2] | 0)) break ja;q = w + 108 | 0;break ia;
                            }default:
                            {}} while (0);q = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                      } else q = w + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                        t = ca(0.0);break;
                      }switch (h | 0) {case 2:
                          {
                            t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break ha;
                          }case 1:
                          {
                            t = ca(g[q >> 2]);break ha;
                          }default:
                          {
                            t = ca(s);break ha;
                          }}
                    } while (0);t = ca(F + ca(H + ca(ca(E + t) + ca(ke(w, fb, bb)))));F = ca(g[w + 908 + (c[ba >> 2] << 2) >> 2]);ka: do if (Y) {
                      q = c[w + 96 >> 2] | 0;if (!q) {
                        $a = 730;break;
                      }h = w + 92 | 0;if ((q | 0) == 3) {
                        E = ca(0.0);break;
                      }switch (q | 0) {case 2:
                          {
                            E = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break ka;
                          }case 1:
                          {
                            E = ca(g[h >> 2]);break ka;
                          }default:
                          {
                            E = ca(s);break ka;
                          }}
                    } else $a = 730; while (0);la: do if (($a | 0) == 730) {
                      $a = 0;q = c[Z >> 2] | 0;ma: do if (!(c[w + 60 + (q << 3) + 4 >> 2] | 0)) {
                        do if (_) {
                          if (!(c[w + 120 >> 2] | 0)) break;q = w + 116 | 0;break ma;
                        } while (0);na: do switch (q | 0) {case 0:case 2:case 4:case 5:
                            {
                              if (!(c[w + 112 >> 2] | 0)) break na;q = w + 108 | 0;break ma;
                            }default:
                            {}} while (0);q = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                      } else q = w + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                        E = ca(0.0);break;
                      }switch (h | 0) {case 2:
                          {
                            E = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break la;
                          }case 1:
                          {
                            E = ca(g[q >> 2]);break la;
                          }default:
                          {
                            E = ca(s);break la;
                          }}
                    } while (0);D = ca(Vn(D, ca(ca(F + E) + ca(ke(w, gb, bb)))));break W;
                  }default:
                  {}} while (0);if (!o) break;rb = ca(I + ca(se(b, fb)));L = w + 400 + (c[ga >> 2] << 2) | 0;g[L >> 2] = ca(rb + ca(g[L >> 2]));
            } while (0);x = x + 1 | 0;
          } while ((x | 0) != (M | 0));
        } else D = ca(0.0);H = ca(za + t);if (X) {
          qb = ca(we(b, gb, ca(Za + D), Ya));rb = ca(ue(b, gb, m));rb = ca(rb + ca(se(b, gb)));G = ca(ve(b, gb, m));G = ca(ca(Vn(qb, ca(rb + ca(G + ca(te(b, gb)))))) - Za);
        } else G = Ta;qb = ca(we(b, gb, ca(Za + (qa ? Ta : D)), Ya));rb = ca(ue(b, gb, m));rb = ca(rb + ca(se(b, gb)));F = ca(ve(b, gb, m));F = ca(ca(Vn(qb, ca(rb + ca(F + ca(te(b, gb)))))) - Za);if (y & o) {
          y = l;do {
            x = uc(c[hb >> 2] | 0, y) | 0;oa: do if ((c[x + 36 >> 2] | 0) != 1) {
              if ((c[x + 24 >> 2] | 0) == 1) {
                if (Y) {
                  do if (!(c[x + 168 >> 2] | 0)) {
                    if (!(c[x + 184 >> 2] | 0)) {
                      q = (c[x + 200 >> 2] | 0) == 0 ? 1676 : x + 196 | 0;break;
                    } else {
                      q = x + 180 | 0;break;
                    }
                  } else q = x + 164 | 0; while (0);if (!(c[q + 4 >> 2] | 0)) $a = 759;
                } else $a = 759;do if (($a | 0) == 759) {
                  $a = 0;h = c[Z >> 2] | 0;pa: do if (!(c[x + 132 + (h << 3) + 4 >> 2] | 0)) {
                    do if (_) {
                      if (!(c[x + 192 >> 2] | 0)) break;q = x + 188 | 0;break pa;
                    } while (0);qa: do switch (h | 0) {case 0:case 2:case 4:case 5:
                        {
                          if (!(c[x + 184 >> 2] | 0)) break qa;q = x + 180 | 0;break pa;
                        }default:
                        {}} while (0);q = (c[x + 200 >> 2] | 0) == 0 ? 1676 : x + 196 | 0;
                  } else q = x + 132 + (h << 3) | 0; while (0);if (c[q + 4 >> 2] | 0) break;D = ca(se(b, gb));ra: do if (Y) {
                    w = c[x + 96 >> 2] | 0;if (!w) {
                      $a = 795;break;
                    }q = x + 92 | 0;if ((w | 0) == 3) {
                      t = ca(0.0);break;
                    }switch (w | 0) {case 2:
                        {
                          t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break ra;
                        }case 1:
                        {
                          t = ca(g[q >> 2]);break ra;
                        }default:
                        {
                          t = ca(s);break ra;
                        }}
                  } else $a = 795; while (0);sa: do if (($a | 0) == 795) {
                    $a = 0;ta: do if (!(c[x + 60 + (h << 3) + 4 >> 2] | 0)) {
                      do if (_) {
                        if (!(c[x + 120 >> 2] | 0)) break;q = x + 116 | 0;break ta;
                      } while (0);ua: do switch (h | 0) {case 0:case 2:case 4:case 5:
                          {
                            if (!(c[x + 112 >> 2] | 0)) break ua;q = x + 108 | 0;break ta;
                          }default:
                          {}} while (0);q = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;
                    } else q = x + 60 + (h << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                      t = ca(0.0);break;
                    }switch (h | 0) {case 2:
                        {
                          t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break sa;
                        }case 1:
                        {
                          t = ca(g[q >> 2]);break sa;
                        }default:
                        {
                          t = ca(s);break sa;
                        }}
                  } while (0);rb = ca(D + t);g[x + 400 + (c[$ >> 2] << 2) >> 2] = rb;break oa;
                } while (0);D = ca(qe(x, gb, Ta));D = ca(D + ca(se(b, gb)));va: do if (Y) {
                  q = c[x + 96 >> 2] | 0;if (!q) {
                    $a = 775;break;
                  }h = x + 92 | 0;if ((q | 0) == 3) {
                    t = ca(0.0);break;
                  }switch (q | 0) {case 2:
                      {
                        t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break va;
                      }case 1:
                      {
                        t = ca(g[h >> 2]);break va;
                      }default:
                      {
                        t = ca(s);break va;
                      }}
                } else $a = 775; while (0);wa: do if (($a | 0) == 775) {
                  $a = 0;q = c[Z >> 2] | 0;xa: do if (!(c[x + 60 + (q << 3) + 4 >> 2] | 0)) {
                    do if (_) {
                      if (!(c[x + 120 >> 2] | 0)) break;q = x + 116 | 0;break xa;
                    } while (0);ya: do switch (q | 0) {case 0:case 2:case 4:case 5:
                        {
                          if (!(c[x + 112 >> 2] | 0)) break ya;q = x + 108 | 0;break xa;
                        }default:
                        {}} while (0);q = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;
                  } else q = x + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                    t = ca(0.0);break;
                  }switch (h | 0) {case 2:
                      {
                        t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break wa;
                      }case 1:
                      {
                        t = ca(g[q >> 2]);break wa;
                      }default:
                      {
                        t = ca(s);break wa;
                      }}
                } while (0);rb = ca(D + t);g[x + 400 + (c[$ >> 2] << 2) >> 2] = rb;break;
              }q = c[x + 20 >> 2] | 0;if (!q) q = c[aa >> 2] | 0;za: do switch (q | 0) {case 5:
                  {
                    q = (c[eb >> 2] | 0) >>> 0 < 2 ? 1 : 5;$a = 865;break;
                  }case 4:
                  {
                    if (Y ? (Da = c[x + 96 >> 2] | 0, (Da | 0) != 0) : 0) q = Da;else q = c[x + 60 + (c[Z >> 2] << 3) + 4 >> 2] | 0;if ((q | 0) == 3) {
                      q = 4;$a = 865;break za;
                    }if (Y ? (Ea = c[x + 104 >> 2] | 0, (Ea | 0) != 0) : 0) q = Ea;else q = c[x + 60 + (c[da >> 2] << 3) + 4 >> 2] | 0;if ((q | 0) == 3) {
                      q = 4;$a = 865;break za;
                    }q = c[x + 984 + (c[ba >> 2] << 2) >> 2] | 0;switch (c[q + 4 >> 2] | 0) {case 0:case 3:
                        break;case 1:
                        {
                          if (!(ca(g[q >> 2]) < ca(0.0))) {
                            t = r;break za;
                          }break;
                        }case 2:
                        {
                          if (!(ca(g[q >> 2]) < ca(0.0) | sa)) {
                            t = r;break za;
                          }break;
                        }default:
                        {
                          t = r;break za;
                        }}L = c[x + 908 + (c[W >> 2] << 2) >> 2] | 0;c[Qa >> 2] = L;l = c[x + 396 >> 2] | 0;E = (c[k >> 2] = L, ca(g[k >> 2]));D = (c[k >> 2] = l, ca(g[k >> 2]));if ((l & 2147483647) >>> 0 > 2139095040) t = F;else {
                      Aa: do if (Y) {
                        q = c[x + 96 >> 2] | 0;if (!q) {
                          $a = 831;break;
                        }h = x + 92 | 0;if ((q | 0) == 3) {
                          t = ca(0.0);break;
                        }switch (q | 0) {case 2:
                            {
                              t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break Aa;
                            }case 1:
                            {
                              t = ca(g[h >> 2]);break Aa;
                            }default:
                            {
                              t = ca(s);break Aa;
                            }}
                      } else $a = 831; while (0);Ba: do if (($a | 0) == 831) {
                        $a = 0;q = c[Z >> 2] | 0;Ca: do if (!(c[x + 60 + (q << 3) + 4 >> 2] | 0)) {
                          do if (_) {
                            if (!(c[x + 120 >> 2] | 0)) break;q = x + 116 | 0;break Ca;
                          } while (0);Da: do switch (q | 0) {case 0:case 2:case 4:case 5:
                              {
                                if (!(c[x + 112 >> 2] | 0)) break Da;q = x + 108 | 0;break Ca;
                              }default:
                              {}} while (0);q = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;
                        } else q = x + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                          t = ca(0.0);break;
                        }switch (h | 0) {case 2:
                            {
                              t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break Ba;
                            }case 1:
                            {
                              t = ca(g[q >> 2]);break Ba;
                            }default:
                            {
                              t = ca(s);break Ba;
                            }}
                      } while (0);qb = ca(t + ca(ke(x, gb, bb)));rb = ca(E / D);t = ca(E * D);t = ca(qb + (_a ? rb : t));
                    }g[Ma >> 2] = t;Ea: do if (_a) {
                      q = c[x + 96 >> 2] | 0;if (!q) {
                        $a = 851;break;
                      }h = x + 92 | 0;if ((q | 0) == 3) {
                        t = ca(0.0);break;
                      }switch (q | 0) {case 2:
                          {
                            t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break Ea;
                          }case 1:
                          {
                            t = ca(g[h >> 2]);break Ea;
                          }default:
                          {
                            t = ca(s);break Ea;
                          }}
                    } else $a = 851; while (0);Fa: do if (($a | 0) == 851) {
                      $a = 0;q = c[ea >> 2] | 0;Ga: do if (!(c[x + 60 + (q << 3) + 4 >> 2] | 0)) {
                        do if (Ua) {
                          if (!(c[x + 120 >> 2] | 0)) break;q = x + 116 | 0;break Ga;
                        } while (0);Ha: do switch (q | 0) {case 0:case 2:case 4:case 5:
                            {
                              if (!(c[x + 112 >> 2] | 0)) break Ha;q = x + 108 | 0;break Ga;
                            }default:
                            {}} while (0);q = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;
                      } else q = x + 60 + (q << 3) | 0; while (0);h = c[q + 4 >> 2] | 0;if ((h | 0) == 3) {
                        t = ca(0.0);break;
                      }switch (h | 0) {case 2:
                          {
                            t = ca(ca(bb * ca(g[q >> 2])) / ca(100.0));break Fa;
                          }case 1:
                          {
                            t = ca(g[q >> 2]);break Fa;
                          }default:
                          {
                            t = ca(s);break Fa;
                          }}
                    } while (0);g[Qa >> 2] = ca(E + ca(t + ca(ke(x, fb, bb))));c[Oa >> 2] = 1;c[Ka >> 2] = 1;ye(x, fb, f, bb, Oa, Qa);ye(x, gb, Ta, bb, Ka, Ma);t = ca(g[Qa >> 2]);qb = ca(g[Ma >> 2]);rb = _a ? t : qb;t = _a ? qb : t;ce(x, rb, t, jb, ((g[k >> 2] = rb, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1, ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041 & 1, bb, ab, 1, 6611, p) | 0;t = r;break;
                  }default:
                  $a = 865;} while (0);Ia: do if (($a | 0) == 865) {
                $a = 0;D = ca(g[x + 908 + (c[ba >> 2] << 2) >> 2]);Ja: do if (Y) {
                  h = c[x + 96 >> 2] | 0;if (!h) {
                    $a = 871;break;
                  }w = x + 92 | 0;if ((h | 0) == 3) {
                    t = ca(0.0);break;
                  }switch (h | 0) {case 2:
                      {
                        t = ca(ca(bb * ca(g[w >> 2])) / ca(100.0));break Ja;
                      }case 1:
                      {
                        t = ca(g[w >> 2]);break Ja;
                      }default:
                      {
                        t = ca(s);break Ja;
                      }}
                } else $a = 871; while (0);Ka: do if (($a | 0) == 871) {
                  $a = 0;h = c[Z >> 2] | 0;La: do if (!(c[x + 60 + (h << 3) + 4 >> 2] | 0)) {
                    do if (_) {
                      if (!(c[x + 120 >> 2] | 0)) break;h = x + 116 | 0;break La;
                    } while (0);Ma: do switch (h | 0) {case 0:case 2:case 4:case 5:
                        {
                          if (!(c[x + 112 >> 2] | 0)) break Ma;h = x + 108 | 0;break La;
                        }default:
                        {}} while (0);h = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;
                  } else h = x + 60 + (h << 3) | 0; while (0);w = c[h + 4 >> 2] | 0;if ((w | 0) == 3) {
                    t = ca(0.0);break;
                  }switch (w | 0) {case 2:
                      {
                        t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break Ka;
                      }case 1:
                      {
                        t = ca(g[h >> 2]);break Ka;
                      }default:
                      {
                        t = ca(s);break Ka;
                      }}
                } while (0);t = ca(D + t);t = ca(G - ca(t + ca(ke(x, gb, bb))));if (Y ? (Fa = c[x + 96 >> 2] | 0, (Fa | 0) != 0) : 0) h = Fa;else h = c[x + 60 + (c[Z >> 2] << 3) + 4 >> 2] | 0;do if ((h | 0) == 3) {
                  if (Y ? (Ga = c[x + 104 >> 2] | 0, (Ga | 0) != 0) : 0) h = Ga;else h = c[x + 60 + (c[da >> 2] << 3) + 4 >> 2] | 0;if ((h | 0) != 3) break;t = ca(r + ca(Vn(ca(0.0), ca(t * ca(.5)))));break Ia;
                } while (0);if (Y ? (Ha = c[x + 104 >> 2] | 0, (Ha | 0) != 0) : 0) h = Ha;else h = c[x + 60 + (c[da >> 2] << 3) + 4 >> 2] | 0;if ((h | 0) == 3) {
                  t = r;break;
                }if (Y ? (Ia = c[x + 96 >> 2] | 0, (Ia | 0) != 0) : 0) h = Ia;else h = c[x + 60 + (c[Z >> 2] << 3) + 4 >> 2] | 0;if ((h | 0) == 3) {
                  t = ca(r + ca(Vn(ca(0.0), t)));break;
                }switch (q | 0) {case 1:
                    {
                      t = r;break Ia;
                    }case 2:
                    {
                      t = ca(r + ca(t * ca(.5)));break Ia;
                    }default:
                    {
                      t = ca(r + t);break Ia;
                    }}
              } while (0);rb = ca(u + t);l = x + 400 + (c[$ >> 2] << 2) | 0;g[l >> 2] = ca(rb + ca(g[l >> 2]));
            } while (0);y = y + 1 | 0;
          } while ((y | 0) != (M | 0));
        }u = ca(u + F);t = ca(Vn(ka, H));q = v + 1 | 0;if (M >>> 0 < ib >>> 0) {
          l = M;v = q;ka = t;
        } else {
          P = u;J = t;R = q;I = f;break;
        }
      }Na: do if (o) {
        w = R >>> 0 > 1;Oa: do if (!w) {
          if ((c[eb >> 2] | 0) >>> 0 < 2) break Na;if ((c[b + 16 >> 2] | 0) == 5) break;q = qc(c[hb >> 2] | 0) | 0;if (!q) break Na;else h = 0;while (1) {
            Qa = uc(c[hb >> 2] | 0, h) | 0;if ((c[Qa + 24 >> 2] | 0) == 0 ? (c[Qa + 20 >> 2] | 0) == 5 : 0) break Oa;h = h + 1 | 0;if (h >>> 0 >= q >>> 0) break Na;
          }
        } while (0);q = (g[k >> 2] = Ta, c[k >> 2] | 0) & 2147483647;if (q >>> 0 > 2139095040) break;u = ca(Ta - P);Pa: do switch (c[b + 12 >> 2] | 0) {case 3:
            {
              t = ca(0.0);r = ca(r + u);$a = 928;break;
            }case 2:
            {
              t = ca(0.0);r = ca(r + ca(u * ca(.5)));$a = 928;break;
            }case 4:
            {
              if (!(Ta > P)) {
                t = ca(0.0);$a = 928;break Pa;
              }t = ca(u / ca(R >>> 0));$a = 928;break;
            }case 7:
            {
              if (!(Ta > P)) {
                t = ca(0.0);r = ca(r + ca(u * ca(.5)));$a = 928;break Pa;
              }r = ca(r + ca(u / ca(R << 1 >>> 0)));if (!w) {
                t = ca(0.0);$a = 928;break Pa;
              }t = ca(u / ca(R >>> 0));break;
            }case 6:
            {
              if (!(Ta > P & w)) {
                t = ca(0.0);$a = 928;break Pa;
              }t = ca(u / ca(v >>> 0));$a = 928;break;
            }default:
            {
              t = ca(0.0);$a = 928;
            }} while (0);if (($a | 0) == 928) if (!R) break;B = b + 16 | 0;C = (gb & -2 | 0) == 2;K = 1644 + (gb << 2) | 0;L = gb >>> 0 < 2;l = 1644 + (gb << 2) | 0;M = 1692 + (gb << 2) | 0;N = 1644 + (fb << 2) | 0;A = q >>> 0 < 2139095041;y = 0;z = 0;while (1) {
          Qa: do if (y >>> 0 < ib >>> 0) {
            q = y;D = ca(0.0);u = ca(0.0);H = ca(0.0);while (1) {
              x = uc(c[hb >> 2] | 0, q) | 0;do if ((c[x + 36 >> 2] | 0) == 1) E = H;else {
                if (c[x + 24 >> 2] | 0) {
                  E = H;break;
                }if ((c[x + 940 >> 2] | 0) != (z | 0)) break Qa;F = ca(g[x + 908 + (c[M >> 2] << 2) >> 2]);if (F >= ca(0.0) & ((g[k >> 2] = F, c[k >> 2] | 0) & 2147483647) >>> 0 < 2139095041) {
                  Ra: do if (C) {
                    h = c[x + 96 >> 2] | 0;if (!h) {
                      $a = 941;break;
                    }v = x + 92 | 0;if ((h | 0) == 3) {
                      E = ca(0.0);break;
                    }switch (h | 0) {case 2:
                        {
                          E = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break Ra;
                        }case 1:
                        {
                          E = ca(g[v >> 2]);break Ra;
                        }default:
                        {
                          E = ca(s);break Ra;
                        }}
                  } else $a = 941; while (0);Sa: do if (($a | 0) == 941) {
                    $a = 0;h = c[K >> 2] | 0;Ta: do if (!(c[x + 60 + (h << 3) + 4 >> 2] | 0)) {
                      do if (L) {
                        if (!(c[x + 120 >> 2] | 0)) break;h = x + 116 | 0;break Ta;
                      } while (0);Ua: do switch (h | 0) {case 0:case 2:case 4:case 5:
                          {
                            if (!(c[x + 112 >> 2] | 0)) break Ua;h = x + 108 | 0;break Ta;
                          }default:
                          {}} while (0);h = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;
                    } else h = x + 60 + (h << 3) | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
                      E = ca(0.0);break;
                    }switch (v | 0) {case 2:
                        {
                          E = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break Sa;
                        }case 1:
                        {
                          E = ca(g[h >> 2]);break Sa;
                        }default:
                        {
                          E = ca(s);break Sa;
                        }}
                  } while (0);D = ca(Vn(D, ca(F + ca(E + ca(ke(x, gb, bb))))));
                }h = c[x + 20 >> 2] | 0;if (!h) h = c[B >> 2] | 0;if ((h | 0) != 5) {
                  E = H;break;
                }if ((c[eb >> 2] | 0) >>> 0 < 2) {
                  E = H;break;
                }F = ca(ze(x));w = (c[x + 72 >> 2] | 0) == 0;do if (w) {
                  if (!(c[x + 120 >> 2] | 0)) {
                    h = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;break;
                  } else {
                    h = x + 116 | 0;break;
                  }
                } else h = x + 68 | 0; while (0);v = c[h + 4 >> 2] | 0;Va: do if ((v | 0) == 3) E = ca(0.0);else switch (v | 0) {case 2:
                    {
                      E = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break Va;
                    }case 1:
                    {
                      E = ca(g[h >> 2]);break Va;
                    }default:
                    {
                      E = ca(s);break Va;
                    }} while (0);F = ca(F + E);G = ca(g[x + 912 >> 2]);do if (w) {
                  if (!(c[x + 120 >> 2] | 0)) {
                    h = (c[x + 128 >> 2] | 0) == 0 ? 1612 : x + 124 | 0;break;
                  } else {
                    h = x + 116 | 0;break;
                  }
                } else h = x + 68 | 0; while (0);v = c[h + 4 >> 2] | 0;Wa: do if ((v | 0) == 3) E = ca(0.0);else switch (v | 0) {case 2:
                    {
                      E = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break Wa;
                    }case 1:
                    {
                      E = ca(g[h >> 2]);break Wa;
                    }default:
                    {
                      E = ca(s);break Wa;
                    }} while (0);E = ca(ca(G + ca(E + ca(ke(x, 0, bb)))) - F);u = ca(Vn(u, F));E = ca(Vn(H, E));D = ca(Vn(D, ca(u + E)));
              } while (0);q = q + 1 | 0;if (q >>> 0 < ib >>> 0) H = E;else break;
            }
          } else {
            q = y;D = ca(0.0);u = ca(0.0);
          } while (0);H = ca(t + D);if (y >>> 0 < q >>> 0) {
            F = ca(r + u);G = ca(r + H);do {
              w = uc(c[hb >> 2] | 0, y) | 0;Xa: do if ((c[w + 36 >> 2] | 0) != 1) {
                if (c[w + 24 >> 2] | 0) break;h = c[w + 20 >> 2] | 0;if (!h) h = c[B >> 2] | 0;Ya: do switch (h | 0) {case 5:
                    {
                      if ((c[eb >> 2] | 0) >>> 0 < 2) break Ya;g[w + 404 >> 2] = ca(ca(F - ca(ze(w))) + ca(qe(w, 0, Ta)));break Xa;
                    }case 1:
                    break;case 3:
                    {
                      rb = ca(ca(G - ca(ke(w, gb, bb))) - ca(g[w + 908 + (c[M >> 2] << 2) >> 2]));g[w + 400 + (c[l >> 2] << 2) >> 2] = rb;break Xa;
                    }case 2:
                    {
                      rb = ca(r + ca(ca(H - ca(g[w + 908 + (c[M >> 2] << 2) >> 2])) * ca(.5)));g[w + 400 + (c[l >> 2] << 2) >> 2] = rb;break Xa;
                    }case 4:
                    {
                      Za: do if (C) {
                        h = c[w + 96 >> 2] | 0;if (!h) {
                          $a = 1015;break;
                        }v = w + 92 | 0;if ((h | 0) == 3) {
                          u = ca(0.0);break;
                        }switch (h | 0) {case 2:
                            {
                              u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break Za;
                            }case 1:
                            {
                              u = ca(g[v >> 2]);break Za;
                            }default:
                            {
                              u = ca(s);break Za;
                            }}
                      } else $a = 1015; while (0);_a: do if (($a | 0) == 1015) {
                        $a = 0;h = c[K >> 2] | 0;$a: do if (!(c[w + 60 + (h << 3) + 4 >> 2] | 0)) {
                          do if (L) {
                            if (!(c[w + 120 >> 2] | 0)) break;h = w + 116 | 0;break $a;
                          } while (0);ab: do switch (h | 0) {case 0:case 2:case 4:case 5:
                              {
                                if (!(c[w + 112 >> 2] | 0)) break ab;h = w + 108 | 0;break $a;
                              }default:
                              {}} while (0);h = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                        } else h = w + 60 + (h << 3) | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
                          u = ca(0.0);break;
                        }switch (v | 0) {case 2:
                            {
                              u = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break _a;
                            }case 1:
                            {
                              u = ca(g[h >> 2]);break _a;
                            }default:
                            {
                              u = ca(s);break _a;
                            }}
                      } while (0);rb = ca(r + u);g[w + 400 + (c[l >> 2] << 2) >> 2] = rb;h = c[w + 984 + (c[M >> 2] << 2) >> 2] | 0;switch (c[h + 4 >> 2] | 0) {case 0:case 3:
                          break;case 1:
                          {
                            if (!(ca(g[h >> 2]) < ca(0.0))) break Xa;break;
                          }case 2:
                          {
                            if (A & !(ca(g[h >> 2]) < ca(0.0))) break Xa;break;
                          }default:
                          break Xa;}if (_a) {
                        D = ca(g[w + 908 >> 2]);h = c[w + 96 >> 2] | 0;bb: do if (!h) {
                          h = c[N >> 2] | 0;cb: do if (!(c[w + 60 + (h << 3) + 4 >> 2] | 0)) {
                            do if (Ua) {
                              if (!(c[w + 120 >> 2] | 0)) break;h = w + 116 | 0;break cb;
                            } while (0);db: do switch (h | 0) {case 0:case 2:case 4:case 5:
                                {
                                  if (!(c[w + 112 >> 2] | 0)) break db;h = w + 108 | 0;break cb;
                                }default:
                                {}} while (0);h = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                          } else h = w + 60 + (h << 3) | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
                            u = ca(0.0);break;
                          }switch (v | 0) {case 2:
                              {
                                u = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break bb;
                              }case 1:
                              {
                                u = ca(g[h >> 2]);break bb;
                              }default:
                              {
                                u = ca(s);break bb;
                              }}
                        } else {
                          v = w + 92 | 0;if ((h | 0) == 3) {
                            u = ca(0.0);break;
                          }switch (h | 0) {case 2:
                              {
                                u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break bb;
                              }case 1:
                              {
                                u = ca(g[v >> 2]);break bb;
                              }default:
                              {
                                u = ca(s);break bb;
                              }}
                        } while (0);E = ca(D + ca(u + ca(ke(w, fb, bb))));u = D;D = H;
                      } else {
                        D = ca(g[w + 912 >> 2]);eb: do if (C) {
                          h = c[w + 96 >> 2] | 0;if (!h) {
                            $a = 1057;break;
                          }v = w + 92 | 0;if ((h | 0) == 3) {
                            u = ca(0.0);break;
                          }switch (h | 0) {case 2:
                              {
                                u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break eb;
                              }case 1:
                              {
                                u = ca(g[v >> 2]);break eb;
                              }default:
                              {
                                u = ca(s);break eb;
                              }}
                        } else $a = 1057; while (0);fb: do if (($a | 0) == 1057) {
                          $a = 0;h = c[K >> 2] | 0;gb: do if (!(c[w + 60 + (h << 3) + 4 >> 2] | 0)) {
                            do if (L) {
                              if (!(c[w + 120 >> 2] | 0)) break;h = w + 116 | 0;break gb;
                            } while (0);hb: do switch (h | 0) {case 0:case 2:case 4:case 5:
                                {
                                  if (!(c[w + 112 >> 2] | 0)) break hb;h = w + 108 | 0;break gb;
                                }default:
                                {}} while (0);h = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                          } else h = w + 60 + (h << 3) | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
                            u = ca(0.0);break;
                          }switch (v | 0) {case 2:
                              {
                                u = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break fb;
                              }case 1:
                              {
                                u = ca(g[h >> 2]);break fb;
                              }default:
                              {
                                u = ca(s);break fb;
                              }}
                        } while (0);D = ca(D + ca(u + ca(ke(w, gb, bb))));E = H;u = ca(g[w + 908 >> 2]);
                      }if (((g[k >> 2] = E, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                        if (((g[k >> 2] = u, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) $a = 1074;
                      } else if (ca(O(ca(E - u))) < ca(.0000999999974)) $a = 1074;do if (($a | 0) == 1074) {
                        $a = 0;u = ca(g[w + 912 >> 2]);if (((g[k >> 2] = D, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) {
                          if (((g[k >> 2] = u, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) break Xa;else break;
                        } else if (ca(O(ca(D - u))) < ca(.0000999999974)) break Xa;else break;
                      } while (0);ce(w, E, D, jb, 1, 1, bb, ab, 1, 6619, p) | 0;break Xa;
                    }default:
                    break Xa;} while (0);ib: do if (C) {
                  h = c[w + 96 >> 2] | 0;if (!h) {
                    $a = 993;break;
                  }v = w + 92 | 0;if ((h | 0) == 3) {
                    u = ca(0.0);break;
                  }switch (h | 0) {case 2:
                      {
                        u = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break ib;
                      }case 1:
                      {
                        u = ca(g[v >> 2]);break ib;
                      }default:
                      {
                        u = ca(s);break ib;
                      }}
                } else $a = 993; while (0);jb: do if (($a | 0) == 993) {
                  $a = 0;h = c[K >> 2] | 0;kb: do if (!(c[w + 60 + (h << 3) + 4 >> 2] | 0)) {
                    do if (L) {
                      if (!(c[w + 120 >> 2] | 0)) break;h = w + 116 | 0;break kb;
                    } while (0);lb: do switch (h | 0) {case 0:case 2:case 4:case 5:
                        {
                          if (!(c[w + 112 >> 2] | 0)) break lb;h = w + 108 | 0;break kb;
                        }default:
                        {}} while (0);h = (c[w + 128 >> 2] | 0) == 0 ? 1612 : w + 124 | 0;
                  } else h = w + 60 + (h << 3) | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
                    u = ca(0.0);break;
                  }switch (v | 0) {case 2:
                      {
                        u = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break jb;
                      }case 1:
                      {
                        u = ca(g[h >> 2]);break jb;
                      }default:
                      {
                        u = ca(s);break jb;
                      }}
                } while (0);rb = ca(r + u);g[w + 400 + (c[l >> 2] << 2) >> 2] = rb;
              } while (0);y = y + 1 | 0;
            } while ((y | 0) != (q | 0));
          }r = ca(r + H);z = z + 1 | 0;if ((z | 0) == (R | 0)) break;else y = q;
        }
      } while (0);rb = ca(we(b, 2, Sa, m));r = ca(ue(b, 2, m));r = ca(r + ca(se(b, 2)));u = ca(ve(b, 2, m));Y = b + 908 | 0;g[Y >> 2] = ca(Vn(rb, ca(r + ca(u + ca(te(b, 2))))));u = ca(we(b, 0, Ra, n));r = ca(ue(b, 0, m));do if (!(c[mb >> 2] | 0)) {
        if (!(c[b + 336 >> 2] | 0)) {
          q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
        } else {
          q = b + 332 | 0;break;
        }
      } else q = b + 284 | 0; while (0);r = ca(r + ca(Vn(ca(g[q >> 2]), ca(0.0))));t = ca(ve(b, 0, m));do if (!(c[nb >> 2] | 0)) {
        if (!(c[b + 336 >> 2] | 0)) {
          q = (c[b + 344 >> 2] | 0) == 0 ? 1612 : b + 340 | 0;break;
        } else {
          q = b + 332 | 0;break;
        }
      } else q = b + 300 | 0; while (0);X = b + 912 | 0;g[X >> 2] = ca(Vn(u, ca(r + ca(t + ca(Vn(ca(g[q >> 2]), ca(0.0)))))));do if (!fa) $a = 1093;else {
        q = c[b + 32 >> 2] | 0;h = (fa | 0) == 2;if (h & (q | 0) != 2) {
          $a = 1093;break;
        }if (!(h & (q | 0) == 2)) break;rb = ca(Wa + I);rb = ca(Vn(ca(Wn(rb, ca(we(b, fb, J, Va)))), Wa));g[b + 908 + (c[1692 + (fb << 2) >> 2] << 2) >> 2] = rb;
      } while (0);if (($a | 0) == 1093) {
        pb = ca(we(b, fb, J, Va));qb = ca(ue(b, fb, m));qb = ca(qb + ca(se(b, fb)));rb = ca(ve(b, fb, m));rb = ca(Vn(pb, ca(qb + ca(rb + ca(te(b, fb))))));g[b + 908 + (c[1692 + (fb << 2) >> 2] << 2) >> 2] = rb;
      }do if (!Xa) $a = 1098;else {
        h = c[b + 32 >> 2] | 0;q = (Xa | 0) == 2;if (q & (h | 0) != 2) {
          $a = 1098;break;
        }if (!(q & (h | 0) == 2)) break;rb = ca(Za + Ta);rb = ca(Vn(ca(Wn(rb, ca(we(b, gb, ca(Za + P), Ya)))), Za));g[b + 908 + (c[1692 + (gb << 2) >> 2] << 2) >> 2] = rb;
      } while (0);if (($a | 0) == 1098) {
        pb = ca(we(b, gb, ca(Za + P), Ya));qb = ca(ue(b, gb, m));qb = ca(qb + ca(se(b, gb)));rb = ca(ve(b, gb, m));rb = ca(Vn(pb, ca(qb + ca(rb + ca(te(b, gb))))));g[b + 908 + (c[1692 + (gb << 2) >> 2] << 2) >> 2] = rb;
      }if (!o) {
        i = ob;return;
      }if ((c[db >> 2] | 0) == 2) {
        q = 1692 + (gb << 2) | 0;h = 1644 + (gb << 2) | 0;w = 0;do {
          v = uc(c[hb >> 2] | 0, w) | 0;if (!(c[v + 24 >> 2] | 0)) {
            Xa = c[q >> 2] | 0;rb = ca(g[b + 908 + (Xa << 2) >> 2]);o = v + 400 + (c[h >> 2] << 2) | 0;rb = ca(rb - ca(g[o >> 2]));g[o >> 2] = ca(rb - ca(g[v + 908 + (Xa << 2) >> 2]));
          }w = w + 1 | 0;
        } while ((w | 0) != (ib | 0));
      }mb: do if (ta) {
        K = ((_a ? fa : j) | 0) != 0;L = bb > ca(0.0);l = b + 16 | 0;M = b + 336 | 0;N = b + 344 | 0;R = b + 340 | 0;S = b + 332 | 0;T = b + 300 | 0;U = b + 284 | 0;W = (g[k >> 2] = ab, c[k >> 2] | 0) & 2147483647;W = W >>> 0 > 2139095040;V = ((g[k >> 2] = bb, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;C = ta;while (1) {
          q = c[eb >> 2] | 0;nb: do if (lb) {
            switch (q | 0) {case 2:
                {
                  q = 3;B = 0;z = 0;break nb;
                }case 3:
                break;default:
                {
                  $a = 1112;break nb;
                }}q = 2;B = 0;z = 0;
          } else $a = 1112; while (0);if (($a | 0) == 1112) {
            z = q >>> 0 < 2;B = z ? kb : 0;
          }A = (q & -2 | 0) == 2;x = C + 96 | 0;h = c[x >> 2] | 0;ob: do if (!h) {
            do if (!(c[C + 64 >> 2] | 0)) {
              if (!(c[C + 112 >> 2] | 0)) {
                h = (c[C + 128 >> 2] | 0) == 0 ? 1612 : C + 124 | 0;break;
              } else {
                h = C + 108 | 0;break;
              }
            } else h = C + 60 | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
              r = ca(0.0);break;
            }switch (v | 0) {case 2:
                {
                  r = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break ob;
                }case 1:
                {
                  r = ca(g[h >> 2]);break ob;
                }default:
                {
                  r = ca(s);break ob;
                }}
          } else {
            v = C + 92 | 0;if ((h | 0) == 3) {
              r = ca(0.0);break;
            }switch (h | 0) {case 2:
                {
                  r = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break ob;
                }case 1:
                {
                  r = ca(g[v >> 2]);break ob;
                }default:
                {
                  r = ca(s);break ob;
                }}
          } while (0);F = ca(r + ca(ke(C, 2, bb)));y = C + 72 | 0;do if (!(c[y >> 2] | 0)) {
            if (!(c[C + 120 >> 2] | 0)) {
              h = (c[C + 128 >> 2] | 0) == 0 ? 1612 : C + 124 | 0;break;
            } else {
              h = C + 116 | 0;break;
            }
          } else h = C + 68 | 0; while (0);v = c[h + 4 >> 2] | 0;pb: do if ((v | 0) == 3) r = ca(0.0);else switch (v | 0) {case 2:
              {
                r = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break pb;
              }case 1:
              {
                r = ca(g[h >> 2]);break pb;
              }default:
              {
                r = ca(s);break pb;
              }} while (0);E = ca(r + ca(ke(C, 0, bb)));h = c[C + 984 >> 2] | 0;qb: do switch (c[h + 4 >> 2] | 0) {case 0:case 3:
              {
                $a = 1142;break;
              }case 1:
              {
                if (ca(g[h >> 2]) < ca(0.0)) {
                  $a = 1142;break qb;
                }r = ca(g[h >> 2]);$a = 1141;break;
              }case 2:
              {
                if (ca(g[h >> 2]) < ca(0.0) | V) {
                  $a = 1142;break qb;
                }r = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));$a = 1141;break;
              }default:
              {
                r = ca(s);$a = 1141;
              }} while (0);do if (($a | 0) == 1141) r = ca(F + r);else if (($a | 0) == 1142) {
            do if (!(c[C + 168 >> 2] | 0)) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 164 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
              do if (!(c[C + 136 >> 2] | 0)) {
                if (!(c[C + 184 >> 2] | 0)) {
                  h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
                } else {
                  h = C + 180 | 0;break;
                }
              } else h = C + 132 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
                r = ca(s);break;
              }
            }do if (!(c[C + 176 >> 2] | 0)) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 172 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
              do if (!(c[C + 152 >> 2] | 0)) {
                if (!(c[C + 184 >> 2] | 0)) {
                  h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
                } else {
                  h = C + 180 | 0;break;
                }
              } else h = C + 148 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
                r = ca(s);break;
              }
            }qb = ca(g[Y >> 2]);rb = ca(se(b, 2));rb = ca(qb - ca(rb + ca(te(b, 2))));qb = ca(qe(C, 2, bb));qb = ca(we(C, 2, ca(rb - ca(qb + ca(re(C, 2, bb)))), bb));rb = ca(ue(C, 2, bb));rb = ca(rb + ca(se(C, 2)));r = ca(ve(C, 2, bb));r = ca(Vn(qb, ca(rb + ca(r + ca(te(C, 2))))));
          } while (0);h = c[C + 988 >> 2] | 0;rb: do switch (c[h + 4 >> 2] | 0) {case 0:case 3:
              {
                $a = 1173;break;
              }case 1:
              {
                if (ca(g[h >> 2]) < ca(0.0)) {
                  $a = 1173;break rb;
                }t = ca(g[h >> 2]);$a = 1172;break;
              }case 2:
              {
                if (ca(g[h >> 2]) < ca(0.0) | W) {
                  $a = 1173;break rb;
                }t = ca(ca(ab * ca(g[h >> 2])) / ca(100.0));$a = 1172;break;
              }default:
              {
                t = ca(s);$a = 1172;
              }} while (0);do if (($a | 0) == 1172) t = ca(E + t);else if (($a | 0) == 1173) {
            do if (!(c[C + 144 >> 2] | 0)) {
              if (!(c[C + 192 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 188 | 0;break;
              }
            } else h = C + 140 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
              t = ca(s);break;
            }do if (!(c[C + 160 >> 2] | 0)) {
              if (!(c[C + 192 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 188 | 0;break;
              }
            } else h = C + 156 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
              t = ca(s);break;
            }u = ca(g[X >> 2]);do if (!(c[mb >> 2] | 0)) {
              if (c[M >> 2] | 0) {
                h = S;break;
              }h = (c[N >> 2] | 0) == 0 ? 1612 : R;
            } else h = U; while (0);t = ca(Vn(ca(g[h >> 2]), ca(0.0)));do if (!(c[nb >> 2] | 0)) {
              if (c[M >> 2] | 0) {
                h = S;break;
              }h = (c[N >> 2] | 0) == 0 ? 1612 : R;
            } else h = T; while (0);t = ca(u - ca(t + ca(Vn(ca(g[h >> 2]), ca(0.0)))));D = ca(qe(C, 0, ab));D = ca(we(C, 0, ca(t - ca(D + ca(re(C, 0, ab)))), ab));t = ca(ue(C, 0, bb));do if (!(c[C + 288 >> 2] | 0)) {
              if (!(c[C + 336 >> 2] | 0)) {
                h = (c[C + 344 >> 2] | 0) == 0 ? 1612 : C + 340 | 0;break;
              } else {
                h = C + 332 | 0;break;
              }
            } else h = C + 284 | 0; while (0);t = ca(t + ca(Vn(ca(g[h >> 2]), ca(0.0))));u = ca(ve(C, 0, bb));do if (!(c[C + 304 >> 2] | 0)) {
              if (!(c[C + 336 >> 2] | 0)) {
                h = (c[C + 344 >> 2] | 0) == 0 ? 1612 : C + 340 | 0;break;
              } else {
                h = C + 332 | 0;break;
              }
            } else h = C + 300 | 0; while (0);t = ca(Vn(D, ca(t + ca(u + ca(Vn(ca(g[h >> 2]), ca(0.0)))))));
          } while (0);h = ((g[k >> 2] = r, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;v = ((g[k >> 2] = t, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;do if (h ^ v) {
            u = ca(g[C + 396 >> 2]);if (((g[k >> 2] = u, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040) break;if (!h) {
              if (!v) break;qb = ca(ca(r - F) / u);rb = ca(ue(C, 2, bb));rb = ca(rb + ca(se(C, 2)));t = ca(ve(C, 2, bb));t = ca(E + ca(Vn(qb, ca(rb + ca(t + ca(te(C, 2)))))));break;
            }D = ca(ca(t - E) * u);r = ca(ue(C, 0, bb));do if (!(c[C + 288 >> 2] | 0)) {
              if (!(c[C + 336 >> 2] | 0)) {
                h = (c[C + 344 >> 2] | 0) == 0 ? 1612 : C + 340 | 0;break;
              } else {
                h = C + 332 | 0;break;
              }
            } else h = C + 284 | 0; while (0);r = ca(r + ca(Vn(ca(g[h >> 2]), ca(0.0))));u = ca(ve(C, 0, bb));do if (!(c[C + 304 >> 2] | 0)) {
              if (!(c[C + 336 >> 2] | 0)) {
                h = (c[C + 344 >> 2] | 0) == 0 ? 1612 : C + 340 | 0;break;
              } else {
                h = C + 332 | 0;break;
              }
            } else h = C + 300 | 0; while (0);r = ca(F + ca(Vn(D, ca(r + ca(u + ca(Vn(ca(g[h >> 2]), ca(0.0))))))));
          } while (0);v = ((g[k >> 2] = r, c[k >> 2] | 0) & 2147483647) >>> 0 > 2139095040;w = (g[k >> 2] = t, c[k >> 2] | 0) & 2147483647;if (v | w >>> 0 > 2139095040) {
            h = v & 1 ^ 1;if (!A) {
              j = L & (K & v);r = j ? bb : r;h = j ? 2 : h;
            }ce(C, r, t, jb, h, w >>> 0 < 2139095041 & 1, r, t, 0, 6637, p) | 0;t = ca(g[C + 908 >> 2]);h = c[x >> 2] | 0;sb: do if (!h) {
              do if (!(c[C + 64 >> 2] | 0)) {
                if (!(c[C + 112 >> 2] | 0)) {
                  h = (c[C + 128 >> 2] | 0) == 0 ? 1612 : C + 124 | 0;break;
                } else {
                  h = C + 108 | 0;break;
                }
              } else h = C + 60 | 0; while (0);v = c[h + 4 >> 2] | 0;if ((v | 0) == 3) {
                r = ca(0.0);break;
              }switch (v | 0) {case 2:
                  {
                    r = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break sb;
                  }case 1:
                  {
                    r = ca(g[h >> 2]);break sb;
                  }default:
                  {
                    r = ca(s);break sb;
                  }}
            } else {
              v = C + 92 | 0;if ((h | 0) == 3) {
                r = ca(0.0);break;
              }switch (h | 0) {case 2:
                  {
                    r = ca(ca(bb * ca(g[v >> 2])) / ca(100.0));break sb;
                  }case 1:
                  {
                    r = ca(g[v >> 2]);break sb;
                  }default:
                  {
                    r = ca(s);break sb;
                  }}
            } while (0);r = ca(t + ca(r + ca(ke(C, 2, bb))));u = ca(g[C + 912 >> 2]);do if (!(c[y >> 2] | 0)) {
              if (!(c[C + 120 >> 2] | 0)) {
                h = (c[C + 128 >> 2] | 0) == 0 ? 1612 : C + 124 | 0;break;
              } else {
                h = C + 116 | 0;break;
              }
            } else h = C + 68 | 0; while (0);v = c[h + 4 >> 2] | 0;tb: do if ((v | 0) == 3) t = ca(0.0);else switch (v | 0) {case 2:
                {
                  t = ca(ca(bb * ca(g[h >> 2])) / ca(100.0));break tb;
                }case 1:
                {
                  t = ca(g[h >> 2]);break tb;
                }default:
                {
                  t = ca(s);break tb;
                }} while (0);t = ca(u + ca(t + ca(ke(C, 0, bb))));
          }ce(C, r, t, jb, 1, 1, r, t, 1, 6649, p) | 0;if (A) {
            do if (!(c[C + 176 >> 2] | 0)) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 172 | 0; while (0);if (c[h + 4 >> 2] | 0) $a = 1263;else $a = 1252;
          } else $a = 1252;do if (($a | 0) == 1252) {
            h = c[1660 + (q << 2) >> 2] | 0;ub: do if (!(c[C + 132 + (h << 3) + 4 >> 2] | 0)) {
              do if (z) {
                if (!(c[C + 192 >> 2] | 0)) break;h = C + 188 | 0;break ub;
              } while (0);vb: do switch (h | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break vb;h = C + 180 | 0;break ub;
                  }default:
                  {}} while (0);h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else h = C + 132 + (h << 3) | 0; while (0);if (!(c[h + 4 >> 2] | 0)) {
              $a = 1280;break;
            }if (A) $a = 1263;else $a = 1269;
          } while (0);if (($a | 0) == 1263) {
            v = c[C + 168 >> 2] | 0;do if (!v) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 164 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) $a = 1269;else $a = 1282;
          }do if (($a | 0) == 1269) {
            $a = 0;v = c[1644 + (q << 2) >> 2] | 0;wb: do if (!(c[C + 132 + (v << 3) + 4 >> 2] | 0)) {
              do if (z) {
                if (!(c[C + 192 >> 2] | 0)) break;h = C + 188 | 0;break wb;
              } while (0);xb: do switch (v | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break xb;h = C + 180 | 0;break wb;
                  }default:
                  {}} while (0);h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else h = C + 132 + (v << 3) | 0; while (0);if (c[h + 4 >> 2] | 0) {
              $a = 1280;break;
            }j = c[1692 + (q << 2) >> 2] | 0;rb = ca(g[b + 908 + (j << 2) >> 2]);rb = ca(rb - ca(g[C + 908 + (j << 2) >> 2]));rb = ca(rb - ca(te(b, q)));rb = ca(rb - ca(ke(C, q, bb)));g[C + 400 + (v << 2) >> 2] = ca(rb - ca(re(C, q, A ? bb : ab)));
          } while (0);do if (($a | 0) == 1280) {
            if (!A) {
              $a = 1288;break;
            }v = c[C + 168 >> 2] | 0;$a = 1282;
          } while (0);if (($a | 0) == 1282) {
            do if (!v) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 164 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) $a = 1288;else $a = 1302;
          }yb: do if (($a | 0) == 1288) {
            $a = 0;w = c[1644 + (q << 2) >> 2] | 0;v = c[C + 132 + (w << 3) + 4 >> 2] | 0;zb: do if (!v) {
              do if (z) {
                if (!(c[C + 192 >> 2] | 0)) break;h = C + 188 | 0;break zb;
              } while (0);Ab: do switch (w | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break Ab;h = C + 180 | 0;break zb;
                  }default:
                  {}} while (0);h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else h = C + 132 + (w << 3) | 0; while (0);do if (!(c[h + 4 >> 2] | 0)) {
              if ((c[cb >> 2] | 0) != 1) break;j = c[1692 + (q << 2) >> 2] | 0;rb = ca(g[b + 908 + (j << 2) >> 2]);g[C + 400 + (w << 2) >> 2] = ca(ca(rb - ca(g[C + 908 + (j << 2) >> 2])) * ca(.5));break yb;
            } while (0);if (!A) {
              $a = 1309;break;
            }v = c[C + 168 >> 2] | 0;$a = 1302;
          } while (0);do if (($a | 0) == 1302) {
            $a = 0;do if (!v) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 164 | 0; while (0);if (c[h + 4 >> 2] | 0) break;w = c[1644 + (q << 2) >> 2] | 0;v = c[C + 132 + (w << 3) + 4 >> 2] | 0;$a = 1309;
          } while (0);do if (($a | 0) == 1309) {
            Bb: do if (!v) {
              do if (z) {
                if (!(c[C + 192 >> 2] | 0)) break;h = C + 188 | 0;break Bb;
              } while (0);Cb: do switch (w | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break Cb;h = C + 180 | 0;break Bb;
                  }default:
                  {}} while (0);h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else h = C + 132 + (w << 3) | 0; while (0);if (c[h + 4 >> 2] | 0) break;if ((c[cb >> 2] | 0) != 2) break;j = c[1692 + (q << 2) >> 2] | 0;rb = ca(g[b + 908 + (j << 2) >> 2]);g[C + 400 + (w << 2) >> 2] = ca(rb - ca(g[C + 908 + (j << 2) >> 2]));
          } while (0);w = (B & -2 | 0) == 2;if (w) {
            do if (!(c[C + 176 >> 2] | 0)) {
              if (!(c[C + 184 >> 2] | 0)) {
                q = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                q = C + 180 | 0;break;
              }
            } else q = C + 172 | 0; while (0);if (c[q + 4 >> 2] | 0) $a = 1339;else $a = 1328;
          } else $a = 1328;do if (($a | 0) == 1328) {
            q = c[1660 + (B << 2) >> 2] | 0;Db: do if (!(c[C + 132 + (q << 3) + 4 >> 2] | 0)) {
              do if (B >>> 0 < 2) {
                if (!(c[C + 192 >> 2] | 0)) break;q = C + 188 | 0;break Db;
              } while (0);Eb: do switch (q | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break Eb;q = C + 180 | 0;break Db;
                  }default:
                  {}} while (0);q = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else q = C + 132 + (q << 3) | 0; while (0);if (!(c[q + 4 >> 2] | 0)) {
              $a = 1356;break;
            }if (w) $a = 1339;else $a = 1345;
          } while (0);if (($a | 0) == 1339) {
            q = c[C + 168 >> 2] | 0;do if (!q) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 164 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) $a = 1345;else $a = 1358;
          }do if (($a | 0) == 1345) {
            $a = 0;h = c[1644 + (B << 2) >> 2] | 0;Fb: do if (!(c[C + 132 + (h << 3) + 4 >> 2] | 0)) {
              do if (B >>> 0 < 2) {
                if (!(c[C + 192 >> 2] | 0)) break;q = C + 188 | 0;break Fb;
              } while (0);Gb: do switch (h | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break Gb;q = C + 180 | 0;break Fb;
                  }default:
                  {}} while (0);q = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else q = C + 132 + (h << 3) | 0; while (0);if (c[q + 4 >> 2] | 0) {
              $a = 1356;break;
            }j = c[1692 + (B << 2) >> 2] | 0;rb = ca(g[b + 908 + (j << 2) >> 2]);rb = ca(rb - ca(g[C + 908 + (j << 2) >> 2]));rb = ca(rb - ca(te(b, B)));rb = ca(rb - ca(ke(C, B, bb)));g[C + 400 + (h << 2) >> 2] = ca(rb - ca(re(C, B, A ? ab : bb)));
          } while (0);do if (($a | 0) == 1356) {
            if (!w) {
              $a = 1364;break;
            }q = c[C + 168 >> 2] | 0;$a = 1358;
          } while (0);if (($a | 0) == 1358) {
            do if (!q) {
              if (!(c[C + 184 >> 2] | 0)) {
                h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                h = C + 180 | 0;break;
              }
            } else h = C + 164 | 0; while (0);if (!(c[h + 4 >> 2] | 0)) $a = 1364;else $a = 1380;
          }Hb: do if (($a | 0) == 1364) {
            $a = 0;v = c[1644 + (B << 2) >> 2] | 0;q = c[C + 132 + (v << 3) + 4 >> 2] | 0;Ib: do if (!q) {
              do if (B >>> 0 < 2) {
                if (!(c[C + 192 >> 2] | 0)) break;h = C + 188 | 0;break Ib;
              } while (0);Jb: do switch (v | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break Jb;h = C + 180 | 0;break Ib;
                  }default:
                  {}} while (0);h = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else h = C + 132 + (v << 3) | 0; while (0);do if (!(c[h + 4 >> 2] | 0)) {
              h = c[C + 20 >> 2] | 0;if (!h) h = c[l >> 2] | 0;if ((h | 0) != 2) break;j = c[1692 + (B << 2) >> 2] | 0;rb = ca(g[b + 908 + (j << 2) >> 2]);g[C + 400 + (v << 2) >> 2] = ca(ca(rb - ca(g[C + 908 + (j << 2) >> 2])) * ca(.5));break Hb;
            } while (0);if (!w) {
              h = v;$a = 1387;break;
            }q = c[C + 168 >> 2] | 0;$a = 1380;
          } while (0);do if (($a | 0) == 1380) {
            $a = 0;do if (!q) {
              if (!(c[C + 184 >> 2] | 0)) {
                q = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;break;
              } else {
                q = C + 180 | 0;break;
              }
            } else q = C + 164 | 0; while (0);if (c[q + 4 >> 2] | 0) break;h = c[1644 + (B << 2) >> 2] | 0;q = c[C + 132 + (h << 3) + 4 >> 2] | 0;$a = 1387;
          } while (0);Kb: do if (($a | 0) == 1387) {
            $a = 0;Lb: do if (!q) {
              do if (B >>> 0 < 2) {
                if (!(c[C + 192 >> 2] | 0)) break;q = C + 188 | 0;break Lb;
              } while (0);Mb: do switch (h | 0) {case 0:case 2:case 4:case 5:
                  {
                    if (!(c[C + 184 >> 2] | 0)) break Mb;q = C + 180 | 0;break Lb;
                  }default:
                  {}} while (0);q = (c[C + 200 >> 2] | 0) == 0 ? 1676 : C + 196 | 0;
            } else q = C + 132 + (h << 3) | 0; while (0);if (c[q + 4 >> 2] | 0) break;q = c[C + 20 >> 2] | 0;if (!q) q = c[l >> 2] | 0;do if ((q | 0) == 5) {
              if ((c[eb >> 2] | 0) >>> 0 >= 2) {
                $a = 1402;break;
              }if ((c[db >> 2] | 0) != 2) break Kb;
            } else $a = 1402; while (0);if (($a | 0) == 1402 ? ($a = 0, !((q | 0) == 3 ^ (c[db >> 2] | 0) == 2)) : 0) break;j = c[1692 + (B << 2) >> 2] | 0;rb = ca(g[b + 908 + (j << 2) >> 2]);g[C + 400 + (h << 2) >> 2] = ca(rb - ca(g[C + 908 + (j << 2) >> 2]));
          } while (0);C = c[C + 952 >> 2] | 0;if (!C) break mb;
        }
      } while (0);z = (fb & -3 | 0) == 1;A = (gb & -3 | 0) == 1;if (!(z | A)) {
        i = ob;return;
      }B = 1692 + (fb << 2) | 0;C = 1644 + (fb << 2) | 0;w = 1660 + (fb << 2) | 0;x = 1692 + (gb << 2) | 0;y = 1644 + (gb << 2) | 0;q = 1660 + (gb << 2) | 0;v = 0;do {
        h = uc(c[hb >> 2] | 0, v) | 0;do if ((c[h + 36 >> 2] | 0) != 1) {
          if (z) {
            nb = c[B >> 2] | 0;rb = ca(g[h + 908 + (nb << 2) >> 2]);rb = ca(ca(g[b + 908 + (nb << 2) >> 2]) - rb);rb = ca(rb - ca(g[h + 400 + (c[C >> 2] << 2) >> 2]));g[h + 400 + (c[w >> 2] << 2) >> 2] = rb;
          }if (!A) break;nb = c[x >> 2] | 0;rb = ca(g[h + 908 + (nb << 2) >> 2]);rb = ca(ca(g[b + 908 + (nb << 2) >> 2]) - rb);rb = ca(rb - ca(g[h + 400 + (c[y >> 2] << 2) >> 2]));g[h + 400 + (c[q >> 2] << 2) >> 2] = rb;
        } while (0);v = v + 1 | 0;
      } while ((v | 0) != (ib | 0));i = ob;return;
    }function me(a, b, d, e, f) {
      a = a | 0;b = b | 0;d = ca(d);e = ca(e);f = ca(f);var h = 0,
          i = 0,
          j = 0,
          k = Hb,
          l = 0,
          m = 0,
          n = 0;h = c[a + 4 >> 2] | 0;b = (b | 0) == 2 & (c[a + 944 >> 2] | 0) != 0;a: do if (b) {
        switch (h | 0) {case 2:
            {
              h = 3;i = 0;m = 0;break a;
            }case 3:
            break;default:
            {
              n = 4;break a;
            }}h = 2;i = 0;m = 0;
      } else n = 4; while (0);if ((n | 0) == 4) {
        m = h >>> 0 < 2;i = m;m = m ? b ? 3 : 2 : 0;
      }k = ca(pe(a, h, d));e = ca(pe(a, m, e));b: do if ((h & -2 | 0) == 2 ? (j = c[a + 96 >> 2] | 0, (j | 0) != 0) : 0) {
        b = a + 92 | 0;if ((j | 0) == 3) d = ca(0.0);else switch (j | 0) {case 2:
            {
              d = ca(ca(ca(g[b >> 2]) * f) / ca(100.0));break b;
            }case 1:
            {
              d = ca(g[b >> 2]);break b;
            }default:
            {
              d = ca(s);break b;
            }}
      } else n = 11; while (0);c: do if ((n | 0) == 11) {
        b = c[1644 + (h << 2) >> 2] | 0;d: do if (!(c[a + 60 + (b << 3) + 4 >> 2] | 0)) {
          if (i ? (c[a + 120 >> 2] | 0) != 0 : 0) {
            b = a + 116 | 0;break;
          }switch (b | 0) {case 0:case 2:case 4:case 5:
              {
                if (c[a + 112 >> 2] | 0) {
                  b = a + 108 | 0;break d;
                }break;
              }default:
              {}}b = (c[a + 128 >> 2] | 0) == 0 ? 1612 : a + 124 | 0;
        } else b = a + 60 + (b << 3) | 0; while (0);i = c[b + 4 >> 2] | 0;if ((i | 0) == 3) d = ca(0.0);else switch (i | 0) {case 2:
            {
              d = ca(ca(ca(g[b >> 2]) * f) / ca(100.0));break c;
            }case 1:
            {
              d = ca(g[b >> 2]);break c;
            }default:
            {
              d = ca(s);break c;
            }}
      } while (0);d = ca(k + d);g[a + 400 + (c[1644 + (h << 2) >> 2] << 2) >> 2] = d;k = ca(k + ca(ke(a, h, f)));g[a + 400 + (c[1660 + (h << 2) >> 2] << 2) >> 2] = k;e: do if ((m & -2 | 0) == 2 ? (l = c[a + 96 >> 2] | 0, (l | 0) != 0) : 0) {
        b = a + 92 | 0;if ((l | 0) == 3) d = ca(0.0);else switch (l | 0) {case 2:
            {
              d = ca(ca(ca(g[b >> 2]) * f) / ca(100.0));break e;
            }case 1:
            {
              d = ca(g[b >> 2]);break e;
            }default:
            {
              d = ca(s);break e;
            }}
      } else n = 30; while (0);f: do if ((n | 0) == 30) {
        b = c[1644 + (m << 2) >> 2] | 0;g: do if (!(c[a + 60 + (b << 3) + 4 >> 2] | 0)) {
          if (m >>> 0 < 2 ? (c[a + 120 >> 2] | 0) != 0 : 0) {
            b = a + 116 | 0;break;
          }switch (b | 0) {case 0:case 2:case 4:case 5:
              {
                if (c[a + 112 >> 2] | 0) {
                  b = a + 108 | 0;break g;
                }break;
              }default:
              {}}b = (c[a + 128 >> 2] | 0) == 0 ? 1612 : a + 124 | 0;
        } else b = a + 60 + (b << 3) | 0; while (0);h = c[b + 4 >> 2] | 0;if ((h | 0) == 3) d = ca(0.0);else switch (h | 0) {case 2:
            {
              d = ca(ca(ca(g[b >> 2]) * f) / ca(100.0));break f;
            }case 1:
            {
              d = ca(g[b >> 2]);break f;
            }default:
            {
              d = ca(s);break f;
            }}
      } while (0);k = ca(e + d);g[a + 400 + (c[1644 + (m << 2) >> 2] << 2) >> 2] = k;f = ca(e + ca(ke(a, m, f)));g[a + 400 + (c[1660 + (m << 2) >> 2] << 2) >> 2] = f;return;
    }function ne(a, b, d, e) {
      a = a | 0;b = ca(b);d = ca(d);e = ca(e);var f = 0,
          h = 0,
          i = 0,
          j = Hb,
          l = Hb,
          m = 0,
          n = 0,
          o = Hb,
          p = Hb,
          q = Hb,
          r = Hb,
          s = Hb;if (b == ca(0.0)) return;f = a + 400 | 0;s = ca(g[f >> 2]);h = a + 404 | 0;r = ca(g[h >> 2]);m = a + 416 | 0;q = ca(g[m >> 2]);n = a + 420 | 0;l = ca(g[n >> 2]);p = ca(s + d);o = ca(r + e);e = ca(p + q);j = ca(o + l);i = (c[a + 980 >> 2] | 0) == 1;g[f >> 2] = ca(je(s, b, 0, i));g[h >> 2] = ca(je(r, b, 0, i));d = ca(Xn(ca(q * b), ca(1.0)));if (((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
        if (ca(O(ca(d))) < ca(.0000999999974)) h = 0;else h = !(ca(O(ca(d + ca(-1.0)))) < ca(.0000999999974));
      } else h = 1;d = ca(Xn(ca(l * b), ca(1.0)));if (((g[k >> 2] = d, c[k >> 2] | 0) & 2147483647) >>> 0 <= 2139095040) {
        if (ca(O(ca(d))) < ca(.0000999999974)) f = 0;else f = !(ca(O(ca(d + ca(-1.0)))) < ca(.0000999999974));
      } else f = 1;s = ca(je(e, b, i & h, i & (h ^ 1)));g[m >> 2] = ca(s - ca(je(p, b, 0, i)));s = ca(je(j, b, i & f, i & (f ^ 1)));g[n >> 2] = ca(s - ca(je(o, b, 0, i)));f = a + 948 | 0;h = qc(c[f >> 2] | 0) | 0;if (!h) return;else i = 0;do {
        ne(uc(c[f >> 2] | 0, i) | 0, b, p, o);i = i + 1 | 0;
      } while ((i | 0) != (h | 0));return;
    }function oe(a, b, d, e, f) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;switch (d | 0) {case 5:case 0:
          {
            b = po(c[1179] | 0, e, f) | 0;return b | 0;
          }default:
          {
            b = qo(e, f) | 0;return b | 0;
          }}return 0;
    }function pe(a, b, d) {
      a = a | 0;b = b | 0;d = ca(d);var e = 0,
          f = 0;if ((b & -2 | 0) == 2) {
        do if (!(c[a + 168 >> 2] | 0)) {
          if (!(c[a + 184 >> 2] | 0)) {
            e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
          } else {
            e = a + 180 | 0;break;
          }
        } else e = a + 164 | 0; while (0);if (!(c[e + 4 >> 2] | 0)) f = 8;
      } else f = 8;if ((f | 0) == 8) {
        e = c[1644 + (b << 2) >> 2] | 0;a: do if (!(c[a + 132 + (e << 3) + 4 >> 2] | 0)) {
          if (b >>> 0 < 2 ? (c[a + 192 >> 2] | 0) != 0 : 0) {
            e = a + 188 | 0;break;
          }switch (e | 0) {case 0:case 2:case 4:case 5:
              {
                if (c[a + 184 >> 2] | 0) {
                  e = a + 180 | 0;break a;
                }break;
              }default:
              {}}e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;
        } else e = a + 132 + (e << 3) | 0; while (0);if (!(c[e + 4 >> 2] | 0)) {
          d = ca(-ca(re(a, b, d)));return ca(d);
        }
      }d = ca(qe(a, b, d));return ca(d);
    }function qe(a, b, d) {
      a = a | 0;b = b | 0;d = ca(d);var e = 0;a: do if ((b & -2 | 0) == 2) {
        do if (!(c[a + 168 >> 2] | 0)) {
          if (!(c[a + 184 >> 2] | 0)) {
            e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;break;
          } else {
            e = a + 180 | 0;break;
          }
        } else e = a + 164 | 0; while (0);switch (c[e + 4 >> 2] | 0) {case 0:
            break a;case 2:
            {
              d = ca(ca(ca(g[e >> 2]) * d) / ca(100.0));return ca(d);
            }case 1:
            {
              d = ca(g[e >> 2]);return ca(d);
            }default:
            {
              d = ca(s);return ca(d);
            }}
      } while (0);e = c[1644 + (b << 2) >> 2] | 0;b: do if (!(c[a + 132 + (e << 3) + 4 >> 2] | 0)) {
        if (b >>> 0 < 2 ? (c[a + 192 >> 2] | 0) != 0 : 0) {
          e = a + 188 | 0;break;
        }switch (e | 0) {case 0:case 2:case 4:case 5:
            {
              if (c[a + 184 >> 2] | 0) {
                e = a + 180 | 0;break b;
              }break;
            }default:
            {}}e = (c[a + 200 >> 2] | 0) == 0 ? 1676 : a + 196 | 0;
      } else e = a + 132 + (e << 3) | 0; while (0);b = c[e + 4 >> 2] | 0;if (!b) {
        d = ca(0.0);return ca(d);
      }switch (b | 0) {case 2:
          {
            d = ca(ca(ca(g[e >> 2]) * d) / ca(100.0));return ca(d);
          }case 1:
          {
            d = ca(g[e >> 2]);return ca(d);
          }default:
          {
            d = ca(s);return ca(d);
          }}return ca(0);
    }function _n(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;do if (b) {
        if (d >>> 0 < 128) {
          a[b >> 0] = d;b = 1;break;
        }if (d >>> 0 < 2048) {
          a[b >> 0] = d >>> 6 | 192;a[b + 1 >> 0] = d & 63 | 128;b = 2;break;
        }if (d >>> 0 < 55296 | (d & -8192 | 0) == 57344) {
          a[b >> 0] = d >>> 12 | 224;a[b + 1 >> 0] = d >>> 6 & 63 | 128;a[b + 2 >> 0] = d & 63 | 128;b = 3;break;
        }if ((d + -65536 | 0) >>> 0 < 1048576) {
          a[b >> 0] = d >>> 18 | 240;a[b + 1 >> 0] = d >>> 12 & 63 | 128;a[b + 2 >> 0] = d >>> 6 & 63 | 128;a[b + 3 >> 0] = d & 63 | 128;b = 4;break;
        } else {
          c[(Sn() | 0) >> 2] = 84;b = -1;break;
        }
      } else b = 1; while (0);return b | 0;
    }function $n(a, b) {
      a = a | 0;b = b | 0;if (!a) a = 0;else a = _n(a, b, 0) | 0;return a | 0;
    }function ao(a) {
      a = a | 0;return 0;
    }function bo(a) {
      a = a | 0;return;
    }function co(b, e) {
      b = b | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0;m = i;i = i + 16 | 0;l = m;k = e & 255;a[l >> 0] = k;g = b + 16 | 0;h = c[g >> 2] | 0;if (!h) {
        if (!(io(b) | 0)) {
          h = c[g >> 2] | 0;j = 4;
        } else f = -1;
      } else j = 4;do if ((j | 0) == 4) {
        g = b + 20 | 0;j = c[g >> 2] | 0;if (j >>> 0 < h >>> 0 ? (f = e & 255, (f | 0) != (a[b + 75 >> 0] | 0)) : 0) {
          c[g >> 2] = j + 1;a[j >> 0] = k;break;
        }if ((Qb[c[b + 36 >> 2] & 15](b, l, 1) | 0) == 1) f = d[l >> 0] | 0;else f = -1;
      } while (0);i = m;return f | 0;
    }function eo(a) {
      a = a | 0;var b = 0,
          d = 0;b = i;i = i + 16 | 0;d = b;c[d >> 2] = c[a + 60 >> 2];a = Un(vb(6, d | 0) | 0) | 0;i = b;return a | 0;
    }function fo(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0;f = i;i = i + 32 | 0;g = f;e = f + 20 | 0;c[g >> 2] = c[a + 60 >> 2];c[g + 4 >> 2] = 0;c[g + 8 >> 2] = b;c[g + 12 >> 2] = e;c[g + 16 >> 2] = d;if ((Un(lb(140, g | 0) | 0) | 0) < 0) {
        c[e >> 2] = -1;a = -1;
      } else a = c[e >> 2] | 0;i = f;return a | 0;
    }function go(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0;q = i;i = i + 48 | 0;n = q + 16 | 0;m = q;e = q + 32 | 0;o = a + 28 | 0;f = c[o >> 2] | 0;c[e >> 2] = f;p = a + 20 | 0;f = (c[p >> 2] | 0) - f | 0;c[e + 4 >> 2] = f;c[e + 8 >> 2] = b;c[e + 12 >> 2] = d;k = a + 60 | 0;l = a + 44 | 0;b = 2;f = f + d | 0;while (1) {
        if (!(c[1168] | 0)) {
          c[n >> 2] = c[k >> 2];c[n + 4 >> 2] = e;c[n + 8 >> 2] = b;h = Un(Eb(146, n | 0) | 0) | 0;
        } else {
          wb(78, a | 0);c[m >> 2] = c[k >> 2];c[m + 4 >> 2] = e;c[m + 8 >> 2] = b;h = Un(Eb(146, m | 0) | 0) | 0;Ea(0);
        }if ((f | 0) == (h | 0)) {
          f = 6;break;
        }if ((h | 0) < 0) {
          f = 8;break;
        }f = f - h | 0;g = c[e + 4 >> 2] | 0;if (h >>> 0 <= g >>> 0) {
          if ((b | 0) == 2) {
            c[o >> 2] = (c[o >> 2] | 0) + h;j = g;b = 2;
          } else j = g;
        } else {
          j = c[l >> 2] | 0;c[o >> 2] = j;c[p >> 2] = j;j = c[e + 12 >> 2] | 0;h = h - g | 0;e = e + 8 | 0;b = b + -1 | 0;
        }c[e >> 2] = (c[e >> 2] | 0) + h;c[e + 4 >> 2] = j - h;
      }if ((f | 0) == 6) {
        n = c[l >> 2] | 0;c[a + 16 >> 2] = n + (c[a + 48 >> 2] | 0);a = n;c[o >> 2] = a;c[p >> 2] = a;
      } else if ((f | 0) == 8) {
        c[a + 16 >> 2] = 0;c[o >> 2] = 0;c[p >> 2] = 0;c[a >> 2] = c[a >> 2] | 32;if ((b | 0) == 2) d = 0;else d = d - (c[e + 4 >> 2] | 0) | 0;
      }i = q;return d | 0;
    }function ho(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0;g = i;i = i + 80 | 0;f = g;c[b + 36 >> 2] = 3;if ((c[b >> 2] & 64 | 0) == 0 ? (c[f >> 2] = c[b + 60 >> 2], c[f + 4 >> 2] = 21505, c[f + 8 >> 2] = g + 12, (mb(54, f | 0) | 0) != 0) : 0) a[b + 75 >> 0] = -1;f = go(b, d, e) | 0;i = g;return f | 0;
    }function io(b) {
      b = b | 0;var d = 0,
          e = 0;d = b + 74 | 0;e = a[d >> 0] | 0;a[d >> 0] = e + 255 | e;d = c[b >> 2] | 0;if (!(d & 8)) {
        c[b + 8 >> 2] = 0;c[b + 4 >> 2] = 0;d = c[b + 44 >> 2] | 0;c[b + 28 >> 2] = d;c[b + 20 >> 2] = d;c[b + 16 >> 2] = d + (c[b + 48 >> 2] | 0);d = 0;
      } else {
        c[b >> 2] = d | 32;d = -1;
      }return d | 0;
    }function jo(a, b) {
      a = a | 0;b = b | 0;return (lo(a, vo(a) | 0, 1, b) | 0) + -1 | 0;
    }function ko(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          i = 0;f = e + 16 | 0;g = c[f >> 2] | 0;if (!g) {
        if (!(io(e) | 0)) {
          g = c[f >> 2] | 0;h = 4;
        } else f = 0;
      } else h = 4;a: do if ((h | 0) == 4) {
        i = e + 20 | 0;h = c[i >> 2] | 0;if ((g - h | 0) >>> 0 < d >>> 0) {
          f = Qb[c[e + 36 >> 2] & 15](e, b, d) | 0;break;
        }b: do if ((a[e + 75 >> 0] | 0) > -1) {
          f = d;while (1) {
            if (!f) {
              g = h;f = 0;break b;
            }g = f + -1 | 0;if ((a[b + g >> 0] | 0) == 10) break;else f = g;
          }if ((Qb[c[e + 36 >> 2] & 15](e, b, f) | 0) >>> 0 < f >>> 0) break a;d = d - f | 0;b = b + f | 0;g = c[i >> 2] | 0;
        } else {
          g = h;f = 0;
        } while (0);So(g | 0, b | 0, d | 0) | 0;c[i >> 2] = (c[i >> 2] | 0) + d;f = f + d | 0;
      } while (0);return f | 0;
    }function lo(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0;f = $(d, b) | 0;if ((c[e + 76 >> 2] | 0) > -1) {
        g = (ao(e) | 0) == 0;a = ko(a, f, e) | 0;if (!g) bo(e);
      } else a = ko(a, f, e) | 0;if ((a | 0) != (f | 0)) d = (a >>> 0) / (b >>> 0) | 0;return d | 0;
    }function mo(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;d = i;i = i + 16 | 0;e = d;c[e >> 2] = b;b = po(c[1180] | 0, a, e) | 0;i = d;return b | 0;
    }function no(b) {
      b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0;f = c[1180] | 0;if ((c[f + 76 >> 2] | 0) > -1) g = ao(f) | 0;else g = 0;do if ((jo(b, f) | 0) < 0) d = 1;else {
        if ((a[f + 75 >> 0] | 0) != 10 ? (d = f + 20 | 0, e = c[d >> 2] | 0, e >>> 0 < (c[f + 16 >> 2] | 0) >>> 0) : 0) {
          c[d >> 2] = e + 1;a[e >> 0] = 10;d = 0;break;
        }d = (co(f, 10) | 0) < 0;
      } while (0);if (g) bo(f);return d << 31 >> 31 | 0;
    }function oo(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0;f = i;i = i + 16 | 0;g = f;c[g >> 2] = e;e = ro(a, b, d, g) | 0;i = f;return e | 0;
    }function po(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0;s = i;i = i + 224 | 0;o = s + 80 | 0;r = s + 96 | 0;q = s;p = s + 136 | 0;f = r;g = f + 40 | 0;do {
        c[f >> 2] = 0;f = f + 4 | 0;
      } while ((f | 0) < (g | 0));c[o >> 2] = c[e >> 2];if ((xo(0, d, o, q, r) | 0) < 0) e = -1;else {
        if ((c[b + 76 >> 2] | 0) > -1) m = ao(b) | 0;else m = 0;e = c[b >> 2] | 0;n = e & 32;if ((a[b + 74 >> 0] | 0) < 1) c[b >> 2] = e & -33;e = b + 48 | 0;if (!(c[e >> 2] | 0)) {
          g = b + 44 | 0;h = c[g >> 2] | 0;c[g >> 2] = p;j = b + 28 | 0;c[j >> 2] = p;k = b + 20 | 0;c[k >> 2] = p;c[e >> 2] = 80;l = b + 16 | 0;c[l >> 2] = p + 80;f = xo(b, d, o, q, r) | 0;if (h) {
            Qb[c[b + 36 >> 2] & 15](b, 0, 0) | 0;f = (c[k >> 2] | 0) == 0 ? -1 : f;c[g >> 2] = h;c[e >> 2] = 0;c[l >> 2] = 0;c[j >> 2] = 0;c[k >> 2] = 0;
          }
        } else f = xo(b, d, o, q, r) | 0;e = c[b >> 2] | 0;c[b >> 2] = e | n;if (m) bo(b);e = (e & 32 | 0) == 0 ? f : -1;
      }i = s;return e | 0;
    }function qo(a, b) {
      a = a | 0;b = b | 0;return po(c[1180] | 0, a, b) | 0;
    }function ro(b, d, e, f) {
      b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0;n = i;i = i + 128 | 0;g = n + 112 | 0;m = n;h = m;j = 4728;k = h + 112 | 0;do {
        c[h >> 2] = c[j >> 2];h = h + 4 | 0;j = j + 4 | 0;
      } while ((h | 0) < (k | 0));if ((d + -1 | 0) >>> 0 > 2147483646) {
        if (!d) {
          d = 1;l = 4;
        } else {
          c[(Sn() | 0) >> 2] = 75;d = -1;
        }
      } else {
        g = b;l = 4;
      }if ((l | 0) == 4) {
        l = -2 - g | 0;l = d >>> 0 > l >>> 0 ? l : d;c[m + 48 >> 2] = l;b = m + 20 | 0;c[b >> 2] = g;c[m + 44 >> 2] = g;d = g + l | 0;g = m + 16 | 0;c[g >> 2] = d;c[m + 28 >> 2] = d;d = po(m, e, f) | 0;if (l) {
          e = c[b >> 2] | 0;a[e + (((e | 0) == (c[g >> 2] | 0)) << 31 >> 31) >> 0] = 0;
        }
      }i = n;return d | 0;
    }function so(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          i = 0;h = d & 255;f = (e | 0) != 0;a: do if (f & (b & 3 | 0) != 0) {
        g = d & 255;while (1) {
          if ((a[b >> 0] | 0) == g << 24 >> 24) {
            i = 6;break a;
          }b = b + 1 | 0;e = e + -1 | 0;f = (e | 0) != 0;if (!(f & (b & 3 | 0) != 0)) {
            i = 5;break;
          }
        }
      } else i = 5; while (0);if ((i | 0) == 5) if (f) i = 6;else e = 0;b: do if ((i | 0) == 6) {
        g = d & 255;if ((a[b >> 0] | 0) != g << 24 >> 24) {
          f = $(h, 16843009) | 0;c: do if (e >>> 0 > 3) while (1) {
            h = c[b >> 2] ^ f;if ((h & -2139062144 ^ -2139062144) & h + -16843009) break;b = b + 4 | 0;e = e + -4 | 0;if (e >>> 0 <= 3) {
              i = 11;break c;
            }
          } else i = 11; while (0);if ((i | 0) == 11) if (!e) {
            e = 0;break;
          }while (1) {
            if ((a[b >> 0] | 0) == g << 24 >> 24) break b;b = b + 1 | 0;e = e + -1 | 0;if (!e) {
              e = 0;break;
            }
          }
        }
      } while (0);return ((e | 0) != 0 ? b : 0) | 0;
    }function to(b, c, d) {
      b = b | 0;c = c | 0;d = d | 0;var e = 0,
          f = 0;a: do if (!d) d = 0;else {
        f = d;e = b;while (1) {
          b = a[e >> 0] | 0;d = a[c >> 0] | 0;if (b << 24 >> 24 != d << 24 >> 24) break;f = f + -1 | 0;if (!f) {
            d = 0;break a;
          } else {
            e = e + 1 | 0;c = c + 1 | 0;
          }
        }d = (b & 255) - (d & 255) | 0;
      } while (0);return d | 0;
    }function uo(b, c) {
      b = b | 0;c = c | 0;var d = 0,
          e = 0;e = a[b >> 0] | 0;d = a[c >> 0] | 0;if (e << 24 >> 24 == 0 ? 1 : e << 24 >> 24 != d << 24 >> 24) c = e;else {
        do {
          b = b + 1 | 0;c = c + 1 | 0;e = a[b >> 0] | 0;d = a[c >> 0] | 0;
        } while (!(e << 24 >> 24 == 0 ? 1 : e << 24 >> 24 != d << 24 >> 24));c = e;
      }return (c & 255) - (d & 255) | 0;
    }function vo(b) {
      b = b | 0;var d = 0,
          e = 0,
          f = 0;f = b;a: do if (!(f & 3)) e = 4;else {
        d = b;b = f;while (1) {
          if (!(a[d >> 0] | 0)) break a;d = d + 1 | 0;b = d;if (!(b & 3)) {
            b = d;e = 4;break;
          }
        }
      } while (0);if ((e | 0) == 4) {
        while (1) {
          d = c[b >> 2] | 0;if (!((d & -2139062144 ^ -2139062144) & d + -16843009)) b = b + 4 | 0;else break;
        }if ((d & 255) << 24 >> 24) do b = b + 1 | 0; while ((a[b >> 0] | 0) != 0);
      }return b - f | 0;
    }function wo(a) {
      a = a | 0;if (!(c[a + 68 >> 2] | 0)) bo(a);return;
    }function xo(e, f, g, j, l) {
      e = e | 0;f = f | 0;g = g | 0;j = j | 0;l = l | 0;var m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0.0,
          r = 0,
          s = 0,
          t = 0,
          u = 0,
          v = 0.0,
          w = 0,
          x = 0,
          y = 0,
          z = 0,
          A = 0,
          B = 0,
          C = 0,
          E = 0,
          F = 0,
          G = 0,
          H = 0,
          I = 0,
          J = 0,
          K = 0,
          L = 0,
          M = 0,
          N = 0,
          O = 0,
          P = 0,
          Q = 0,
          R = 0,
          S = 0,
          T = 0,
          U = 0,
          V = 0,
          W = 0,
          X = 0,
          Y = 0,
          Z = 0,
          _ = 0,
          aa = 0,
          ba = 0,
          ca = 0,
          da = 0,
          ea = 0,
          fa = 0,
          ga = 0,
          ha = 0;ha = i;i = i + 624 | 0;ca = ha + 24 | 0;ea = ha + 16 | 0;da = ha + 588 | 0;Y = ha + 576 | 0;ba = ha;V = ha + 536 | 0;ga = ha + 8 | 0;fa = ha + 528 | 0;M = (e | 0) != 0;N = V + 40 | 0;U = N;V = V + 39 | 0;W = ga + 4 | 0;X = Y + 12 | 0;Y = Y + 11 | 0;Z = da;_ = X;aa = _ - Z | 0;O = -2 - Z | 0;P = _ + 2 | 0;Q = ca + 288 | 0;R = da + 9 | 0;S = R;T = da + 8 | 0;m = 0;w = f;n = 0;f = 0;a: while (1) {
        do if ((m | 0) > -1) if ((n | 0) > (2147483647 - m | 0)) {
          c[(Sn() | 0) >> 2] = 75;m = -1;break;
        } else {
          m = n + m | 0;break;
        } while (0);n = a[w >> 0] | 0;if (!(n << 24 >> 24)) {
          L = 245;break;
        } else o = w;b: while (1) {
          switch (n << 24 >> 24) {case 37:
              {
                n = o;L = 9;break b;
              }case 0:
              {
                n = o;break b;
              }default:
              {}}K = o + 1 | 0;n = a[K >> 0] | 0;o = K;
        }c: do if ((L | 0) == 9) while (1) {
          L = 0;if ((a[n + 1 >> 0] | 0) != 37) break c;o = o + 1 | 0;n = n + 2 | 0;if ((a[n >> 0] | 0) == 37) L = 9;else break;
        } while (0);y = o - w | 0;if (M ? (c[e >> 2] & 32 | 0) == 0 : 0) ko(w, y, e) | 0;if ((o | 0) != (w | 0)) {
          w = n;n = y;continue;
        }r = n + 1 | 0;o = a[r >> 0] | 0;p = (o << 24 >> 24) + -48 | 0;if (p >>> 0 < 10) {
          K = (a[n + 2 >> 0] | 0) == 36;r = K ? n + 3 | 0 : r;o = a[r >> 0] | 0;u = K ? p : -1;f = K ? 1 : f;
        } else u = -1;n = o << 24 >> 24;d: do if ((n & -32 | 0) == 32) {
          p = 0;while (1) {
            if (!(1 << n + -32 & 75913)) {
              s = p;n = r;break d;
            }p = 1 << (o << 24 >> 24) + -32 | p;r = r + 1 | 0;o = a[r >> 0] | 0;n = o << 24 >> 24;if ((n & -32 | 0) != 32) {
              s = p;n = r;break;
            }
          }
        } else {
          s = 0;n = r;
        } while (0);do if (o << 24 >> 24 == 42) {
          p = n + 1 | 0;o = (a[p >> 0] | 0) + -48 | 0;if (o >>> 0 < 10 ? (a[n + 2 >> 0] | 0) == 36 : 0) {
            c[l + (o << 2) >> 2] = 10;f = 1;n = n + 3 | 0;o = c[j + ((a[p >> 0] | 0) + -48 << 3) >> 2] | 0;
          } else {
            if (f) {
              m = -1;break a;
            }if (!M) {
              x = s;n = p;f = 0;K = 0;break;
            }f = (c[g >> 2] | 0) + (4 - 1) & ~(4 - 1);o = c[f >> 2] | 0;c[g >> 2] = f + 4;f = 0;n = p;
          }if ((o | 0) < 0) {
            x = s | 8192;K = 0 - o | 0;
          } else {
            x = s;K = o;
          }
        } else {
          p = (o << 24 >> 24) + -48 | 0;if (p >>> 0 < 10) {
            o = 0;do {
              o = (o * 10 | 0) + p | 0;n = n + 1 | 0;p = (a[n >> 0] | 0) + -48 | 0;
            } while (p >>> 0 < 10);if ((o | 0) < 0) {
              m = -1;break a;
            } else {
              x = s;K = o;
            }
          } else {
            x = s;K = 0;
          }
        } while (0);e: do if ((a[n >> 0] | 0) == 46) {
          p = n + 1 | 0;o = a[p >> 0] | 0;if (o << 24 >> 24 != 42) {
            r = (o << 24 >> 24) + -48 | 0;if (r >>> 0 < 10) {
              n = p;o = 0;
            } else {
              n = p;r = 0;break;
            }while (1) {
              o = (o * 10 | 0) + r | 0;n = n + 1 | 0;r = (a[n >> 0] | 0) + -48 | 0;if (r >>> 0 >= 10) {
                r = o;break e;
              }
            }
          }p = n + 2 | 0;o = (a[p >> 0] | 0) + -48 | 0;if (o >>> 0 < 10 ? (a[n + 3 >> 0] | 0) == 36 : 0) {
            c[l + (o << 2) >> 2] = 10;n = n + 4 | 0;r = c[j + ((a[p >> 0] | 0) + -48 << 3) >> 2] | 0;break;
          }if (f) {
            m = -1;break a;
          }if (M) {
            n = (c[g >> 2] | 0) + (4 - 1) & ~(4 - 1);r = c[n >> 2] | 0;c[g >> 2] = n + 4;n = p;
          } else {
            n = p;r = 0;
          }
        } else r = -1; while (0);t = 0;while (1) {
          o = (a[n >> 0] | 0) + -65 | 0;if (o >>> 0 > 57) {
            m = -1;break a;
          }p = n + 1 | 0;o = a[11993 + (t * 58 | 0) + o >> 0] | 0;s = o & 255;if ((s + -1 | 0) >>> 0 < 8) {
            n = p;t = s;
          } else {
            J = p;break;
          }
        }if (!(o << 24 >> 24)) {
          m = -1;break;
        }p = (u | 0) > -1;do if (o << 24 >> 24 == 19) {
          if (p) {
            m = -1;break a;
          } else L = 52;
        } else {
          if (p) {
            c[l + (u << 2) >> 2] = s;H = j + (u << 3) | 0;I = c[H + 4 >> 2] | 0;L = ba;c[L >> 2] = c[H >> 2];c[L + 4 >> 2] = I;L = 52;break;
          }if (!M) {
            m = 0;break a;
          }zo(ba, s, g);
        } while (0);if ((L | 0) == 52 ? (L = 0, !M) : 0) {
          w = J;n = y;continue;
        }u = a[n >> 0] | 0;u = (t | 0) != 0 & (u & 15 | 0) == 3 ? u & -33 : u;p = x & -65537;I = (x & 8192 | 0) == 0 ? x : p;f: do switch (u | 0) {case 110:
            switch (t | 0) {case 0:
                {
                  c[c[ba >> 2] >> 2] = m;w = J;n = y;continue a;
                }case 1:
                {
                  c[c[ba >> 2] >> 2] = m;w = J;n = y;continue a;
                }case 2:
                {
                  w = c[ba >> 2] | 0;c[w >> 2] = m;c[w + 4 >> 2] = ((m | 0) < 0) << 31 >> 31;w = J;n = y;continue a;
                }case 3:
                {
                  b[c[ba >> 2] >> 1] = m;w = J;n = y;continue a;
                }case 4:
                {
                  a[c[ba >> 2] >> 0] = m;w = J;n = y;continue a;
                }case 6:
                {
                  c[c[ba >> 2] >> 2] = m;w = J;n = y;continue a;
                }case 7:
                {
                  w = c[ba >> 2] | 0;c[w >> 2] = m;c[w + 4 >> 2] = ((m | 0) < 0) << 31 >> 31;w = J;n = y;continue a;
                }default:
                {
                  w = J;n = y;continue a;
                }}case 112:
            {
              t = I | 8;r = r >>> 0 > 8 ? r : 8;u = 120;L = 64;break;
            }case 88:case 120:
            {
              t = I;L = 64;break;
            }case 111:
            {
              p = ba;o = c[p >> 2] | 0;p = c[p + 4 >> 2] | 0;if ((o | 0) == 0 & (p | 0) == 0) n = N;else {
                n = N;do {
                  n = n + -1 | 0;a[n >> 0] = o & 7 | 48;o = Ro(o | 0, p | 0, 3) | 0;p = D;
                } while (!((o | 0) == 0 & (p | 0) == 0));
              }if (!(I & 8)) {
                o = I;t = 0;s = 12473;L = 77;
              } else {
                t = U - n + 1 | 0;o = I;r = (r | 0) < (t | 0) ? t : r;t = 0;s = 12473;L = 77;
              }break;
            }case 105:case 100:
            {
              o = ba;n = c[o >> 2] | 0;o = c[o + 4 >> 2] | 0;if ((o | 0) < 0) {
                n = No(0, 0, n | 0, o | 0) | 0;o = D;p = ba;c[p >> 2] = n;c[p + 4 >> 2] = o;p = 1;s = 12473;L = 76;break f;
              }if (!(I & 2048)) {
                s = I & 1;p = s;s = (s | 0) == 0 ? 12473 : 12475;L = 76;
              } else {
                p = 1;s = 12474;L = 76;
              }break;
            }case 117:
            {
              o = ba;n = c[o >> 2] | 0;o = c[o + 4 >> 2] | 0;p = 0;s = 12473;L = 76;break;
            }case 99:
            {
              a[V >> 0] = c[ba >> 2];w = V;o = 1;t = 0;u = 12473;n = N;break;
            }case 109:
            {
              n = Tn(c[(Sn() | 0) >> 2] | 0) | 0;L = 82;break;
            }case 115:
            {
              n = c[ba >> 2] | 0;n = (n | 0) != 0 ? n : 12483;L = 82;break;
            }case 67:
            {
              c[ga >> 2] = c[ba >> 2];c[W >> 2] = 0;c[ba >> 2] = ga;r = -1;L = 86;break;
            }case 83:
            {
              if (!r) {
                Bo(e, 32, K, 0, I);n = 0;L = 98;
              } else L = 86;break;
            }case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101:
            {
              q = +h[ba >> 3];c[ea >> 2] = 0;h[k >> 3] = q;if ((c[k + 4 >> 2] | 0) >= 0) {
                if (!(I & 2048)) {
                  H = I & 1;G = H;H = (H | 0) == 0 ? 12491 : 12496;
                } else {
                  G = 1;H = 12493;
                }
              } else {
                q = -q;G = 1;H = 12490;
              }h[k >> 3] = q;F = c[k + 4 >> 2] & 2146435072;do if (F >>> 0 < 2146435072 | (F | 0) == 2146435072 & 0 < 0) {
                v = +Zn(q, ea) * 2.0;o = v != 0.0;if (o) c[ea >> 2] = (c[ea >> 2] | 0) + -1;C = u | 32;if ((C | 0) == 97) {
                  w = u & 32;y = (w | 0) == 0 ? H : H + 9 | 0;x = G | 2;n = 12 - r | 0;do if (!(r >>> 0 > 11 | (n | 0) == 0)) {
                    q = 8.0;do {
                      n = n + -1 | 0;q = q * 16.0;
                    } while ((n | 0) != 0);if ((a[y >> 0] | 0) == 45) {
                      q = -(q + (-v - q));break;
                    } else {
                      q = v + q - q;break;
                    }
                  } else q = v; while (0);o = c[ea >> 2] | 0;n = (o | 0) < 0 ? 0 - o | 0 : o;n = Ao(n, ((n | 0) < 0) << 31 >> 31, X) | 0;if ((n | 0) == (X | 0)) {
                    a[Y >> 0] = 48;n = Y;
                  }a[n + -1 >> 0] = (o >> 31 & 2) + 43;t = n + -2 | 0;a[t >> 0] = u + 15;s = (r | 0) < 1;p = (I & 8 | 0) == 0;o = da;while (1) {
                    H = ~~q;n = o + 1 | 0;a[o >> 0] = d[12457 + H >> 0] | w;q = (q - +(H | 0)) * 16.0;do if ((n - Z | 0) == 1) {
                      if (p & (s & q == 0.0)) break;a[n >> 0] = 46;n = o + 2 | 0;
                    } while (0);if (!(q != 0.0)) break;else o = n;
                  }r = (r | 0) != 0 & (O + n | 0) < (r | 0) ? P + r - t | 0 : aa - t + n | 0;p = r + x | 0;Bo(e, 32, K, p, I);if (!(c[e >> 2] & 32)) ko(y, x, e) | 0;Bo(e, 48, K, p, I ^ 65536);n = n - Z | 0;if (!(c[e >> 2] & 32)) ko(da, n, e) | 0;o = _ - t | 0;Bo(e, 48, r - (n + o) | 0, 0, 0);if (!(c[e >> 2] & 32)) ko(t, o, e) | 0;Bo(e, 32, K, p, I ^ 8192);n = (p | 0) < (K | 0) ? K : p;break;
                }n = (r | 0) < 0 ? 6 : r;if (o) {
                  o = (c[ea >> 2] | 0) + -28 | 0;c[ea >> 2] = o;q = v * 268435456.0;
                } else {
                  q = v;o = c[ea >> 2] | 0;
                }F = (o | 0) < 0 ? ca : Q;E = F;o = F;do {
                  B = ~~q >>> 0;c[o >> 2] = B;o = o + 4 | 0;q = (q - +(B >>> 0)) * 1.0e9;
                } while (q != 0.0);p = o;o = c[ea >> 2] | 0;if ((o | 0) > 0) {
                  s = F;while (1) {
                    t = (o | 0) > 29 ? 29 : o;r = p + -4 | 0;do if (r >>> 0 < s >>> 0) r = s;else {
                      o = 0;do {
                        B = Qo(c[r >> 2] | 0, 0, t | 0) | 0;B = Oo(B | 0, D | 0, o | 0, 0) | 0;o = D;A = _o(B | 0, o | 0, 1e9, 0) | 0;c[r >> 2] = A;o = Zo(B | 0, o | 0, 1e9, 0) | 0;r = r + -4 | 0;
                      } while (r >>> 0 >= s >>> 0);if (!o) {
                        r = s;break;
                      }r = s + -4 | 0;c[r >> 2] = o;
                    } while (0);while (1) {
                      if (p >>> 0 <= r >>> 0) break;o = p + -4 | 0;if (!(c[o >> 2] | 0)) p = o;else break;
                    }o = (c[ea >> 2] | 0) - t | 0;c[ea >> 2] = o;if ((o | 0) > 0) s = r;else break;
                  }
                } else r = F;if ((o | 0) < 0) {
                  y = ((n + 25 | 0) / 9 | 0) + 1 | 0;z = (C | 0) == 102;w = r;while (1) {
                    x = 0 - o | 0;x = (x | 0) > 9 ? 9 : x;do if (w >>> 0 < p >>> 0) {
                      o = (1 << x) + -1 | 0;s = 1e9 >>> x;r = 0;t = w;do {
                        B = c[t >> 2] | 0;c[t >> 2] = (B >>> x) + r;r = $(B & o, s) | 0;t = t + 4 | 0;
                      } while (t >>> 0 < p >>> 0);o = (c[w >> 2] | 0) == 0 ? w + 4 | 0 : w;if (!r) {
                        r = o;break;
                      }c[p >> 2] = r;r = o;p = p + 4 | 0;
                    } else r = (c[w >> 2] | 0) == 0 ? w + 4 | 0 : w; while (0);o = z ? F : r;p = (p - o >> 2 | 0) > (y | 0) ? o + (y << 2) | 0 : p;o = (c[ea >> 2] | 0) + x | 0;c[ea >> 2] = o;if ((o | 0) >= 0) {
                      w = r;break;
                    } else w = r;
                  }
                } else w = r;do if (w >>> 0 < p >>> 0) {
                  o = (E - w >> 2) * 9 | 0;s = c[w >> 2] | 0;if (s >>> 0 < 10) break;else r = 10;do {
                    r = r * 10 | 0;o = o + 1 | 0;
                  } while (s >>> 0 >= r >>> 0);
                } else o = 0; while (0);A = (C | 0) == 103;B = (n | 0) != 0;r = n - ((C | 0) != 102 ? o : 0) + ((B & A) << 31 >> 31) | 0;if ((r | 0) < (((p - E >> 2) * 9 | 0) + -9 | 0)) {
                  t = r + 9216 | 0;z = (t | 0) / 9 | 0;r = F + (z + -1023 << 2) | 0;t = ((t | 0) % 9 | 0) + 1 | 0;if ((t | 0) < 9) {
                    s = 10;do {
                      s = s * 10 | 0;t = t + 1 | 0;
                    } while ((t | 0) != 9);
                  } else s = 10;x = c[r >> 2] | 0;y = (x >>> 0) % (s >>> 0) | 0;if ((y | 0) == 0 ? (F + (z + -1022 << 2) | 0) == (p | 0) : 0) s = w;else L = 163;do if ((L | 0) == 163) {
                    L = 0;v = (((x >>> 0) / (s >>> 0) | 0) & 1 | 0) == 0 ? 9007199254740992.0 : 9007199254740994.0;t = (s | 0) / 2 | 0;do if (y >>> 0 < t >>> 0) q = .5;else {
                      if ((y | 0) == (t | 0) ? (F + (z + -1022 << 2) | 0) == (p | 0) : 0) {
                        q = 1.0;break;
                      }q = 1.5;
                    } while (0);do if (G) {
                      if ((a[H >> 0] | 0) != 45) break;v = -v;q = -q;
                    } while (0);t = x - y | 0;c[r >> 2] = t;if (!(v + q != v)) {
                      s = w;break;
                    }C = t + s | 0;c[r >> 2] = C;if (C >>> 0 > 999999999) {
                      o = w;while (1) {
                        s = r + -4 | 0;c[r >> 2] = 0;if (s >>> 0 < o >>> 0) {
                          o = o + -4 | 0;c[o >> 2] = 0;
                        }C = (c[s >> 2] | 0) + 1 | 0;c[s >> 2] = C;if (C >>> 0 > 999999999) r = s;else {
                          w = o;r = s;break;
                        }
                      }
                    }o = (E - w >> 2) * 9 | 0;t = c[w >> 2] | 0;if (t >>> 0 < 10) {
                      s = w;break;
                    } else s = 10;do {
                      s = s * 10 | 0;o = o + 1 | 0;
                    } while (t >>> 0 >= s >>> 0);s = w;
                  } while (0);C = r + 4 | 0;w = s;p = p >>> 0 > C >>> 0 ? C : p;
                }y = 0 - o | 0;while (1) {
                  if (p >>> 0 <= w >>> 0) {
                    z = 0;C = p;break;
                  }r = p + -4 | 0;if (!(c[r >> 2] | 0)) p = r;else {
                    z = 1;C = p;break;
                  }
                }do if (A) {
                  n = (B & 1 ^ 1) + n | 0;if ((n | 0) > (o | 0) & (o | 0) > -5) {
                    u = u + -1 | 0;n = n + -1 - o | 0;
                  } else {
                    u = u + -2 | 0;n = n + -1 | 0;
                  }p = I & 8;if (p) break;do if (z) {
                    p = c[C + -4 >> 2] | 0;if (!p) {
                      r = 9;break;
                    }if (!((p >>> 0) % 10 | 0)) {
                      s = 10;r = 0;
                    } else {
                      r = 0;break;
                    }do {
                      s = s * 10 | 0;r = r + 1 | 0;
                    } while (((p >>> 0) % (s >>> 0) | 0 | 0) == 0);
                  } else r = 9; while (0);p = ((C - E >> 2) * 9 | 0) + -9 | 0;if ((u | 32 | 0) == 102) {
                    p = p - r | 0;p = (p | 0) < 0 ? 0 : p;n = (n | 0) < (p | 0) ? n : p;p = 0;break;
                  } else {
                    p = p + o - r | 0;p = (p | 0) < 0 ? 0 : p;n = (n | 0) < (p | 0) ? n : p;p = 0;break;
                  }
                } else p = I & 8; while (0);x = n | p;s = (x | 0) != 0 & 1;t = (u | 32 | 0) == 102;if (t) {
                  o = (o | 0) > 0 ? o : 0;u = 0;
                } else {
                  r = (o | 0) < 0 ? y : o;r = Ao(r, ((r | 0) < 0) << 31 >> 31, X) | 0;if ((_ - r | 0) < 2) do {
                    r = r + -1 | 0;a[r >> 0] = 48;
                  } while ((_ - r | 0) < 2);a[r + -1 >> 0] = (o >> 31 & 2) + 43;E = r + -2 | 0;a[E >> 0] = u;o = _ - E | 0;u = E;
                }y = G + 1 + n + s + o | 0;Bo(e, 32, K, y, I);if (!(c[e >> 2] & 32)) ko(H, G, e) | 0;Bo(e, 48, K, y, I ^ 65536);do if (t) {
                  r = w >>> 0 > F >>> 0 ? F : w;o = r;do {
                    p = Ao(c[o >> 2] | 0, 0, R) | 0;do if ((o | 0) == (r | 0)) {
                      if ((p | 0) != (R | 0)) break;a[T >> 0] = 48;p = T;
                    } else {
                      if (p >>> 0 <= da >>> 0) break;do {
                        p = p + -1 | 0;a[p >> 0] = 48;
                      } while (p >>> 0 > da >>> 0);
                    } while (0);if (!(c[e >> 2] & 32)) ko(p, S - p | 0, e) | 0;o = o + 4 | 0;
                  } while (o >>> 0 <= F >>> 0);do if (x) {
                    if (c[e >> 2] & 32) break;ko(12525, 1, e) | 0;
                  } while (0);if ((n | 0) > 0 & o >>> 0 < C >>> 0) {
                    p = o;while (1) {
                      o = Ao(c[p >> 2] | 0, 0, R) | 0;if (o >>> 0 > da >>> 0) do {
                        o = o + -1 | 0;a[o >> 0] = 48;
                      } while (o >>> 0 > da >>> 0);if (!(c[e >> 2] & 32)) ko(o, (n | 0) > 9 ? 9 : n, e) | 0;p = p + 4 | 0;o = n + -9 | 0;if (!((n | 0) > 9 & p >>> 0 < C >>> 0)) {
                        n = o;break;
                      } else n = o;
                    }
                  }Bo(e, 48, n + 9 | 0, 9, 0);
                } else {
                  t = z ? C : w + 4 | 0;if ((n | 0) > -1) {
                    s = (p | 0) == 0;r = w;do {
                      o = Ao(c[r >> 2] | 0, 0, R) | 0;if ((o | 0) == (R | 0)) {
                        a[T >> 0] = 48;o = T;
                      }do if ((r | 0) == (w | 0)) {
                        p = o + 1 | 0;if (!(c[e >> 2] & 32)) ko(o, 1, e) | 0;if (s & (n | 0) < 1) {
                          o = p;break;
                        }if (c[e >> 2] & 32) {
                          o = p;break;
                        }ko(12525, 1, e) | 0;o = p;
                      } else {
                        if (o >>> 0 <= da >>> 0) break;do {
                          o = o + -1 | 0;a[o >> 0] = 48;
                        } while (o >>> 0 > da >>> 0);
                      } while (0);p = S - o | 0;if (!(c[e >> 2] & 32)) ko(o, (n | 0) > (p | 0) ? p : n, e) | 0;n = n - p | 0;r = r + 4 | 0;
                    } while (r >>> 0 < t >>> 0 & (n | 0) > -1);
                  }Bo(e, 48, n + 18 | 0, 18, 0);if (c[e >> 2] & 32) break;ko(u, _ - u | 0, e) | 0;
                } while (0);Bo(e, 32, K, y, I ^ 8192);n = (y | 0) < (K | 0) ? K : y;
              } else {
                t = (u & 32 | 0) != 0;s = q != q | 0.0 != 0.0;o = s ? 0 : G;r = o + 3 | 0;Bo(e, 32, K, r, p);n = c[e >> 2] | 0;if (!(n & 32)) {
                  ko(H, o, e) | 0;n = c[e >> 2] | 0;
                }if (!(n & 32)) ko(s ? t ? 12517 : 12521 : t ? 12509 : 12513, 3, e) | 0;Bo(e, 32, K, r, I ^ 8192);n = (r | 0) < (K | 0) ? K : r;
              } while (0);w = J;continue a;
            }default:
            {
              p = I;o = r;t = 0;u = 12473;n = N;
            }} while (0);g: do if ((L | 0) == 64) {
          p = ba;o = c[p >> 2] | 0;p = c[p + 4 >> 2] | 0;s = u & 32;if (!((o | 0) == 0 & (p | 0) == 0)) {
            n = N;do {
              n = n + -1 | 0;a[n >> 0] = d[12457 + (o & 15) >> 0] | s;o = Ro(o | 0, p | 0, 4) | 0;p = D;
            } while (!((o | 0) == 0 & (p | 0) == 0));L = ba;if ((t & 8 | 0) == 0 | (c[L >> 2] | 0) == 0 & (c[L + 4 >> 2] | 0) == 0) {
              o = t;t = 0;s = 12473;L = 77;
            } else {
              o = t;t = 2;s = 12473 + (u >> 4) | 0;L = 77;
            }
          } else {
            n = N;o = t;t = 0;s = 12473;L = 77;
          }
        } else if ((L | 0) == 76) {
          n = Ao(n, o, N) | 0;o = I;t = p;L = 77;
        } else if ((L | 0) == 82) {
          L = 0;I = so(n, 0, r) | 0;H = (I | 0) == 0;w = n;o = H ? r : I - n | 0;t = 0;u = 12473;n = H ? n + r | 0 : I;
        } else if ((L | 0) == 86) {
          L = 0;o = 0;n = 0;s = c[ba >> 2] | 0;while (1) {
            p = c[s >> 2] | 0;if (!p) break;n = $n(fa, p) | 0;if ((n | 0) < 0 | n >>> 0 > (r - o | 0) >>> 0) break;o = n + o | 0;if (r >>> 0 > o >>> 0) s = s + 4 | 0;else break;
          }if ((n | 0) < 0) {
            m = -1;break a;
          }Bo(e, 32, K, o, I);if (!o) {
            n = 0;L = 98;
          } else {
            p = 0;r = c[ba >> 2] | 0;while (1) {
              n = c[r >> 2] | 0;if (!n) {
                n = o;L = 98;break g;
              }n = $n(fa, n) | 0;p = n + p | 0;if ((p | 0) > (o | 0)) {
                n = o;L = 98;break g;
              }if (!(c[e >> 2] & 32)) ko(fa, n, e) | 0;if (p >>> 0 >= o >>> 0) {
                n = o;L = 98;break;
              } else r = r + 4 | 0;
            }
          }
        } while (0);if ((L | 0) == 98) {
          L = 0;Bo(e, 32, K, n, I ^ 8192);w = J;n = (K | 0) > (n | 0) ? K : n;continue;
        }if ((L | 0) == 77) {
          L = 0;p = (r | 0) > -1 ? o & -65537 : o;o = ba;o = (c[o >> 2] | 0) != 0 | (c[o + 4 >> 2] | 0) != 0;if ((r | 0) != 0 | o) {
            o = (o & 1 ^ 1) + (U - n) | 0;w = n;o = (r | 0) > (o | 0) ? r : o;u = s;n = N;
          } else {
            w = N;o = 0;u = s;n = N;
          }
        }s = n - w | 0;o = (o | 0) < (s | 0) ? s : o;r = t + o | 0;n = (K | 0) < (r | 0) ? r : K;Bo(e, 32, n, r, p);if (!(c[e >> 2] & 32)) ko(u, t, e) | 0;Bo(e, 48, n, r, p ^ 65536);Bo(e, 48, o, s, 0);if (!(c[e >> 2] & 32)) ko(w, s, e) | 0;Bo(e, 32, n, r, p ^ 8192);w = J;
      }h: do if ((L | 0) == 245) if (!e) if (f) {
        m = 1;while (1) {
          f = c[l + (m << 2) >> 2] | 0;if (!f) break;zo(j + (m << 3) | 0, f, g);m = m + 1 | 0;if ((m | 0) >= 10) {
            m = 1;break h;
          }
        }if ((m | 0) < 10) while (1) {
          if (c[l + (m << 2) >> 2] | 0) {
            m = -1;break h;
          }m = m + 1 | 0;if ((m | 0) >= 10) {
            m = 1;break;
          }
        } else m = 1;
      } else m = 0; while (0);i = ha;return m | 0;
    }function yo(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0;e = a + 20 | 0;f = c[e >> 2] | 0;a = (c[a + 16 >> 2] | 0) - f | 0;a = a >>> 0 > d >>> 0 ? d : a;So(f | 0, b | 0, a | 0) | 0;c[e >> 2] = (c[e >> 2] | 0) + a;return d | 0;
    }function zo(a, b, d) {
      a = a | 0;b = b | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0.0;a: do if (b >>> 0 <= 20) do switch (b | 0) {case 9:
          {
            e = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);b = c[e >> 2] | 0;c[d >> 2] = e + 4;c[a >> 2] = b;break a;
          }case 10:
          {
            e = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);b = c[e >> 2] | 0;c[d >> 2] = e + 4;e = a;c[e >> 2] = b;c[e + 4 >> 2] = ((b | 0) < 0) << 31 >> 31;break a;
          }case 11:
          {
            e = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);b = c[e >> 2] | 0;c[d >> 2] = e + 4;e = a;c[e >> 2] = b;c[e + 4 >> 2] = 0;break a;
          }case 12:
          {
            e = (c[d >> 2] | 0) + (8 - 1) & ~(8 - 1);b = e;f = c[b >> 2] | 0;b = c[b + 4 >> 2] | 0;c[d >> 2] = e + 8;e = a;c[e >> 2] = f;c[e + 4 >> 2] = b;break a;
          }case 13:
          {
            f = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);e = c[f >> 2] | 0;c[d >> 2] = f + 4;e = (e & 65535) << 16 >> 16;f = a;c[f >> 2] = e;c[f + 4 >> 2] = ((e | 0) < 0) << 31 >> 31;break a;
          }case 14:
          {
            f = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);e = c[f >> 2] | 0;c[d >> 2] = f + 4;f = a;c[f >> 2] = e & 65535;c[f + 4 >> 2] = 0;break a;
          }case 15:
          {
            f = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);e = c[f >> 2] | 0;c[d >> 2] = f + 4;e = (e & 255) << 24 >> 24;f = a;c[f >> 2] = e;c[f + 4 >> 2] = ((e | 0) < 0) << 31 >> 31;break a;
          }case 16:
          {
            f = (c[d >> 2] | 0) + (4 - 1) & ~(4 - 1);e = c[f >> 2] | 0;c[d >> 2] = f + 4;f = a;c[f >> 2] = e & 255;c[f + 4 >> 2] = 0;break a;
          }case 17:
          {
            f = (c[d >> 2] | 0) + (8 - 1) & ~(8 - 1);g = +h[f >> 3];c[d >> 2] = f + 8;h[a >> 3] = g;break a;
          }case 18:
          {
            f = (c[d >> 2] | 0) + (8 - 1) & ~(8 - 1);g = +h[f >> 3];c[d >> 2] = f + 8;h[a >> 3] = g;break a;
          }default:
          break a;} while (0); while (0);return;
    }function Ao(b, c, d) {
      b = b | 0;c = c | 0;d = d | 0;var e = 0;if (c >>> 0 > 0 | (c | 0) == 0 & b >>> 0 > 4294967295) while (1) {
        e = _o(b | 0, c | 0, 10, 0) | 0;d = d + -1 | 0;a[d >> 0] = e | 48;e = Zo(b | 0, c | 0, 10, 0) | 0;if (c >>> 0 > 9 | (c | 0) == 9 & b >>> 0 > 4294967295) {
          b = e;c = D;
        } else {
          b = e;break;
        }
      }if (b) while (1) {
        d = d + -1 | 0;a[d >> 0] = (b >>> 0) % 10 | 0 | 48;if (b >>> 0 < 10) break;else b = (b >>> 0) / 10 | 0;
      }return d | 0;
    }function Bo(a, b, d, e, f) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          j = 0;j = i;i = i + 256 | 0;h = j;do if ((d | 0) > (e | 0) & (f & 73728 | 0) == 0) {
        f = d - e | 0;Po(h | 0, b | 0, (f >>> 0 > 256 ? 256 : f) | 0) | 0;b = c[a >> 2] | 0;g = (b & 32 | 0) == 0;if (f >>> 0 > 255) {
          e = d - e | 0;do {
            if (g) {
              ko(h, 256, a) | 0;b = c[a >> 2] | 0;
            }f = f + -256 | 0;g = (b & 32 | 0) == 0;
          } while (f >>> 0 > 255);if (g) f = e & 255;else break;
        } else if (!g) break;ko(h, f, a) | 0;
      } while (0);i = j;return;
    }function Co(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0,
          t = 0,
          u = 0,
          v = 0,
          w = 0,
          x = 0,
          y = 0,
          z = 0,
          A = 0,
          B = 0,
          C = 0,
          D = 0,
          E = 0,
          F = 0,
          G = 0,
          H = 0,
          I = 0,
          J = 0,
          K = 0,
          L = 0,
          M = 0;do if (a >>> 0 < 245) {
        o = a >>> 0 < 11 ? 16 : a + 11 & -8;a = o >>> 3;i = c[1266] | 0;d = i >>> a;if (d & 3) {
          a = (d & 1 ^ 1) + a | 0;e = a << 1;d = 5104 + (e << 2) | 0;e = 5104 + (e + 2 << 2) | 0;f = c[e >> 2] | 0;g = f + 8 | 0;h = c[g >> 2] | 0;do if ((d | 0) != (h | 0)) {
            if (h >>> 0 < (c[1270] | 0) >>> 0) fb();b = h + 12 | 0;if ((c[b >> 2] | 0) == (f | 0)) {
              c[b >> 2] = d;c[e >> 2] = h;break;
            } else fb();
          } else c[1266] = i & ~(1 << a); while (0);M = a << 3;c[f + 4 >> 2] = M | 3;M = f + (M | 4) | 0;c[M >> 2] = c[M >> 2] | 1;M = g;return M | 0;
        }h = c[1268] | 0;if (o >>> 0 > h >>> 0) {
          if (d) {
            e = 2 << a;e = d << a & (e | 0 - e);e = (e & 0 - e) + -1 | 0;j = e >>> 12 & 16;e = e >>> j;f = e >>> 5 & 8;e = e >>> f;g = e >>> 2 & 4;e = e >>> g;d = e >>> 1 & 2;e = e >>> d;a = e >>> 1 & 1;a = (f | j | g | d | a) + (e >>> a) | 0;e = a << 1;d = 5104 + (e << 2) | 0;e = 5104 + (e + 2 << 2) | 0;g = c[e >> 2] | 0;j = g + 8 | 0;f = c[j >> 2] | 0;do if ((d | 0) != (f | 0)) {
              if (f >>> 0 < (c[1270] | 0) >>> 0) fb();b = f + 12 | 0;if ((c[b >> 2] | 0) == (g | 0)) {
                c[b >> 2] = d;c[e >> 2] = f;k = c[1268] | 0;break;
              } else fb();
            } else {
              c[1266] = i & ~(1 << a);k = h;
            } while (0);M = a << 3;h = M - o | 0;c[g + 4 >> 2] = o | 3;i = g + o | 0;c[g + (o | 4) >> 2] = h | 1;c[g + M >> 2] = h;if (k) {
              f = c[1271] | 0;d = k >>> 3;b = d << 1;e = 5104 + (b << 2) | 0;a = c[1266] | 0;d = 1 << d;if (a & d) {
                a = 5104 + (b + 2 << 2) | 0;b = c[a >> 2] | 0;if (b >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                  l = a;m = b;
                }
              } else {
                c[1266] = a | d;l = 5104 + (b + 2 << 2) | 0;m = e;
              }c[l >> 2] = f;c[m + 12 >> 2] = f;c[f + 8 >> 2] = m;c[f + 12 >> 2] = e;
            }c[1268] = h;c[1271] = i;M = j;return M | 0;
          }a = c[1267] | 0;if (a) {
            d = (a & 0 - a) + -1 | 0;L = d >>> 12 & 16;d = d >>> L;K = d >>> 5 & 8;d = d >>> K;M = d >>> 2 & 4;d = d >>> M;a = d >>> 1 & 2;d = d >>> a;e = d >>> 1 & 1;e = c[5368 + ((K | L | M | a | e) + (d >>> e) << 2) >> 2] | 0;d = (c[e + 4 >> 2] & -8) - o | 0;a = e;while (1) {
              b = c[a + 16 >> 2] | 0;if (!b) {
                b = c[a + 20 >> 2] | 0;if (!b) {
                  j = d;break;
                }
              }a = (c[b + 4 >> 2] & -8) - o | 0;M = a >>> 0 < d >>> 0;d = M ? a : d;a = b;e = M ? b : e;
            }g = c[1270] | 0;if (e >>> 0 < g >>> 0) fb();i = e + o | 0;if (e >>> 0 >= i >>> 0) fb();h = c[e + 24 >> 2] | 0;d = c[e + 12 >> 2] | 0;do if ((d | 0) == (e | 0)) {
              a = e + 20 | 0;b = c[a >> 2] | 0;if (!b) {
                a = e + 16 | 0;b = c[a >> 2] | 0;if (!b) {
                  n = 0;break;
                }
              }while (1) {
                d = b + 20 | 0;f = c[d >> 2] | 0;if (f) {
                  b = f;a = d;continue;
                }d = b + 16 | 0;f = c[d >> 2] | 0;if (!f) break;else {
                  b = f;a = d;
                }
              }if (a >>> 0 < g >>> 0) fb();else {
                c[a >> 2] = 0;n = b;break;
              }
            } else {
              f = c[e + 8 >> 2] | 0;if (f >>> 0 < g >>> 0) fb();b = f + 12 | 0;if ((c[b >> 2] | 0) != (e | 0)) fb();a = d + 8 | 0;if ((c[a >> 2] | 0) == (e | 0)) {
                c[b >> 2] = d;c[a >> 2] = f;n = d;break;
              } else fb();
            } while (0);do if (h) {
              b = c[e + 28 >> 2] | 0;a = 5368 + (b << 2) | 0;if ((e | 0) == (c[a >> 2] | 0)) {
                c[a >> 2] = n;if (!n) {
                  c[1267] = c[1267] & ~(1 << b);break;
                }
              } else {
                if (h >>> 0 < (c[1270] | 0) >>> 0) fb();b = h + 16 | 0;if ((c[b >> 2] | 0) == (e | 0)) c[b >> 2] = n;else c[h + 20 >> 2] = n;if (!n) break;
              }a = c[1270] | 0;if (n >>> 0 < a >>> 0) fb();c[n + 24 >> 2] = h;b = c[e + 16 >> 2] | 0;do if (b) if (b >>> 0 < a >>> 0) fb();else {
                c[n + 16 >> 2] = b;c[b + 24 >> 2] = n;break;
              } while (0);b = c[e + 20 >> 2] | 0;if (b) if (b >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                c[n + 20 >> 2] = b;c[b + 24 >> 2] = n;break;
              }
            } while (0);if (j >>> 0 < 16) {
              M = j + o | 0;c[e + 4 >> 2] = M | 3;M = e + (M + 4) | 0;c[M >> 2] = c[M >> 2] | 1;
            } else {
              c[e + 4 >> 2] = o | 3;c[e + (o | 4) >> 2] = j | 1;c[e + (j + o) >> 2] = j;b = c[1268] | 0;if (b) {
                g = c[1271] | 0;d = b >>> 3;b = d << 1;f = 5104 + (b << 2) | 0;a = c[1266] | 0;d = 1 << d;if (a & d) {
                  b = 5104 + (b + 2 << 2) | 0;a = c[b >> 2] | 0;if (a >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                    p = b;q = a;
                  }
                } else {
                  c[1266] = a | d;p = 5104 + (b + 2 << 2) | 0;q = f;
                }c[p >> 2] = g;c[q + 12 >> 2] = g;c[g + 8 >> 2] = q;c[g + 12 >> 2] = f;
              }c[1268] = j;c[1271] = i;
            }M = e + 8 | 0;return M | 0;
          } else q = o;
        } else q = o;
      } else if (a >>> 0 <= 4294967231) {
        a = a + 11 | 0;m = a & -8;l = c[1267] | 0;if (l) {
          d = 0 - m | 0;a = a >>> 8;if (a) {
            if (m >>> 0 > 16777215) k = 31;else {
              q = (a + 1048320 | 0) >>> 16 & 8;v = a << q;p = (v + 520192 | 0) >>> 16 & 4;v = v << p;k = (v + 245760 | 0) >>> 16 & 2;k = 14 - (p | q | k) + (v << k >>> 15) | 0;k = m >>> (k + 7 | 0) & 1 | k << 1;
            }
          } else k = 0;a = c[5368 + (k << 2) >> 2] | 0;a: do if (!a) {
            f = 0;a = 0;v = 86;
          } else {
            h = d;f = 0;i = m << ((k | 0) == 31 ? 0 : 25 - (k >>> 1) | 0);j = a;a = 0;while (1) {
              g = c[j + 4 >> 2] & -8;d = g - m | 0;if (d >>> 0 < h >>> 0) {
                if ((g | 0) == (m | 0)) {
                  g = j;a = j;v = 90;break a;
                } else a = j;
              } else d = h;v = c[j + 20 >> 2] | 0;j = c[j + 16 + (i >>> 31 << 2) >> 2] | 0;f = (v | 0) == 0 | (v | 0) == (j | 0) ? f : v;if (!j) {
                v = 86;break;
              } else {
                h = d;i = i << 1;
              }
            }
          } while (0);if ((v | 0) == 86) {
            if ((f | 0) == 0 & (a | 0) == 0) {
              a = 2 << k;a = l & (a | 0 - a);if (!a) {
                q = m;break;
              }a = (a & 0 - a) + -1 | 0;n = a >>> 12 & 16;a = a >>> n;l = a >>> 5 & 8;a = a >>> l;p = a >>> 2 & 4;a = a >>> p;q = a >>> 1 & 2;a = a >>> q;f = a >>> 1 & 1;f = c[5368 + ((l | n | p | q | f) + (a >>> f) << 2) >> 2] | 0;a = 0;
            }if (!f) {
              i = d;j = a;
            } else {
              g = f;v = 90;
            }
          }if ((v | 0) == 90) while (1) {
            v = 0;q = (c[g + 4 >> 2] & -8) - m | 0;f = q >>> 0 < d >>> 0;d = f ? q : d;a = f ? g : a;f = c[g + 16 >> 2] | 0;if (f) {
              g = f;v = 90;continue;
            }g = c[g + 20 >> 2] | 0;if (!g) {
              i = d;j = a;break;
            } else v = 90;
          }if ((j | 0) != 0 ? i >>> 0 < ((c[1268] | 0) - m | 0) >>> 0 : 0) {
            f = c[1270] | 0;if (j >>> 0 < f >>> 0) fb();h = j + m | 0;if (j >>> 0 >= h >>> 0) fb();g = c[j + 24 >> 2] | 0;d = c[j + 12 >> 2] | 0;do if ((d | 0) == (j | 0)) {
              a = j + 20 | 0;b = c[a >> 2] | 0;if (!b) {
                a = j + 16 | 0;b = c[a >> 2] | 0;if (!b) {
                  o = 0;break;
                }
              }while (1) {
                d = b + 20 | 0;e = c[d >> 2] | 0;if (e) {
                  b = e;a = d;continue;
                }d = b + 16 | 0;e = c[d >> 2] | 0;if (!e) break;else {
                  b = e;a = d;
                }
              }if (a >>> 0 < f >>> 0) fb();else {
                c[a >> 2] = 0;o = b;break;
              }
            } else {
              e = c[j + 8 >> 2] | 0;if (e >>> 0 < f >>> 0) fb();b = e + 12 | 0;if ((c[b >> 2] | 0) != (j | 0)) fb();a = d + 8 | 0;if ((c[a >> 2] | 0) == (j | 0)) {
                c[b >> 2] = d;c[a >> 2] = e;o = d;break;
              } else fb();
            } while (0);do if (g) {
              b = c[j + 28 >> 2] | 0;a = 5368 + (b << 2) | 0;if ((j | 0) == (c[a >> 2] | 0)) {
                c[a >> 2] = o;if (!o) {
                  c[1267] = c[1267] & ~(1 << b);break;
                }
              } else {
                if (g >>> 0 < (c[1270] | 0) >>> 0) fb();b = g + 16 | 0;if ((c[b >> 2] | 0) == (j | 0)) c[b >> 2] = o;else c[g + 20 >> 2] = o;if (!o) break;
              }a = c[1270] | 0;if (o >>> 0 < a >>> 0) fb();c[o + 24 >> 2] = g;b = c[j + 16 >> 2] | 0;do if (b) if (b >>> 0 < a >>> 0) fb();else {
                c[o + 16 >> 2] = b;c[b + 24 >> 2] = o;break;
              } while (0);b = c[j + 20 >> 2] | 0;if (b) if (b >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                c[o + 20 >> 2] = b;c[b + 24 >> 2] = o;break;
              }
            } while (0);b: do if (i >>> 0 >= 16) {
              c[j + 4 >> 2] = m | 3;c[j + (m | 4) >> 2] = i | 1;c[j + (i + m) >> 2] = i;b = i >>> 3;if (i >>> 0 < 256) {
                a = b << 1;e = 5104 + (a << 2) | 0;d = c[1266] | 0;b = 1 << b;if (d & b) {
                  b = 5104 + (a + 2 << 2) | 0;a = c[b >> 2] | 0;if (a >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                    s = b;t = a;
                  }
                } else {
                  c[1266] = d | b;s = 5104 + (a + 2 << 2) | 0;t = e;
                }c[s >> 2] = h;c[t + 12 >> 2] = h;c[j + (m + 8) >> 2] = t;c[j + (m + 12) >> 2] = e;break;
              }b = i >>> 8;if (b) {
                if (i >>> 0 > 16777215) e = 31;else {
                  L = (b + 1048320 | 0) >>> 16 & 8;M = b << L;K = (M + 520192 | 0) >>> 16 & 4;M = M << K;e = (M + 245760 | 0) >>> 16 & 2;e = 14 - (K | L | e) + (M << e >>> 15) | 0;e = i >>> (e + 7 | 0) & 1 | e << 1;
                }
              } else e = 0;b = 5368 + (e << 2) | 0;c[j + (m + 28) >> 2] = e;c[j + (m + 20) >> 2] = 0;c[j + (m + 16) >> 2] = 0;a = c[1267] | 0;d = 1 << e;if (!(a & d)) {
                c[1267] = a | d;c[b >> 2] = h;c[j + (m + 24) >> 2] = b;c[j + (m + 12) >> 2] = h;c[j + (m + 8) >> 2] = h;break;
              }b = c[b >> 2] | 0;c: do if ((c[b + 4 >> 2] & -8 | 0) != (i | 0)) {
                e = i << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);while (1) {
                  a = b + 16 + (e >>> 31 << 2) | 0;d = c[a >> 2] | 0;if (!d) break;if ((c[d + 4 >> 2] & -8 | 0) == (i | 0)) {
                    y = d;break c;
                  } else {
                    e = e << 1;b = d;
                  }
                }if (a >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                  c[a >> 2] = h;c[j + (m + 24) >> 2] = b;c[j + (m + 12) >> 2] = h;c[j + (m + 8) >> 2] = h;break b;
                }
              } else y = b; while (0);b = y + 8 | 0;a = c[b >> 2] | 0;M = c[1270] | 0;if (a >>> 0 >= M >>> 0 & y >>> 0 >= M >>> 0) {
                c[a + 12 >> 2] = h;c[b >> 2] = h;c[j + (m + 8) >> 2] = a;c[j + (m + 12) >> 2] = y;c[j + (m + 24) >> 2] = 0;break;
              } else fb();
            } else {
              M = i + m | 0;c[j + 4 >> 2] = M | 3;M = j + (M + 4) | 0;c[M >> 2] = c[M >> 2] | 1;
            } while (0);M = j + 8 | 0;return M | 0;
          } else q = m;
        } else q = m;
      } else q = -1; while (0);d = c[1268] | 0;if (d >>> 0 >= q >>> 0) {
        b = d - q | 0;a = c[1271] | 0;if (b >>> 0 > 15) {
          c[1271] = a + q;c[1268] = b;c[a + (q + 4) >> 2] = b | 1;c[a + d >> 2] = b;c[a + 4 >> 2] = q | 3;
        } else {
          c[1268] = 0;c[1271] = 0;c[a + 4 >> 2] = d | 3;M = a + (d + 4) | 0;c[M >> 2] = c[M >> 2] | 1;
        }M = a + 8 | 0;return M | 0;
      }a = c[1269] | 0;if (a >>> 0 > q >>> 0) {
        L = a - q | 0;c[1269] = L;M = c[1272] | 0;c[1272] = M + q;c[M + (q + 4) >> 2] = L | 1;c[M + 4 >> 2] = q | 3;M = M + 8 | 0;return M | 0;
      }do if (!(c[1384] | 0)) {
        a = cb(30) | 0;if (!(a + -1 & a)) {
          c[1386] = a;c[1385] = a;c[1387] = -1;c[1388] = -1;c[1389] = 0;c[1377] = 0;c[1384] = (xb(0) | 0) & -16 ^ 1431655768;break;
        } else fb();
      } while (0);j = q + 48 | 0;i = c[1386] | 0;k = q + 47 | 0;h = i + k | 0;i = 0 - i | 0;l = h & i;if (l >>> 0 <= q >>> 0) {
        M = 0;return M | 0;
      }a = c[1376] | 0;if ((a | 0) != 0 ? (t = c[1374] | 0, y = t + l | 0, y >>> 0 <= t >>> 0 | y >>> 0 > a >>> 0) : 0) {
        M = 0;return M | 0;
      }d: do if (!(c[1377] & 4)) {
        a = c[1272] | 0;e: do if (a) {
          f = 5512;while (1) {
            d = c[f >> 2] | 0;if (d >>> 0 <= a >>> 0 ? (r = f + 4 | 0, (d + (c[r >> 2] | 0) | 0) >>> 0 > a >>> 0) : 0) {
              g = f;a = r;break;
            }f = c[f + 8 >> 2] | 0;if (!f) {
              v = 174;break e;
            }
          }d = h - (c[1269] | 0) & i;if (d >>> 0 < 2147483647) {
            f = Wa(d | 0) | 0;y = (f | 0) == ((c[g >> 2] | 0) + (c[a >> 2] | 0) | 0);a = y ? d : 0;if (y) {
              if ((f | 0) != (-1 | 0)) {
                w = f;p = a;v = 194;break d;
              }
            } else v = 184;
          } else a = 0;
        } else v = 174; while (0);do if ((v | 0) == 174) {
          g = Wa(0) | 0;if ((g | 0) != (-1 | 0)) {
            a = g;d = c[1385] | 0;f = d + -1 | 0;if (!(f & a)) d = l;else d = l - a + (f + a & 0 - d) | 0;a = c[1374] | 0;f = a + d | 0;if (d >>> 0 > q >>> 0 & d >>> 0 < 2147483647) {
              y = c[1376] | 0;if ((y | 0) != 0 ? f >>> 0 <= a >>> 0 | f >>> 0 > y >>> 0 : 0) {
                a = 0;break;
              }f = Wa(d | 0) | 0;y = (f | 0) == (g | 0);a = y ? d : 0;if (y) {
                w = g;p = a;v = 194;break d;
              } else v = 184;
            } else a = 0;
          } else a = 0;
        } while (0);f: do if ((v | 0) == 184) {
          g = 0 - d | 0;do if (j >>> 0 > d >>> 0 & (d >>> 0 < 2147483647 & (f | 0) != (-1 | 0)) ? (u = c[1386] | 0, u = k - d + u & 0 - u, u >>> 0 < 2147483647) : 0) if ((Wa(u | 0) | 0) == (-1 | 0)) {
            Wa(g | 0) | 0;break f;
          } else {
            d = u + d | 0;break;
          } while (0);if ((f | 0) != (-1 | 0)) {
            w = f;p = d;v = 194;break d;
          }
        } while (0);c[1377] = c[1377] | 4;v = 191;
      } else {
        a = 0;v = 191;
      } while (0);if ((((v | 0) == 191 ? l >>> 0 < 2147483647 : 0) ? (w = Wa(l | 0) | 0, x = Wa(0) | 0, w >>> 0 < x >>> 0 & ((w | 0) != (-1 | 0) & (x | 0) != (-1 | 0))) : 0) ? (z = x - w | 0, A = z >>> 0 > (q + 40 | 0) >>> 0, A) : 0) {
        p = A ? z : a;v = 194;
      }if ((v | 0) == 194) {
        a = (c[1374] | 0) + p | 0;c[1374] = a;if (a >>> 0 > (c[1375] | 0) >>> 0) c[1375] = a;h = c[1272] | 0;g: do if (h) {
          g = 5512;do {
            a = c[g >> 2] | 0;d = g + 4 | 0;f = c[d >> 2] | 0;if ((w | 0) == (a + f | 0)) {
              B = a;C = d;D = f;E = g;v = 204;break;
            }g = c[g + 8 >> 2] | 0;
          } while ((g | 0) != 0);if (((v | 0) == 204 ? (c[E + 12 >> 2] & 8 | 0) == 0 : 0) ? h >>> 0 < w >>> 0 & h >>> 0 >= B >>> 0 : 0) {
            c[C >> 2] = D + p;M = (c[1269] | 0) + p | 0;L = h + 8 | 0;L = (L & 7 | 0) == 0 ? 0 : 0 - L & 7;K = M - L | 0;c[1272] = h + L;c[1269] = K;c[h + (L + 4) >> 2] = K | 1;c[h + (M + 4) >> 2] = 40;c[1273] = c[1388];break;
          }a = c[1270] | 0;if (w >>> 0 < a >>> 0) {
            c[1270] = w;a = w;
          }d = w + p | 0;g = 5512;while (1) {
            if ((c[g >> 2] | 0) == (d | 0)) {
              f = g;d = g;v = 212;break;
            }g = c[g + 8 >> 2] | 0;if (!g) {
              d = 5512;break;
            }
          }if ((v | 0) == 212) if (!(c[d + 12 >> 2] & 8)) {
            c[f >> 2] = w;n = d + 4 | 0;c[n >> 2] = (c[n >> 2] | 0) + p;n = w + 8 | 0;n = (n & 7 | 0) == 0 ? 0 : 0 - n & 7;k = w + (p + 8) | 0;k = (k & 7 | 0) == 0 ? 0 : 0 - k & 7;b = w + (k + p) | 0;m = n + q | 0;o = w + m | 0;l = b - (w + n) - q | 0;c[w + (n + 4) >> 2] = q | 3;h: do if ((b | 0) != (h | 0)) {
              if ((b | 0) == (c[1271] | 0)) {
                M = (c[1268] | 0) + l | 0;c[1268] = M;c[1271] = o;c[w + (m + 4) >> 2] = M | 1;c[w + (M + m) >> 2] = M;break;
              }i = p + 4 | 0;d = c[w + (i + k) >> 2] | 0;if ((d & 3 | 0) == 1) {
                j = d & -8;g = d >>> 3;i: do if (d >>> 0 >= 256) {
                  h = c[w + ((k | 24) + p) >> 2] | 0;e = c[w + (p + 12 + k) >> 2] | 0;do if ((e | 0) == (b | 0)) {
                    f = k | 16;e = w + (i + f) | 0;d = c[e >> 2] | 0;if (!d) {
                      e = w + (f + p) | 0;d = c[e >> 2] | 0;if (!d) {
                        J = 0;break;
                      }
                    }while (1) {
                      f = d + 20 | 0;g = c[f >> 2] | 0;if (g) {
                        d = g;e = f;continue;
                      }f = d + 16 | 0;g = c[f >> 2] | 0;if (!g) break;else {
                        d = g;e = f;
                      }
                    }if (e >>> 0 < a >>> 0) fb();else {
                      c[e >> 2] = 0;J = d;break;
                    }
                  } else {
                    f = c[w + ((k | 8) + p) >> 2] | 0;if (f >>> 0 < a >>> 0) fb();a = f + 12 | 0;if ((c[a >> 2] | 0) != (b | 0)) fb();d = e + 8 | 0;if ((c[d >> 2] | 0) == (b | 0)) {
                      c[a >> 2] = e;c[d >> 2] = f;J = e;break;
                    } else fb();
                  } while (0);if (!h) break;a = c[w + (p + 28 + k) >> 2] | 0;d = 5368 + (a << 2) | 0;do if ((b | 0) != (c[d >> 2] | 0)) {
                    if (h >>> 0 < (c[1270] | 0) >>> 0) fb();a = h + 16 | 0;if ((c[a >> 2] | 0) == (b | 0)) c[a >> 2] = J;else c[h + 20 >> 2] = J;if (!J) break i;
                  } else {
                    c[d >> 2] = J;if (J) break;c[1267] = c[1267] & ~(1 << a);break i;
                  } while (0);d = c[1270] | 0;if (J >>> 0 < d >>> 0) fb();c[J + 24 >> 2] = h;b = k | 16;a = c[w + (b + p) >> 2] | 0;do if (a) if (a >>> 0 < d >>> 0) fb();else {
                    c[J + 16 >> 2] = a;c[a + 24 >> 2] = J;break;
                  } while (0);b = c[w + (i + b) >> 2] | 0;if (!b) break;if (b >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                    c[J + 20 >> 2] = b;c[b + 24 >> 2] = J;break;
                  }
                } else {
                  e = c[w + ((k | 8) + p) >> 2] | 0;f = c[w + (p + 12 + k) >> 2] | 0;d = 5104 + (g << 1 << 2) | 0;do if ((e | 0) != (d | 0)) {
                    if (e >>> 0 < a >>> 0) fb();if ((c[e + 12 >> 2] | 0) == (b | 0)) break;fb();
                  } while (0);if ((f | 0) == (e | 0)) {
                    c[1266] = c[1266] & ~(1 << g);break;
                  }do if ((f | 0) == (d | 0)) F = f + 8 | 0;else {
                    if (f >>> 0 < a >>> 0) fb();a = f + 8 | 0;if ((c[a >> 2] | 0) == (b | 0)) {
                      F = a;break;
                    }fb();
                  } while (0);c[e + 12 >> 2] = f;c[F >> 2] = e;
                } while (0);b = w + ((j | k) + p) | 0;f = j + l | 0;
              } else f = l;b = b + 4 | 0;c[b >> 2] = c[b >> 2] & -2;c[w + (m + 4) >> 2] = f | 1;c[w + (f + m) >> 2] = f;b = f >>> 3;if (f >>> 0 < 256) {
                a = b << 1;e = 5104 + (a << 2) | 0;d = c[1266] | 0;b = 1 << b;do if (!(d & b)) {
                  c[1266] = d | b;K = 5104 + (a + 2 << 2) | 0;L = e;
                } else {
                  b = 5104 + (a + 2 << 2) | 0;a = c[b >> 2] | 0;if (a >>> 0 >= (c[1270] | 0) >>> 0) {
                    K = b;L = a;break;
                  }fb();
                } while (0);c[K >> 2] = o;c[L + 12 >> 2] = o;c[w + (m + 8) >> 2] = L;c[w + (m + 12) >> 2] = e;break;
              }b = f >>> 8;do if (!b) e = 0;else {
                if (f >>> 0 > 16777215) {
                  e = 31;break;
                }K = (b + 1048320 | 0) >>> 16 & 8;L = b << K;J = (L + 520192 | 0) >>> 16 & 4;L = L << J;e = (L + 245760 | 0) >>> 16 & 2;e = 14 - (J | K | e) + (L << e >>> 15) | 0;e = f >>> (e + 7 | 0) & 1 | e << 1;
              } while (0);b = 5368 + (e << 2) | 0;c[w + (m + 28) >> 2] = e;c[w + (m + 20) >> 2] = 0;c[w + (m + 16) >> 2] = 0;a = c[1267] | 0;d = 1 << e;if (!(a & d)) {
                c[1267] = a | d;c[b >> 2] = o;c[w + (m + 24) >> 2] = b;c[w + (m + 12) >> 2] = o;c[w + (m + 8) >> 2] = o;break;
              }b = c[b >> 2] | 0;j: do if ((c[b + 4 >> 2] & -8 | 0) != (f | 0)) {
                e = f << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);while (1) {
                  a = b + 16 + (e >>> 31 << 2) | 0;d = c[a >> 2] | 0;if (!d) break;if ((c[d + 4 >> 2] & -8 | 0) == (f | 0)) {
                    M = d;break j;
                  } else {
                    e = e << 1;b = d;
                  }
                }if (a >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                  c[a >> 2] = o;c[w + (m + 24) >> 2] = b;c[w + (m + 12) >> 2] = o;c[w + (m + 8) >> 2] = o;break h;
                }
              } else M = b; while (0);b = M + 8 | 0;a = c[b >> 2] | 0;L = c[1270] | 0;if (a >>> 0 >= L >>> 0 & M >>> 0 >= L >>> 0) {
                c[a + 12 >> 2] = o;c[b >> 2] = o;c[w + (m + 8) >> 2] = a;c[w + (m + 12) >> 2] = M;c[w + (m + 24) >> 2] = 0;break;
              } else fb();
            } else {
              M = (c[1269] | 0) + l | 0;c[1269] = M;c[1272] = o;c[w + (m + 4) >> 2] = M | 1;
            } while (0);M = w + (n | 8) | 0;return M | 0;
          } else d = 5512;while (1) {
            a = c[d >> 2] | 0;if (a >>> 0 <= h >>> 0 ? (b = c[d + 4 >> 2] | 0, e = a + b | 0, e >>> 0 > h >>> 0) : 0) break;d = c[d + 8 >> 2] | 0;
          }f = a + (b + -39) | 0;a = a + (b + -47 + ((f & 7 | 0) == 0 ? 0 : 0 - f & 7)) | 0;f = h + 16 | 0;a = a >>> 0 < f >>> 0 ? h : a;b = a + 8 | 0;d = w + 8 | 0;d = (d & 7 | 0) == 0 ? 0 : 0 - d & 7;M = p + -40 - d | 0;c[1272] = w + d;c[1269] = M;c[w + (d + 4) >> 2] = M | 1;c[w + (p + -36) >> 2] = 40;c[1273] = c[1388];d = a + 4 | 0;c[d >> 2] = 27;c[b >> 2] = c[1378];c[b + 4 >> 2] = c[1379];c[b + 8 >> 2] = c[1380];c[b + 12 >> 2] = c[1381];c[1378] = w;c[1379] = p;c[1381] = 0;c[1380] = b;b = a + 28 | 0;c[b >> 2] = 7;if ((a + 32 | 0) >>> 0 < e >>> 0) do {
            M = b;b = b + 4 | 0;c[b >> 2] = 7;
          } while ((M + 8 | 0) >>> 0 < e >>> 0);if ((a | 0) != (h | 0)) {
            g = a - h | 0;c[d >> 2] = c[d >> 2] & -2;c[h + 4 >> 2] = g | 1;c[a >> 2] = g;b = g >>> 3;if (g >>> 0 < 256) {
              a = b << 1;e = 5104 + (a << 2) | 0;d = c[1266] | 0;b = 1 << b;if (d & b) {
                b = 5104 + (a + 2 << 2) | 0;a = c[b >> 2] | 0;if (a >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                  G = b;H = a;
                }
              } else {
                c[1266] = d | b;G = 5104 + (a + 2 << 2) | 0;H = e;
              }c[G >> 2] = h;c[H + 12 >> 2] = h;c[h + 8 >> 2] = H;c[h + 12 >> 2] = e;break;
            }b = g >>> 8;if (b) {
              if (g >>> 0 > 16777215) e = 31;else {
                L = (b + 1048320 | 0) >>> 16 & 8;M = b << L;K = (M + 520192 | 0) >>> 16 & 4;M = M << K;e = (M + 245760 | 0) >>> 16 & 2;e = 14 - (K | L | e) + (M << e >>> 15) | 0;e = g >>> (e + 7 | 0) & 1 | e << 1;
              }
            } else e = 0;d = 5368 + (e << 2) | 0;c[h + 28 >> 2] = e;c[h + 20 >> 2] = 0;c[f >> 2] = 0;b = c[1267] | 0;a = 1 << e;if (!(b & a)) {
              c[1267] = b | a;c[d >> 2] = h;c[h + 24 >> 2] = d;c[h + 12 >> 2] = h;c[h + 8 >> 2] = h;break;
            }b = c[d >> 2] | 0;k: do if ((c[b + 4 >> 2] & -8 | 0) != (g | 0)) {
              e = g << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);while (1) {
                a = b + 16 + (e >>> 31 << 2) | 0;d = c[a >> 2] | 0;if (!d) break;if ((c[d + 4 >> 2] & -8 | 0) == (g | 0)) {
                  I = d;break k;
                } else {
                  e = e << 1;b = d;
                }
              }if (a >>> 0 < (c[1270] | 0) >>> 0) fb();else {
                c[a >> 2] = h;c[h + 24 >> 2] = b;c[h + 12 >> 2] = h;c[h + 8 >> 2] = h;break g;
              }
            } else I = b; while (0);b = I + 8 | 0;a = c[b >> 2] | 0;M = c[1270] | 0;if (a >>> 0 >= M >>> 0 & I >>> 0 >= M >>> 0) {
              c[a + 12 >> 2] = h;c[b >> 2] = h;c[h + 8 >> 2] = a;c[h + 12 >> 2] = I;c[h + 24 >> 2] = 0;break;
            } else fb();
          }
        } else {
          M = c[1270] | 0;if ((M | 0) == 0 | w >>> 0 < M >>> 0) c[1270] = w;c[1378] = w;c[1379] = p;c[1381] = 0;c[1275] = c[1384];c[1274] = -1;b = 0;do {
            M = b << 1;L = 5104 + (M << 2) | 0;c[5104 + (M + 3 << 2) >> 2] = L;c[5104 + (M + 2 << 2) >> 2] = L;b = b + 1 | 0;
          } while ((b | 0) != 32);M = w + 8 | 0;M = (M & 7 | 0) == 0 ? 0 : 0 - M & 7;L = p + -40 - M | 0;c[1272] = w + M;c[1269] = L;c[w + (M + 4) >> 2] = L | 1;c[w + (p + -36) >> 2] = 40;c[1273] = c[1388];
        } while (0);b = c[1269] | 0;if (b >>> 0 > q >>> 0) {
          L = b - q | 0;c[1269] = L;M = c[1272] | 0;c[1272] = M + q;c[M + (q + 4) >> 2] = L | 1;c[M + 4 >> 2] = q | 3;M = M + 8 | 0;return M | 0;
        }
      }c[(Sn() | 0) >> 2] = 12;M = 0;return M | 0;
    }function Do(a) {
      a = a | 0;var b = 0,
          d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0,
          t = 0,
          u = 0;if (!a) return;b = a + -8 | 0;i = c[1270] | 0;if (b >>> 0 < i >>> 0) fb();d = c[a + -4 >> 2] | 0;e = d & 3;if ((e | 0) == 1) fb();o = d & -8;q = a + (o + -8) | 0;do if (!(d & 1)) {
        b = c[b >> 2] | 0;if (!e) return;j = -8 - b | 0;l = a + j | 0;m = b + o | 0;if (l >>> 0 < i >>> 0) fb();if ((l | 0) == (c[1271] | 0)) {
          b = a + (o + -4) | 0;d = c[b >> 2] | 0;if ((d & 3 | 0) != 3) {
            u = l;g = m;break;
          }c[1268] = m;c[b >> 2] = d & -2;c[a + (j + 4) >> 2] = m | 1;c[q >> 2] = m;return;
        }f = b >>> 3;if (b >>> 0 < 256) {
          e = c[a + (j + 8) >> 2] | 0;d = c[a + (j + 12) >> 2] | 0;b = 5104 + (f << 1 << 2) | 0;if ((e | 0) != (b | 0)) {
            if (e >>> 0 < i >>> 0) fb();if ((c[e + 12 >> 2] | 0) != (l | 0)) fb();
          }if ((d | 0) == (e | 0)) {
            c[1266] = c[1266] & ~(1 << f);u = l;g = m;break;
          }if ((d | 0) != (b | 0)) {
            if (d >>> 0 < i >>> 0) fb();b = d + 8 | 0;if ((c[b >> 2] | 0) == (l | 0)) h = b;else fb();
          } else h = d + 8 | 0;c[e + 12 >> 2] = d;c[h >> 2] = e;u = l;g = m;break;
        }h = c[a + (j + 24) >> 2] | 0;e = c[a + (j + 12) >> 2] | 0;do if ((e | 0) == (l | 0)) {
          d = a + (j + 20) | 0;b = c[d >> 2] | 0;if (!b) {
            d = a + (j + 16) | 0;b = c[d >> 2] | 0;if (!b) {
              k = 0;break;
            }
          }while (1) {
            e = b + 20 | 0;f = c[e >> 2] | 0;if (f) {
              b = f;d = e;continue;
            }e = b + 16 | 0;f = c[e >> 2] | 0;if (!f) break;else {
              b = f;d = e;
            }
          }if (d >>> 0 < i >>> 0) fb();else {
            c[d >> 2] = 0;k = b;break;
          }
        } else {
          f = c[a + (j + 8) >> 2] | 0;if (f >>> 0 < i >>> 0) fb();b = f + 12 | 0;if ((c[b >> 2] | 0) != (l | 0)) fb();d = e + 8 | 0;if ((c[d >> 2] | 0) == (l | 0)) {
            c[b >> 2] = e;c[d >> 2] = f;k = e;break;
          } else fb();
        } while (0);if (h) {
          b = c[a + (j + 28) >> 2] | 0;d = 5368 + (b << 2) | 0;if ((l | 0) == (c[d >> 2] | 0)) {
            c[d >> 2] = k;if (!k) {
              c[1267] = c[1267] & ~(1 << b);u = l;g = m;break;
            }
          } else {
            if (h >>> 0 < (c[1270] | 0) >>> 0) fb();b = h + 16 | 0;if ((c[b >> 2] | 0) == (l | 0)) c[b >> 2] = k;else c[h + 20 >> 2] = k;if (!k) {
              u = l;g = m;break;
            }
          }d = c[1270] | 0;if (k >>> 0 < d >>> 0) fb();c[k + 24 >> 2] = h;b = c[a + (j + 16) >> 2] | 0;do if (b) if (b >>> 0 < d >>> 0) fb();else {
            c[k + 16 >> 2] = b;c[b + 24 >> 2] = k;break;
          } while (0);b = c[a + (j + 20) >> 2] | 0;if (b) {
            if (b >>> 0 < (c[1270] | 0) >>> 0) fb();else {
              c[k + 20 >> 2] = b;c[b + 24 >> 2] = k;u = l;g = m;break;
            }
          } else {
            u = l;g = m;
          }
        } else {
          u = l;g = m;
        }
      } else {
        u = b;g = o;
      } while (0);if (u >>> 0 >= q >>> 0) fb();b = a + (o + -4) | 0;d = c[b >> 2] | 0;if (!(d & 1)) fb();if (!(d & 2)) {
        if ((q | 0) == (c[1272] | 0)) {
          t = (c[1269] | 0) + g | 0;c[1269] = t;c[1272] = u;c[u + 4 >> 2] = t | 1;if ((u | 0) != (c[1271] | 0)) return;c[1271] = 0;c[1268] = 0;return;
        }if ((q | 0) == (c[1271] | 0)) {
          t = (c[1268] | 0) + g | 0;c[1268] = t;c[1271] = u;c[u + 4 >> 2] = t | 1;c[u + t >> 2] = t;return;
        }g = (d & -8) + g | 0;f = d >>> 3;do if (d >>> 0 >= 256) {
          h = c[a + (o + 16) >> 2] | 0;b = c[a + (o | 4) >> 2] | 0;do if ((b | 0) == (q | 0)) {
            d = a + (o + 12) | 0;b = c[d >> 2] | 0;if (!b) {
              d = a + (o + 8) | 0;b = c[d >> 2] | 0;if (!b) {
                p = 0;break;
              }
            }while (1) {
              e = b + 20 | 0;f = c[e >> 2] | 0;if (f) {
                b = f;d = e;continue;
              }e = b + 16 | 0;f = c[e >> 2] | 0;if (!f) break;else {
                b = f;d = e;
              }
            }if (d >>> 0 < (c[1270] | 0) >>> 0) fb();else {
              c[d >> 2] = 0;p = b;break;
            }
          } else {
            d = c[a + o >> 2] | 0;if (d >>> 0 < (c[1270] | 0) >>> 0) fb();e = d + 12 | 0;if ((c[e >> 2] | 0) != (q | 0)) fb();f = b + 8 | 0;if ((c[f >> 2] | 0) == (q | 0)) {
              c[e >> 2] = b;c[f >> 2] = d;p = b;break;
            } else fb();
          } while (0);if (h) {
            b = c[a + (o + 20) >> 2] | 0;d = 5368 + (b << 2) | 0;if ((q | 0) == (c[d >> 2] | 0)) {
              c[d >> 2] = p;if (!p) {
                c[1267] = c[1267] & ~(1 << b);break;
              }
            } else {
              if (h >>> 0 < (c[1270] | 0) >>> 0) fb();b = h + 16 | 0;if ((c[b >> 2] | 0) == (q | 0)) c[b >> 2] = p;else c[h + 20 >> 2] = p;if (!p) break;
            }d = c[1270] | 0;if (p >>> 0 < d >>> 0) fb();c[p + 24 >> 2] = h;b = c[a + (o + 8) >> 2] | 0;do if (b) if (b >>> 0 < d >>> 0) fb();else {
              c[p + 16 >> 2] = b;c[b + 24 >> 2] = p;break;
            } while (0);b = c[a + (o + 12) >> 2] | 0;if (b) if (b >>> 0 < (c[1270] | 0) >>> 0) fb();else {
              c[p + 20 >> 2] = b;c[b + 24 >> 2] = p;break;
            }
          }
        } else {
          e = c[a + o >> 2] | 0;d = c[a + (o | 4) >> 2] | 0;b = 5104 + (f << 1 << 2) | 0;if ((e | 0) != (b | 0)) {
            if (e >>> 0 < (c[1270] | 0) >>> 0) fb();if ((c[e + 12 >> 2] | 0) != (q | 0)) fb();
          }if ((d | 0) == (e | 0)) {
            c[1266] = c[1266] & ~(1 << f);break;
          }if ((d | 0) != (b | 0)) {
            if (d >>> 0 < (c[1270] | 0) >>> 0) fb();b = d + 8 | 0;if ((c[b >> 2] | 0) == (q | 0)) n = b;else fb();
          } else n = d + 8 | 0;c[e + 12 >> 2] = d;c[n >> 2] = e;
        } while (0);c[u + 4 >> 2] = g | 1;c[u + g >> 2] = g;if ((u | 0) == (c[1271] | 0)) {
          c[1268] = g;return;
        }
      } else {
        c[b >> 2] = d & -2;c[u + 4 >> 2] = g | 1;c[u + g >> 2] = g;
      }b = g >>> 3;if (g >>> 0 < 256) {
        d = b << 1;f = 5104 + (d << 2) | 0;e = c[1266] | 0;b = 1 << b;if (e & b) {
          b = 5104 + (d + 2 << 2) | 0;d = c[b >> 2] | 0;if (d >>> 0 < (c[1270] | 0) >>> 0) fb();else {
            r = b;s = d;
          }
        } else {
          c[1266] = e | b;r = 5104 + (d + 2 << 2) | 0;s = f;
        }c[r >> 2] = u;c[s + 12 >> 2] = u;c[u + 8 >> 2] = s;c[u + 12 >> 2] = f;return;
      }b = g >>> 8;if (b) {
        if (g >>> 0 > 16777215) f = 31;else {
          r = (b + 1048320 | 0) >>> 16 & 8;s = b << r;q = (s + 520192 | 0) >>> 16 & 4;s = s << q;f = (s + 245760 | 0) >>> 16 & 2;f = 14 - (q | r | f) + (s << f >>> 15) | 0;f = g >>> (f + 7 | 0) & 1 | f << 1;
        }
      } else f = 0;b = 5368 + (f << 2) | 0;c[u + 28 >> 2] = f;c[u + 20 >> 2] = 0;c[u + 16 >> 2] = 0;d = c[1267] | 0;e = 1 << f;a: do if (d & e) {
        b = c[b >> 2] | 0;b: do if ((c[b + 4 >> 2] & -8 | 0) != (g | 0)) {
          f = g << ((f | 0) == 31 ? 0 : 25 - (f >>> 1) | 0);while (1) {
            d = b + 16 + (f >>> 31 << 2) | 0;e = c[d >> 2] | 0;if (!e) break;if ((c[e + 4 >> 2] & -8 | 0) == (g | 0)) {
              t = e;break b;
            } else {
              f = f << 1;b = e;
            }
          }if (d >>> 0 < (c[1270] | 0) >>> 0) fb();else {
            c[d >> 2] = u;c[u + 24 >> 2] = b;c[u + 12 >> 2] = u;c[u + 8 >> 2] = u;break a;
          }
        } else t = b; while (0);b = t + 8 | 0;d = c[b >> 2] | 0;s = c[1270] | 0;if (d >>> 0 >= s >>> 0 & t >>> 0 >= s >>> 0) {
          c[d + 12 >> 2] = u;c[b >> 2] = u;c[u + 8 >> 2] = d;c[u + 12 >> 2] = t;c[u + 24 >> 2] = 0;break;
        } else fb();
      } else {
        c[1267] = d | e;c[b >> 2] = u;c[u + 24 >> 2] = b;c[u + 12 >> 2] = u;c[u + 8 >> 2] = u;
      } while (0);u = (c[1274] | 0) + -1 | 0;c[1274] = u;if (!u) b = 5520;else return;while (1) {
        b = c[b >> 2] | 0;if (!b) break;else b = b + 8 | 0;
      }c[1274] = -1;return;
    }function Eo(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0;if (!a) {
        a = Co(b) | 0;return a | 0;
      }if (b >>> 0 > 4294967231) {
        c[(Sn() | 0) >> 2] = 12;a = 0;return a | 0;
      }d = Fo(a + -8 | 0, b >>> 0 < 11 ? 16 : b + 11 & -8) | 0;if (d) {
        a = d + 8 | 0;return a | 0;
      }d = Co(b) | 0;if (!d) {
        a = 0;return a | 0;
      }e = c[a + -4 >> 2] | 0;e = (e & -8) - ((e & 3 | 0) == 0 ? 8 : 4) | 0;So(d | 0, a | 0, (e >>> 0 < b >>> 0 ? e : b) | 0) | 0;Do(a);a = d;return a | 0;
    }function Fo(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0;o = a + 4 | 0;p = c[o >> 2] | 0;j = p & -8;l = a + j | 0;i = c[1270] | 0;d = p & 3;if (!((d | 0) != 1 & a >>> 0 >= i >>> 0 & a >>> 0 < l >>> 0)) fb();e = a + (j | 4) | 0;f = c[e >> 2] | 0;if (!(f & 1)) fb();if (!d) {
        if (b >>> 0 < 256) {
          a = 0;return a | 0;
        }if (j >>> 0 >= (b + 4 | 0) >>> 0 ? (j - b | 0) >>> 0 <= c[1386] << 1 >>> 0 : 0) return a | 0;a = 0;return a | 0;
      }if (j >>> 0 >= b >>> 0) {
        d = j - b | 0;if (d >>> 0 <= 15) return a | 0;c[o >> 2] = p & 1 | b | 2;c[a + (b + 4) >> 2] = d | 3;c[e >> 2] = c[e >> 2] | 1;Go(a + b | 0, d);return a | 0;
      }if ((l | 0) == (c[1272] | 0)) {
        d = (c[1269] | 0) + j | 0;if (d >>> 0 <= b >>> 0) {
          a = 0;return a | 0;
        }n = d - b | 0;c[o >> 2] = p & 1 | b | 2;c[a + (b + 4) >> 2] = n | 1;c[1272] = a + b;c[1269] = n;return a | 0;
      }if ((l | 0) == (c[1271] | 0)) {
        e = (c[1268] | 0) + j | 0;if (e >>> 0 < b >>> 0) {
          a = 0;return a | 0;
        }d = e - b | 0;if (d >>> 0 > 15) {
          c[o >> 2] = p & 1 | b | 2;c[a + (b + 4) >> 2] = d | 1;c[a + e >> 2] = d;e = a + (e + 4) | 0;c[e >> 2] = c[e >> 2] & -2;e = a + b | 0;
        } else {
          c[o >> 2] = p & 1 | e | 2;e = a + (e + 4) | 0;c[e >> 2] = c[e >> 2] | 1;e = 0;d = 0;
        }c[1268] = d;c[1271] = e;return a | 0;
      }if (f & 2) {
        a = 0;return a | 0;
      }m = (f & -8) + j | 0;if (m >>> 0 < b >>> 0) {
        a = 0;return a | 0;
      }n = m - b | 0;g = f >>> 3;do if (f >>> 0 >= 256) {
        h = c[a + (j + 24) >> 2] | 0;g = c[a + (j + 12) >> 2] | 0;do if ((g | 0) == (l | 0)) {
          e = a + (j + 20) | 0;d = c[e >> 2] | 0;if (!d) {
            e = a + (j + 16) | 0;d = c[e >> 2] | 0;if (!d) {
              k = 0;break;
            }
          }while (1) {
            f = d + 20 | 0;g = c[f >> 2] | 0;if (g) {
              d = g;e = f;continue;
            }f = d + 16 | 0;g = c[f >> 2] | 0;if (!g) break;else {
              d = g;e = f;
            }
          }if (e >>> 0 < i >>> 0) fb();else {
            c[e >> 2] = 0;k = d;break;
          }
        } else {
          f = c[a + (j + 8) >> 2] | 0;if (f >>> 0 < i >>> 0) fb();d = f + 12 | 0;if ((c[d >> 2] | 0) != (l | 0)) fb();e = g + 8 | 0;if ((c[e >> 2] | 0) == (l | 0)) {
            c[d >> 2] = g;c[e >> 2] = f;k = g;break;
          } else fb();
        } while (0);if (h) {
          d = c[a + (j + 28) >> 2] | 0;e = 5368 + (d << 2) | 0;if ((l | 0) == (c[e >> 2] | 0)) {
            c[e >> 2] = k;if (!k) {
              c[1267] = c[1267] & ~(1 << d);break;
            }
          } else {
            if (h >>> 0 < (c[1270] | 0) >>> 0) fb();d = h + 16 | 0;if ((c[d >> 2] | 0) == (l | 0)) c[d >> 2] = k;else c[h + 20 >> 2] = k;if (!k) break;
          }e = c[1270] | 0;if (k >>> 0 < e >>> 0) fb();c[k + 24 >> 2] = h;d = c[a + (j + 16) >> 2] | 0;do if (d) if (d >>> 0 < e >>> 0) fb();else {
            c[k + 16 >> 2] = d;c[d + 24 >> 2] = k;break;
          } while (0);d = c[a + (j + 20) >> 2] | 0;if (d) if (d >>> 0 < (c[1270] | 0) >>> 0) fb();else {
            c[k + 20 >> 2] = d;c[d + 24 >> 2] = k;break;
          }
        }
      } else {
        f = c[a + (j + 8) >> 2] | 0;e = c[a + (j + 12) >> 2] | 0;d = 5104 + (g << 1 << 2) | 0;if ((f | 0) != (d | 0)) {
          if (f >>> 0 < i >>> 0) fb();if ((c[f + 12 >> 2] | 0) != (l | 0)) fb();
        }if ((e | 0) == (f | 0)) {
          c[1266] = c[1266] & ~(1 << g);break;
        }if ((e | 0) != (d | 0)) {
          if (e >>> 0 < i >>> 0) fb();d = e + 8 | 0;if ((c[d >> 2] | 0) == (l | 0)) h = d;else fb();
        } else h = e + 8 | 0;c[f + 12 >> 2] = e;c[h >> 2] = f;
      } while (0);if (n >>> 0 < 16) {
        c[o >> 2] = m | p & 1 | 2;b = a + (m | 4) | 0;c[b >> 2] = c[b >> 2] | 1;return a | 0;
      } else {
        c[o >> 2] = p & 1 | b | 2;c[a + (b + 4) >> 2] = n | 3;p = a + (m | 4) | 0;c[p >> 2] = c[p >> 2] | 1;Go(a + b | 0, n);return a | 0;
      }return 0;
    }function Go(a, b) {
      a = a | 0;b = b | 0;var d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0,
          q = 0,
          r = 0,
          s = 0,
          t = 0;q = a + b | 0;d = c[a + 4 >> 2] | 0;do if (!(d & 1)) {
        k = c[a >> 2] | 0;if (!(d & 3)) return;n = a + (0 - k) | 0;m = k + b | 0;j = c[1270] | 0;if (n >>> 0 < j >>> 0) fb();if ((n | 0) == (c[1271] | 0)) {
          e = a + (b + 4) | 0;d = c[e >> 2] | 0;if ((d & 3 | 0) != 3) {
            t = n;h = m;break;
          }c[1268] = m;c[e >> 2] = d & -2;c[a + (4 - k) >> 2] = m | 1;c[q >> 2] = m;return;
        }g = k >>> 3;if (k >>> 0 < 256) {
          f = c[a + (8 - k) >> 2] | 0;e = c[a + (12 - k) >> 2] | 0;d = 5104 + (g << 1 << 2) | 0;if ((f | 0) != (d | 0)) {
            if (f >>> 0 < j >>> 0) fb();if ((c[f + 12 >> 2] | 0) != (n | 0)) fb();
          }if ((e | 0) == (f | 0)) {
            c[1266] = c[1266] & ~(1 << g);t = n;h = m;break;
          }if ((e | 0) != (d | 0)) {
            if (e >>> 0 < j >>> 0) fb();d = e + 8 | 0;if ((c[d >> 2] | 0) == (n | 0)) i = d;else fb();
          } else i = e + 8 | 0;c[f + 12 >> 2] = e;c[i >> 2] = f;t = n;h = m;break;
        }i = c[a + (24 - k) >> 2] | 0;f = c[a + (12 - k) >> 2] | 0;do if ((f | 0) == (n | 0)) {
          f = 16 - k | 0;e = a + (f + 4) | 0;d = c[e >> 2] | 0;if (!d) {
            e = a + f | 0;d = c[e >> 2] | 0;if (!d) {
              l = 0;break;
            }
          }while (1) {
            f = d + 20 | 0;g = c[f >> 2] | 0;if (g) {
              d = g;e = f;continue;
            }f = d + 16 | 0;g = c[f >> 2] | 0;if (!g) break;else {
              d = g;e = f;
            }
          }if (e >>> 0 < j >>> 0) fb();else {
            c[e >> 2] = 0;l = d;break;
          }
        } else {
          g = c[a + (8 - k) >> 2] | 0;if (g >>> 0 < j >>> 0) fb();d = g + 12 | 0;if ((c[d >> 2] | 0) != (n | 0)) fb();e = f + 8 | 0;if ((c[e >> 2] | 0) == (n | 0)) {
            c[d >> 2] = f;c[e >> 2] = g;l = f;break;
          } else fb();
        } while (0);if (i) {
          d = c[a + (28 - k) >> 2] | 0;e = 5368 + (d << 2) | 0;if ((n | 0) == (c[e >> 2] | 0)) {
            c[e >> 2] = l;if (!l) {
              c[1267] = c[1267] & ~(1 << d);t = n;h = m;break;
            }
          } else {
            if (i >>> 0 < (c[1270] | 0) >>> 0) fb();d = i + 16 | 0;if ((c[d >> 2] | 0) == (n | 0)) c[d >> 2] = l;else c[i + 20 >> 2] = l;if (!l) {
              t = n;h = m;break;
            }
          }f = c[1270] | 0;if (l >>> 0 < f >>> 0) fb();c[l + 24 >> 2] = i;d = 16 - k | 0;e = c[a + d >> 2] | 0;do if (e) if (e >>> 0 < f >>> 0) fb();else {
            c[l + 16 >> 2] = e;c[e + 24 >> 2] = l;break;
          } while (0);d = c[a + (d + 4) >> 2] | 0;if (d) {
            if (d >>> 0 < (c[1270] | 0) >>> 0) fb();else {
              c[l + 20 >> 2] = d;c[d + 24 >> 2] = l;t = n;h = m;break;
            }
          } else {
            t = n;h = m;
          }
        } else {
          t = n;h = m;
        }
      } else {
        t = a;h = b;
      } while (0);j = c[1270] | 0;if (q >>> 0 < j >>> 0) fb();d = a + (b + 4) | 0;e = c[d >> 2] | 0;if (!(e & 2)) {
        if ((q | 0) == (c[1272] | 0)) {
          s = (c[1269] | 0) + h | 0;c[1269] = s;c[1272] = t;c[t + 4 >> 2] = s | 1;if ((t | 0) != (c[1271] | 0)) return;c[1271] = 0;c[1268] = 0;return;
        }if ((q | 0) == (c[1271] | 0)) {
          s = (c[1268] | 0) + h | 0;c[1268] = s;c[1271] = t;c[t + 4 >> 2] = s | 1;c[t + s >> 2] = s;return;
        }h = (e & -8) + h | 0;g = e >>> 3;do if (e >>> 0 >= 256) {
          i = c[a + (b + 24) >> 2] | 0;f = c[a + (b + 12) >> 2] | 0;do if ((f | 0) == (q | 0)) {
            e = a + (b + 20) | 0;d = c[e >> 2] | 0;if (!d) {
              e = a + (b + 16) | 0;d = c[e >> 2] | 0;if (!d) {
                p = 0;break;
              }
            }while (1) {
              f = d + 20 | 0;g = c[f >> 2] | 0;if (g) {
                d = g;e = f;continue;
              }f = d + 16 | 0;g = c[f >> 2] | 0;if (!g) break;else {
                d = g;e = f;
              }
            }if (e >>> 0 < j >>> 0) fb();else {
              c[e >> 2] = 0;p = d;break;
            }
          } else {
            g = c[a + (b + 8) >> 2] | 0;if (g >>> 0 < j >>> 0) fb();d = g + 12 | 0;if ((c[d >> 2] | 0) != (q | 0)) fb();e = f + 8 | 0;if ((c[e >> 2] | 0) == (q | 0)) {
              c[d >> 2] = f;c[e >> 2] = g;p = f;break;
            } else fb();
          } while (0);if (i) {
            d = c[a + (b + 28) >> 2] | 0;e = 5368 + (d << 2) | 0;if ((q | 0) == (c[e >> 2] | 0)) {
              c[e >> 2] = p;if (!p) {
                c[1267] = c[1267] & ~(1 << d);break;
              }
            } else {
              if (i >>> 0 < (c[1270] | 0) >>> 0) fb();d = i + 16 | 0;if ((c[d >> 2] | 0) == (q | 0)) c[d >> 2] = p;else c[i + 20 >> 2] = p;if (!p) break;
            }e = c[1270] | 0;if (p >>> 0 < e >>> 0) fb();c[p + 24 >> 2] = i;d = c[a + (b + 16) >> 2] | 0;do if (d) if (d >>> 0 < e >>> 0) fb();else {
              c[p + 16 >> 2] = d;c[d + 24 >> 2] = p;break;
            } while (0);d = c[a + (b + 20) >> 2] | 0;if (d) if (d >>> 0 < (c[1270] | 0) >>> 0) fb();else {
              c[p + 20 >> 2] = d;c[d + 24 >> 2] = p;break;
            }
          }
        } else {
          f = c[a + (b + 8) >> 2] | 0;e = c[a + (b + 12) >> 2] | 0;d = 5104 + (g << 1 << 2) | 0;if ((f | 0) != (d | 0)) {
            if (f >>> 0 < j >>> 0) fb();if ((c[f + 12 >> 2] | 0) != (q | 0)) fb();
          }if ((e | 0) == (f | 0)) {
            c[1266] = c[1266] & ~(1 << g);break;
          }if ((e | 0) != (d | 0)) {
            if (e >>> 0 < j >>> 0) fb();d = e + 8 | 0;if ((c[d >> 2] | 0) == (q | 0)) o = d;else fb();
          } else o = e + 8 | 0;c[f + 12 >> 2] = e;c[o >> 2] = f;
        } while (0);c[t + 4 >> 2] = h | 1;c[t + h >> 2] = h;if ((t | 0) == (c[1271] | 0)) {
          c[1268] = h;return;
        }
      } else {
        c[d >> 2] = e & -2;c[t + 4 >> 2] = h | 1;c[t + h >> 2] = h;
      }d = h >>> 3;if (h >>> 0 < 256) {
        e = d << 1;g = 5104 + (e << 2) | 0;f = c[1266] | 0;d = 1 << d;if (f & d) {
          d = 5104 + (e + 2 << 2) | 0;e = c[d >> 2] | 0;if (e >>> 0 < (c[1270] | 0) >>> 0) fb();else {
            r = d;s = e;
          }
        } else {
          c[1266] = f | d;r = 5104 + (e + 2 << 2) | 0;s = g;
        }c[r >> 2] = t;c[s + 12 >> 2] = t;c[t + 8 >> 2] = s;c[t + 12 >> 2] = g;return;
      }d = h >>> 8;if (d) {
        if (h >>> 0 > 16777215) g = 31;else {
          r = (d + 1048320 | 0) >>> 16 & 8;s = d << r;q = (s + 520192 | 0) >>> 16 & 4;s = s << q;g = (s + 245760 | 0) >>> 16 & 2;g = 14 - (q | r | g) + (s << g >>> 15) | 0;g = h >>> (g + 7 | 0) & 1 | g << 1;
        }
      } else g = 0;d = 5368 + (g << 2) | 0;c[t + 28 >> 2] = g;c[t + 20 >> 2] = 0;c[t + 16 >> 2] = 0;e = c[1267] | 0;f = 1 << g;if (!(e & f)) {
        c[1267] = e | f;c[d >> 2] = t;c[t + 24 >> 2] = d;c[t + 12 >> 2] = t;c[t + 8 >> 2] = t;return;
      }d = c[d >> 2] | 0;a: do if ((c[d + 4 >> 2] & -8 | 0) != (h | 0)) {
        g = h << ((g | 0) == 31 ? 0 : 25 - (g >>> 1) | 0);while (1) {
          e = d + 16 + (g >>> 31 << 2) | 0;f = c[e >> 2] | 0;if (!f) break;if ((c[f + 4 >> 2] & -8 | 0) == (h | 0)) {
            d = f;break a;
          } else {
            g = g << 1;d = f;
          }
        }if (e >>> 0 < (c[1270] | 0) >>> 0) fb();c[e >> 2] = t;c[t + 24 >> 2] = d;c[t + 12 >> 2] = t;c[t + 8 >> 2] = t;return;
      } while (0);e = d + 8 | 0;f = c[e >> 2] | 0;s = c[1270] | 0;if (!(f >>> 0 >= s >>> 0 & d >>> 0 >= s >>> 0)) fb();c[f + 12 >> 2] = t;c[e >> 2] = t;c[t + 8 >> 2] = f;c[t + 12 >> 2] = d;c[t + 24 >> 2] = 0;return;
    }function Ho(a) {
      a = a | 0;return;
    }function Io(a) {
      a = a | 0;var b = 0,
          d = 0;d = a + 4 | 0;b = c[d >> 2] | 0;c[d >> 2] = b + -1;if (!b) {
        Lb[c[(c[a >> 2] | 0) + 8 >> 2] & 127](a);a = 1;
      } else a = 0;return a | 0;
    }function Jo(a) {
      a = a | 0;if (Io(a) | 0) Ko(a);return;
    }function Ko(a) {
      a = a | 0;var b = 0,
          d = 0;d = a + 8 | 0;b = c[d >> 2] | 0;c[d >> 2] = b + -1;if (!b) Lb[c[(c[a >> 2] | 0) + 16 >> 2] & 127](a);return;
    }function Lo(a, b) {
      a = a | 0;b = b | 0;return 0;
    }function Mo() {}function No(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;d = b - d - (c >>> 0 > a >>> 0 | 0) >>> 0;return (D = d, a - c >>> 0 | 0) | 0;
    }function Oo(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;c = a + c >>> 0;return (D = b + d + (c >>> 0 < a >>> 0 | 0) >>> 0, c | 0) | 0;
    }function Po(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          i = 0;f = b + e | 0;if ((e | 0) >= 20) {
        d = d & 255;h = b & 3;i = d | d << 8 | d << 16 | d << 24;g = f & ~3;if (h) {
          h = b + 4 - h | 0;while ((b | 0) < (h | 0)) {
            a[b >> 0] = d;b = b + 1 | 0;
          }
        }while ((b | 0) < (g | 0)) {
          c[b >> 2] = i;b = b + 4 | 0;
        }
      }while ((b | 0) < (f | 0)) {
        a[b >> 0] = d;b = b + 1 | 0;
      }return b - e | 0;
    }function Qo(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;if ((c | 0) < 32) {
        D = b << c | (a & (1 << c) - 1 << 32 - c) >>> 32 - c;return a << c;
      }D = a << c - 32;return 0;
    }function Ro(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;if ((c | 0) < 32) {
        D = b >>> c;return a >>> c | (b & (1 << c) - 1) << 32 - c;
      }D = 0;return b >>> c - 32 | 0;
    }function So(b, d, e) {
      b = b | 0;d = d | 0;e = e | 0;var f = 0;if ((e | 0) >= 4096) return $a(b | 0, d | 0, e | 0) | 0;f = b | 0;if ((b & 3) == (d & 3)) {
        while (b & 3) {
          if (!e) return f | 0;a[b >> 0] = a[d >> 0] | 0;b = b + 1 | 0;d = d + 1 | 0;e = e - 1 | 0;
        }while ((e | 0) >= 4) {
          c[b >> 2] = c[d >> 2];b = b + 4 | 0;d = d + 4 | 0;e = e - 4 | 0;
        }
      }while ((e | 0) > 0) {
        a[b >> 0] = a[d >> 0] | 0;b = b + 1 | 0;d = d + 1 | 0;e = e - 1 | 0;
      }return f | 0;
    }function To(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;if ((c | 0) < 32) {
        D = b >> c;return a >>> c | (b & (1 << c) - 1) << 32 - c;
      }D = (b | 0) < 0 ? -1 : 0;return b >> c - 32 | 0;
    }function Uo(b) {
      b = b | 0;var c = 0;c = a[m + (b & 255) >> 0] | 0;if ((c | 0) < 8) return c | 0;c = a[m + (b >> 8 & 255) >> 0] | 0;if ((c | 0) < 8) return c + 8 | 0;c = a[m + (b >> 16 & 255) >> 0] | 0;if ((c | 0) < 8) return c + 16 | 0;return (a[m + (b >>> 24) >> 0] | 0) + 24 | 0;
    }function Vo(a, b) {
      a = a | 0;b = b | 0;var c = 0,
          d = 0,
          e = 0,
          f = 0;f = a & 65535;e = b & 65535;c = $(e, f) | 0;d = a >>> 16;a = (c >>> 16) + ($(e, d) | 0) | 0;e = b >>> 16;b = $(e, f) | 0;return (D = (a >>> 16) + ($(e, d) | 0) + (((a & 65535) + b | 0) >>> 16) | 0, a + b << 16 | c & 65535 | 0) | 0;
    }function Wo(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;var e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0;j = b >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;i = ((b | 0) < 0 ? -1 : 0) >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;f = d >> 31 | ((d | 0) < 0 ? -1 : 0) << 1;e = ((d | 0) < 0 ? -1 : 0) >> 31 | ((d | 0) < 0 ? -1 : 0) << 1;h = No(j ^ a, i ^ b, j, i) | 0;g = D;a = f ^ j;b = e ^ i;return No(($o(h, g, No(f ^ c, e ^ d, f, e) | 0, D, 0) | 0) ^ a, D ^ b, a, b) | 0;
    }function Xo(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0,
          h = 0,
          j = 0,
          k = 0,
          l = 0;f = i;i = i + 16 | 0;j = f | 0;h = b >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;g = ((b | 0) < 0 ? -1 : 0) >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;l = e >> 31 | ((e | 0) < 0 ? -1 : 0) << 1;k = ((e | 0) < 0 ? -1 : 0) >> 31 | ((e | 0) < 0 ? -1 : 0) << 1;a = No(h ^ a, g ^ b, h, g) | 0;b = D;$o(a, b, No(l ^ d, k ^ e, l, k) | 0, D, j) | 0;e = No(c[j >> 2] ^ h, c[j + 4 >> 2] ^ g, h, g) | 0;d = D;i = f;return (D = d, e) | 0;
    }function Yo(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;var e = 0,
          f = 0;e = a;f = c;c = Vo(e, f) | 0;a = D;return (D = ($(b, f) | 0) + ($(d, e) | 0) + a | a & 0, c | 0 | 0) | 0;
    }function Zo(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;return $o(a, b, c, d, 0) | 0;
    }function _o(a, b, d, e) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;var f = 0,
          g = 0;g = i;i = i + 16 | 0;f = g | 0;$o(a, b, d, e, f) | 0;i = g;return (D = c[f + 4 >> 2] | 0, c[f >> 2] | 0) | 0;
    }function $o(a, b, d, e, f) {
      a = a | 0;b = b | 0;d = d | 0;e = e | 0;f = f | 0;var g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0,
          n = 0,
          o = 0,
          p = 0;l = a;j = b;k = j;h = d;n = e;i = n;if (!k) {
        g = (f | 0) != 0;if (!i) {
          if (g) {
            c[f >> 2] = (l >>> 0) % (h >>> 0);c[f + 4 >> 2] = 0;
          }n = 0;f = (l >>> 0) / (h >>> 0) >>> 0;return (D = n, f) | 0;
        } else {
          if (!g) {
            n = 0;f = 0;return (D = n, f) | 0;
          }c[f >> 2] = a | 0;c[f + 4 >> 2] = b & 0;n = 0;f = 0;return (D = n, f) | 0;
        }
      }g = (i | 0) == 0;do if (h) {
        if (!g) {
          g = (ba(i | 0) | 0) - (ba(k | 0) | 0) | 0;if (g >>> 0 <= 31) {
            m = g + 1 | 0;i = 31 - g | 0;b = g - 31 >> 31;h = m;a = l >>> (m >>> 0) & b | k << i;b = k >>> (m >>> 0) & b;g = 0;i = l << i;break;
          }if (!f) {
            n = 0;f = 0;return (D = n, f) | 0;
          }c[f >> 2] = a | 0;c[f + 4 >> 2] = j | b & 0;n = 0;f = 0;return (D = n, f) | 0;
        }g = h - 1 | 0;if (g & h) {
          i = (ba(h | 0) | 0) + 33 - (ba(k | 0) | 0) | 0;p = 64 - i | 0;m = 32 - i | 0;j = m >> 31;o = i - 32 | 0;b = o >> 31;h = i;a = m - 1 >> 31 & k >>> (o >>> 0) | (k << m | l >>> (i >>> 0)) & b;b = b & k >>> (i >>> 0);g = l << p & j;i = (k << p | l >>> (o >>> 0)) & j | l << m & i - 33 >> 31;break;
        }if (f) {
          c[f >> 2] = g & l;c[f + 4 >> 2] = 0;
        }if ((h | 0) == 1) {
          o = j | b & 0;p = a | 0 | 0;return (D = o, p) | 0;
        } else {
          p = Uo(h | 0) | 0;o = k >>> (p >>> 0) | 0;p = k << 32 - p | l >>> (p >>> 0) | 0;return (D = o, p) | 0;
        }
      } else {
        if (g) {
          if (f) {
            c[f >> 2] = (k >>> 0) % (h >>> 0);c[f + 4 >> 2] = 0;
          }o = 0;p = (k >>> 0) / (h >>> 0) >>> 0;return (D = o, p) | 0;
        }if (!l) {
          if (f) {
            c[f >> 2] = 0;c[f + 4 >> 2] = (k >>> 0) % (i >>> 0);
          }o = 0;p = (k >>> 0) / (i >>> 0) >>> 0;return (D = o, p) | 0;
        }g = i - 1 | 0;if (!(g & i)) {
          if (f) {
            c[f >> 2] = a | 0;c[f + 4 >> 2] = g & k | b & 0;
          }o = 0;p = k >>> ((Uo(i | 0) | 0) >>> 0);return (D = o, p) | 0;
        }g = (ba(i | 0) | 0) - (ba(k | 0) | 0) | 0;if (g >>> 0 <= 30) {
          b = g + 1 | 0;i = 31 - g | 0;h = b;a = k << i | l >>> (b >>> 0);b = k >>> (b >>> 0);g = 0;i = l << i;break;
        }if (!f) {
          o = 0;p = 0;return (D = o, p) | 0;
        }c[f >> 2] = a | 0;c[f + 4 >> 2] = j | b & 0;o = 0;p = 0;return (D = o, p) | 0;
      } while (0);if (!h) {
        k = i;j = 0;i = 0;
      } else {
        m = d | 0 | 0;l = n | e & 0;k = Oo(m | 0, l | 0, -1, -1) | 0;d = D;j = i;i = 0;do {
          e = j;j = g >>> 31 | j << 1;g = i | g << 1;e = a << 1 | e >>> 31 | 0;n = a >>> 31 | b << 1 | 0;No(k, d, e, n) | 0;p = D;o = p >> 31 | ((p | 0) < 0 ? -1 : 0) << 1;i = o & 1;a = No(e, n, o & m, (((p | 0) < 0 ? -1 : 0) >> 31 | ((p | 0) < 0 ? -1 : 0) << 1) & l) | 0;b = D;h = h - 1 | 0;
        } while ((h | 0) != 0);k = j;j = 0;
      }h = 0;if (f) {
        c[f >> 2] = a;c[f + 4 >> 2] = b;
      }o = (g | 0) >>> 31 | (k | h) << 1 | (h << 1 | g >>> 31) & 0 | j;p = (g << 1 | 0 >>> 31) & -2 | i;return (D = o, p) | 0;
    }function ap(a, b, c, d, e, f) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;f = f | 0;Ib[a & 3](b | 0, c | 0, d | 0, e | 0, f | 0);
    }function bp(a, b, c) {
      a = a | 0;b = b | 0;c = +c;Jb[a & 31](b | 0, +c);
    }function cp(a, b, c, d) {
      a = a | 0;b = b | 0;c = ca(c);d = ca(d);return ca(Kb[a & 0](b | 0, ca(c), ca(d)));
    }function dp(a, b) {
      a = a | 0;b = b | 0;Lb[a & 127](b | 0);
    }function ep(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;Mb[a & 31](b | 0, c | 0);
    }function fp(a, b) {
      a = a | 0;b = b | 0;return Nb[a & 31](b | 0) | 0;
    }function gp(a, b, c, d, e) {
      a = a | 0;b = b | 0;c = +c;d = +d;e = e | 0;Ob[a & 1](b | 0, +c, +d, e | 0);
    }function hp(a, b, c, d) {
      a = a | 0;b = b | 0;c = +c;d = +d;Pb[a & 1](b | 0, +c, +d);
    }function ip(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;return Qb[a & 15](b | 0, c | 0, d | 0) | 0;
    }function jp(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;return +Rb[a & 1](b | 0, c | 0, d | 0);
    }function kp(a, b) {
      a = a | 0;b = b | 0;return +Sb[a & 15](b | 0);
    }function lp(a, b, c) {
      a = a | 0;b = b | 0;c = +c;return Tb[a & 1](b | 0, +c) | 0;
    }function mp(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;return Ub[a & 15](b | 0, c | 0) | 0;
    }function np(a, b, c, d, e, f) {
      a = a | 0;b = b | 0;c = c | 0;d = +d;e = +e;f = f | 0;Vb[a & 1](b | 0, c | 0, +d, +e, f | 0);
    }function op(a, b, c, d, e, f, g) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;f = f | 0;g = g | 0;Wb[a & 3](b | 0, c | 0, d | 0, e | 0, f | 0, g | 0);
    }function pp(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;return +Xb[a & 7](b | 0, c | 0);
    }function qp(a) {
      a = a | 0;return Yb[a & 7]() | 0;
    }function rp(a, b, c, d, e, f) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;f = f | 0;return Zb[a & 1](b | 0, c | 0, d | 0, e | 0, f | 0) | 0;
    }function sp(a, b, c, d, e) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = +e;_b[a & 1](b | 0, c | 0, d | 0, +e);
    }function tp(a, b, c, d, e, f, g) {
      a = a | 0;b = b | 0;c = c | 0;d = ca(d);e = e | 0;f = ca(f);g = g | 0;$b[a & 1](b | 0, c | 0, ca(d), e | 0, ca(f), g | 0);
    }function up(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;ac[a & 15](b | 0, c | 0, d | 0);
    }function vp(a) {
      a = a | 0;bc[a & 0]();
    }function wp(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = +d;cc[a & 15](b | 0, c | 0, +d);
    }function xp(a, b, c) {
      a = a | 0;b = +b;c = +c;return dc[a & 1](+b, +c) | 0;
    }function yp(a, b, c, d, e) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;ec[a & 15](b | 0, c | 0, d | 0, e | 0);
    }function zp(a, b, c, d, e) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;da(0);
    }function Ap(a, b) {
      a = a | 0;b = +b;da(1);
    }function Bp(a, b, c) {
      a = a | 0;b = ca(b);c = ca(c);da(2);return ca(0);
    }function Cp(a) {
      a = a | 0;da(3);
    }function Dp(a, b) {
      a = a | 0;b = b | 0;da(4);
    }function Ep(a) {
      a = a | 0;da(5);return 0;
    }function Fp(a, b, c, d) {
      a = a | 0;b = +b;c = +c;d = d | 0;da(6);
    }function Gp(a, b, c) {
      a = a | 0;b = +b;c = +c;da(7);
    }function Hp(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;da(8);return 0;
    }function Ip(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;da(9);return 0.0;
    }function Jp(a) {
      a = a | 0;da(10);return 0.0;
    }function Kp(a, b) {
      a = a | 0;b = +b;da(11);return 0;
    }function Lp(a, b) {
      a = a | 0;b = b | 0;da(12);return 0;
    }function Mp(a, b, c, d, e) {
      a = a | 0;b = b | 0;c = +c;d = +d;e = e | 0;da(13);
    }function Np(a, b, c, d, e, f) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;f = f | 0;da(14);
    }function Op(a, b) {
      a = a | 0;b = b | 0;da(15);return 0.0;
    }function Pp() {
      da(16);return 0;
    }function Qp(a, b, c, d, e) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;e = e | 0;da(17);return 0;
    }function Rp(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = +d;da(18);
    }function Sp(a, b, c, d, e, f) {
      a = a | 0;b = b | 0;c = ca(c);d = d | 0;e = ca(e);f = f | 0;da(19);
    }function Tp(a, b, c) {
      a = a | 0;b = b | 0;c = c | 0;da(20);
    }function Up() {
      da(21);
    }function Vp(a, b, c) {
      a = a | 0;b = b | 0;c = +c;da(22);
    }function Wp(a, b) {
      a = +a;b = +b;da(23);return 0;
    }function Xp(a, b, c, d) {
      a = a | 0;b = b | 0;c = c | 0;d = d | 0;da(24);
    } // EMSCRIPTEN_END_FUNCS
    var Ib = [zp, Pn, On, rl];var Jb = [Ap, bf, cf, df, ef, ff, gf, hf, kf, lf, nf, of, pf, qf, rf, sf, tf, uf, vf, Ap, Ap, Ap, Ap, Ap, Ap, Ap, Ap, Ap, Ap, Ap, Ap, Ap];var Kb = [Bp];var Lb = [Cp, Do, Ho, gh, hh, ih, Bi, Ci, Di, Rk, Sk, Tk, Kl, Ll, Ml, on, pn, qn, xn, yn, Dn, Gn, En, Fn, Hn, $k, Ee, Ke, Ne, jf, mf, ag, cg, ah, kh, ph, vh, Bh, Ih, Oh, Uh, _h, ei, ki, qi, wi, Ji, Qi, Wi, aj, gj, mj, sj, yj, Ej, Kj, Xj, bk, hk, nk, zk, Ak, wk, Gk, Hk, Vk, Wk, Pk, kl, ml, vm, ln, mn, Jm, Pm, Vm, an, hn, wo, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp, Cp];var Mb = [Dp, Oe, Pe, Se, Te, Ue, Ve, We, Xe, _e, $e, af, Kf, Nf, Of, Pf, Qf, Rf, Sf, Xf, $f, lg, rj, xj, gk, cl, dm, um, Dp, Dp, Dp, Dp];var Nb = [Ep, Co, zn, eo, _k, Je, zf, Bf, Cf, Df, Ef, Ff, Gf, If, Jf, Yf, Zf, dg, Jj, mk, cm, tm, Ep, Ep, Ep, Ep, Ep, Ep, Ep, Ep, Ep, Ep];var Ob = [Fp, eg];var Pb = [Gp, Ok];var Qb = [Hp, In, yo, go, fo, ho, Hh, Ii, Wj, Um, Hp, Hp, Hp, Hp, Hp, Hp];var Rb = [Ip, ji];var Sb = [Jp, Lf, Mf, Tf, fg, gg, hg, ig, jg, kg, Jp, Jp, Jp, Jp, Jp, Jp];var Tb = [Kp, uk];var Ub = [Lp, Eo, Lo, He, _f, $g, uh, Nh, Th, vi, Pi, Dj, sl, Om, Lp, Lp];var Vb = [Mp, oh];var Wb = [Np, Rn, Qn, $m];var Xb = [Op, Uf, mg, ng, og, pi, Op, Op];var Yb = [Pp, sg, De, Ie, yk, Fk, Uk, kn];var Zb = [Qp, oe];var _b = [Rp, $i];var $b = [Sp, pg];var ac = [Tp, Ge, Af, Hf, Vf, Wf, Ah, Zh, fj, lj, Im, gn, Tp, Tp, Tp, Tp];var bc = [Up];var cc = [Vp, Qe, Re, Ye, Ze, wf, xf, yf, Vi, vk, Vp, Vp, Vp, Vp, Vp, Vp];var dc = [Wp, Nk];var ec = [Xp, Kn, Ln, Nj, di, qk, ak, Ck, Jk, Zk, pl, xm, sn, Xp, Xp, Xp];return { _nbind_init: km, _i64Subtract: No, _free: Do, _i64Add: Oo, _memset: Po, _malloc: Co, _memcpy: So, _bitshift64Lshr: Ro, _bitshift64Shl: Qo, __GLOBAL__sub_I_nbind_cc: tg, __GLOBAL__sub_I_common_cc: jl, __GLOBAL__sub_I_Binding_cc: lm, runPostSets: Mo, stackAlloc: fc, stackSave: gc, stackRestore: hc, establishStackSpace: ic, setThrew: jc, setTempRet0: mc, getTempRet0: nc, dynCall_viiiii: ap, dynCall_vid: bp, dynCall_fiff: cp, dynCall_vi: dp, dynCall_vii: ep, dynCall_ii: fp, dynCall_viddi: gp, dynCall_vidd: hp, dynCall_iiii: ip, dynCall_diii: jp, dynCall_di: kp, dynCall_iid: lp, dynCall_iii: mp, dynCall_viiddi: np, dynCall_viiiiii: op, dynCall_dii: pp, dynCall_i: qp, dynCall_iiiiii: rp, dynCall_viiid: sp, dynCall_viififi: tp, dynCall_viii: up, dynCall_v: vp, dynCall_viid: wp, dynCall_idd: xp, dynCall_viiii: yp };
  }( // EMSCRIPTEN_END_ASM
  Module.asmGlobalArg, Module.asmLibraryArg, buffer);var _nbind_init = Module["_nbind_init"] = asm["_nbind_init"];var __GLOBAL__sub_I_nbind_cc = Module["__GLOBAL__sub_I_nbind_cc"] = asm["__GLOBAL__sub_I_nbind_cc"];var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];var _free = Module["_free"] = asm["_free"];var runPostSets = Module["runPostSets"] = asm["runPostSets"];var _i64Add = Module["_i64Add"] = asm["_i64Add"];var _memset = Module["_memset"] = asm["_memset"];var _malloc = Module["_malloc"] = asm["_malloc"];var __GLOBAL__sub_I_common_cc = Module["__GLOBAL__sub_I_common_cc"] = asm["__GLOBAL__sub_I_common_cc"];var _memcpy = Module["_memcpy"] = asm["_memcpy"];var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];var __GLOBAL__sub_I_Binding_cc = Module["__GLOBAL__sub_I_Binding_cc"] = asm["__GLOBAL__sub_I_Binding_cc"];var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];var dynCall_fiff = Module["dynCall_fiff"] = asm["dynCall_fiff"];var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];var dynCall_viddi = Module["dynCall_viddi"] = asm["dynCall_viddi"];var dynCall_vidd = Module["dynCall_vidd"] = asm["dynCall_vidd"];var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];var dynCall_diii = Module["dynCall_diii"] = asm["dynCall_diii"];var dynCall_di = Module["dynCall_di"] = asm["dynCall_di"];var dynCall_iid = Module["dynCall_iid"] = asm["dynCall_iid"];var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];var dynCall_viiddi = Module["dynCall_viiddi"] = asm["dynCall_viiddi"];var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];var dynCall_dii = Module["dynCall_dii"] = asm["dynCall_dii"];var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];var dynCall_viiid = Module["dynCall_viiid"] = asm["dynCall_viiid"];var dynCall_viififi = Module["dynCall_viififi"] = asm["dynCall_viififi"];var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];var dynCall_viid = Module["dynCall_viid"] = asm["dynCall_viid"];var dynCall_idd = Module["dynCall_idd"] = asm["dynCall_idd"];var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];Runtime.stackAlloc = asm["stackAlloc"];Runtime.stackSave = asm["stackSave"];Runtime.stackRestore = asm["stackRestore"];Runtime.establishStackSpace = asm["establishStackSpace"];Runtime.setTempRet0 = asm["setTempRet0"];Runtime.getTempRet0 = asm["getTempRet0"];function ExitStatus(status) {
    this.name = "ExitStatus";this.message = "Program terminated with exit(" + status + ")";this.status = status;
  }ExitStatus.prototype = new Error();ExitStatus.prototype.constructor = ExitStatus;var initialStackTop;var preloadStartTime = null;var calledMain = false;dependenciesFulfilled = function runCaller() {
    if (!Module["calledRun"]) run();if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
  };Module["callMain"] = Module.callMain = function callMain(args) {
    assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");args = args || [];ensureInitRuntime();var argc = args.length + 1;function pad() {
      for (var i = 0; i < 4 - 1; i++) {
        argv.push(0);
      }
    }var argv = [allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL)];pad();for (var i = 0; i < argc - 1; i = i + 1) {
      argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));pad();
    }argv.push(0);argv = allocate(argv, "i32", ALLOC_NORMAL);try {
      var ret = Module["_main"](argc, argv, 0);exit(ret, true);
    } catch (e) {
      if (e instanceof ExitStatus) {
        return;
      } else if (e == "SimulateInfiniteLoop") {
        Module["noExitRuntime"] = true;return;
      } else {
        if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [e, e.stack]);throw e;
      }
    } finally {
      calledMain = true;
    }
  };function run(args) {
    args = args || Module["arguments"];if (preloadStartTime === null) preloadStartTime = Date.now();if (runDependencies > 0) {
      return;
    }preRun();if (runDependencies > 0) return;if (Module["calledRun"]) return;function doRun() {
      if (Module["calledRun"]) return;Module["calledRun"] = true;if (ABORT) return;ensureInitRuntime();preMain();if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();if (Module["_main"] && shouldRunNow) Module["callMain"](args);postRun();
    }if (Module["setStatus"]) {
      Module["setStatus"]("Running...");setTimeout(function () {
        setTimeout(function () {
          Module["setStatus"]("");
        }, 1);doRun();
      }, 1);
    } else {
      doRun();
    }
  }Module["run"] = Module.run = run;function exit(status, implicit) {
    if (implicit && Module["noExitRuntime"]) {
      return;
    }if (Module["noExitRuntime"]) {} else {
      ABORT = true;EXITSTATUS = status;STACKTOP = initialStackTop;exitRuntime();if (Module["onExit"]) Module["onExit"](status);
    }if (ENVIRONMENT_IS_NODE) {
      process["stdout"]["once"]("drain", function () {
        process["exit"](status);
      });console.log(" ");setTimeout(function () {
        process["exit"](status);
      }, 500);
    } else if (ENVIRONMENT_IS_SHELL && typeof quit === "function") {
      quit(status);
    }throw new ExitStatus(status);
  }Module["exit"] = Module.exit = exit;var abortDecorators = [];function abort(what) {
    if (what !== undefined) {
      Module.print(what);Module.printErr(what);what = JSON.stringify(what);
    } else {
      what = "";
    }ABORT = true;EXITSTATUS = 1;var extra = "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output = "abort(" + what + ") at " + stackTrace() + extra;if (abortDecorators) {
      abortDecorators.forEach(function (decorator) {
        output = decorator(output, what);
      });
    }throw output;
  }Module["abort"] = Module.abort = abort;if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];while (Module["preInit"].length > 0) {
      Module["preInit"].pop()();
    }
  }var shouldRunNow = true;if (Module["noInitialRun"]) {
    shouldRunNow = false;
  }run();
});

}, 28, null, "yoga-layout/build/Release/nbind.js");
__d(/* yoga-layout/sources/entry-common.js */function(global, require, module, exports) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

function patch(prototype, name, fn) {

    let original = prototype[name];

    prototype[name] = function (... args) {
        return fn.call(this, original, ... args);
    };

}

module.exports = function (bind, lib) {

    let constants = Object.assign({

        UNDEFINED: NaN

    }, require(30         )); // 30 = ./YGEnums

    class Layout {

        constructor(left, right, top, bottom, width, height) {

            this.left = left;
            this.right = right;

            this.top = top;
            this.bottom = bottom;

            this.width = width;
            this.height = height;

        }

        fromJS(expose) {

            expose(this.left, this.right, this.top, this.bottom, this.width, this.height);

        }

        toString() {

            return `<Layout#${this.left}:${this.right};${this.top}:${this.bottom};${this.width}:${this.height}>`;

        }

    }

    class Size {

        static fromJS({ width, height }) {

            return new Size(width, height);

        }

        constructor(width, height) {

            this.width = width;
            this.height = height;

        }

        fromJS(expose) {

            expose(this.width, this.height);

        }

        toString() {

            return `<Size#${this.width}x${this.height}>`;

        }

    }

    class Value {

        constructor(unit, value) {

            this.unit = unit;
            this.value = value;

        }

        fromJS(expose) {

            expose(this.unit, this.value);

        }

        toString() {

            switch (this.unit) {

                case constants.UNIT_POINT:
                    return `${this.value}`;

                case constants.UNIT_PERCENT:
                    return `${this.value}%`;

                case constants.UNIT_AUTO:
                    return `auto`;

                default: {
                    return `${this.value}?`;
                }

            }

        }

        valueOf() {

            return this.value;

        }

    }

    for (let fnName of [ `setPosition`, `setMargin`, `setFlexBasis`, `setWidth`, `setHeight`, `setMinWidth`, `setMinHeight`, `setMaxWidth`, `setMaxHeight`, `setPadding` ]) {

        let methods = { [constants.UNIT_POINT]: lib.Node.prototype[fnName], [constants.UNIT_PERCENT]: lib.Node.prototype[`${fnName}Percent`], [constants.UNIT_AUTO]: lib.Node.prototype[`${fnName}Auto`] };

        patch(lib.Node.prototype, fnName, function (original, ... args) {

            // We patch all these functions to add support for the following calls:
            // .setWidth(100) / .setWidth("100%") / .setWidth(.getWidth()) / .setWidth("auto")

            let value = args.pop();
            let unit, asNumber;

            if (value === `auto`) {

                unit = constants.UNIT_AUTO;
                asNumber = undefined;

            } else if (value instanceof Value) {

                unit = value.unit;
                asNumber = value.valueOf();

            } else {

                unit = typeof value === `string` && value.endsWith(`%`) ? constants.UNIT_PERCENT : constants.UNIT_POINT;
                asNumber = parseFloat(value);

            }

            if (!Object.prototype.hasOwnProperty.call(methods, unit))
                throw new Error(`Failed to execute "${fnName}": Unsupported unit.`);

            if (asNumber !== undefined) {
                return methods[unit].call(this, ... args, asNumber);
            } else {
                return methods[unit].call(this, ... args);
            }

        });

    }

    patch(lib.Config.prototype, `free`, function () {

        // Since we handle the memory allocation ourselves (via lib.Config.create), we also need to handle the deallocation

	lib.Config.destroy(this);

    });

    patch(lib.Node, `create`, function (_, config) {

        // We decide the constructor we want to call depending on the parameters

        return config ? lib.Node.createWithConfig(config) : lib.Node.createDefault();

    });

    patch(lib.Node.prototype, `free`, function () {

        // Since we handle the memory allocation ourselves (via lib.Node.create), we also need to handle the deallocation

        lib.Node.destroy(this);

    });

    patch(lib.Node.prototype, `freeRecursive`, function () {

        for (let t = 0, T = this.getChildCount(); t < T; ++t)
            this.getChild(0).freeRecursive();

        this.free();

    });

    patch(lib.Node.prototype, `setMeasureFunc`, function (original, measureFunc) {

        // This patch is just a convenience patch, since it helps write more idiomatic source code (such as .setMeasureFunc(null))
        // We also automatically convert the return value of the measureFunc to a Size object, so that we can return anything that has .width and .height properties

        if (measureFunc) {
            return original.call(this, (... args) => Size.fromJS(measureFunc(... args)));
        } else {
            return this.unsetMeasureFunc();
        }

    });

    patch(lib.Node.prototype, `calculateLayout`, function (original, width = constants.UNDEFINED, height = constants.UNDEFINED, direction = constants.DIRECTION_LTR) {

        // Just a small patch to add support for the function default parameters

        return original.call(this, width, height, direction);

    });

    function getInstanceCount(... args) {

        return lib.getInstanceCount(... args);

    }

    bind(`Layout`, Layout);
    bind(`Size`, Size);
    bind(`Value`, Value);

    return Object.assign({

	Config: lib.Config,
        Node: lib.Node,

        Layout,
        Size,
        Value,

        getInstanceCount

    }, constants);

};

}, 29, null, "yoga-layout/sources/entry-common.js");
__d(/* yoga-layout/sources/YGEnums.js */function(global, require, module, exports) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports = {

  ALIGN_COUNT: 8,
  ALIGN_AUTO: 0,
  ALIGN_FLEX_START: 1,
  ALIGN_CENTER: 2,
  ALIGN_FLEX_END: 3,
  ALIGN_STRETCH: 4,
  ALIGN_BASELINE: 5,
  ALIGN_SPACE_BETWEEN: 6,
  ALIGN_SPACE_AROUND: 7,

  DIMENSION_COUNT: 2,
  DIMENSION_WIDTH: 0,
  DIMENSION_HEIGHT: 1,

  DIRECTION_COUNT: 3,
  DIRECTION_INHERIT: 0,
  DIRECTION_LTR: 1,
  DIRECTION_RTL: 2,

  DISPLAY_COUNT: 2,
  DISPLAY_FLEX: 0,
  DISPLAY_NONE: 1,

  EDGE_COUNT: 9,
  EDGE_LEFT: 0,
  EDGE_TOP: 1,
  EDGE_RIGHT: 2,
  EDGE_BOTTOM: 3,
  EDGE_START: 4,
  EDGE_END: 5,
  EDGE_HORIZONTAL: 6,
  EDGE_VERTICAL: 7,
  EDGE_ALL: 8,

  EXPERIMENTAL_FEATURE_COUNT: 1,
  EXPERIMENTAL_FEATURE_WEB_FLEX_BASIS: 0,

  FLEX_DIRECTION_COUNT: 4,
  FLEX_DIRECTION_COLUMN: 0,
  FLEX_DIRECTION_COLUMN_REVERSE: 1,
  FLEX_DIRECTION_ROW: 2,
  FLEX_DIRECTION_ROW_REVERSE: 3,

  JUSTIFY_COUNT: 5,
  JUSTIFY_FLEX_START: 0,
  JUSTIFY_CENTER: 1,
  JUSTIFY_FLEX_END: 2,
  JUSTIFY_SPACE_BETWEEN: 3,
  JUSTIFY_SPACE_AROUND: 4,

  LOG_LEVEL_COUNT: 6,
  LOG_LEVEL_ERROR: 0,
  LOG_LEVEL_WARN: 1,
  LOG_LEVEL_INFO: 2,
  LOG_LEVEL_DEBUG: 3,
  LOG_LEVEL_VERBOSE: 4,
  LOG_LEVEL_FATAL: 5,

  MEASURE_MODE_COUNT: 3,
  MEASURE_MODE_UNDEFINED: 0,
  MEASURE_MODE_EXACTLY: 1,
  MEASURE_MODE_AT_MOST: 2,

  NODE_TYPE_COUNT: 2,
  NODE_TYPE_DEFAULT: 0,
  NODE_TYPE_TEXT: 1,

  OVERFLOW_COUNT: 3,
  OVERFLOW_VISIBLE: 0,
  OVERFLOW_HIDDEN: 1,
  OVERFLOW_SCROLL: 2,

  POSITION_TYPE_COUNT: 2,
  POSITION_TYPE_RELATIVE: 0,
  POSITION_TYPE_ABSOLUTE: 1,

  PRINT_OPTIONS_COUNT: 3,
  PRINT_OPTIONS_LAYOUT: 1,
  PRINT_OPTIONS_STYLE: 2,
  PRINT_OPTIONS_CHILDREN: 4,

  UNIT_COUNT: 4,
  UNIT_UNDEFINED: 0,
  UNIT_POINT: 1,
  UNIT_PERCENT: 2,
  UNIT_AUTO: 3,

  WRAP_COUNT: 3,
  WRAP_NO_WRAP: 0,
  WRAP_WRAP: 1,
  WRAP_WRAP_REVERSE: 2,

};

}, 30, null, "yoga-layout/sources/YGEnums.js");
__d(/* RCTView */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _class;

var _UIView = require(23      ); // 23 = UIView

var _UIView2 = babelHelpers.interopRequireDefault(_UIView);

var _CustomElement = require(24             ); // 24 = CustomElement

var _CustomElement2 = babelHelpers.interopRequireDefault(_CustomElement);

let RCTView = (_dec = (0, _CustomElement2.default)("rct-view"), _dec(_class = class RCTView extends _UIView2.default {
  constructor() {
    super(_UIView.FrameZero);
  }
}) || _class);
exports.default = RCTView;
}, 31, null, "RCTView");
__d(/* RCTComponent */function(global, require, module, exports) {"use strict";
}, 32, null, "RCTComponent");
__d(/* RCTEventDispatcher */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RCTTextEventType = undefined;

var _class;

exports.normalizeInputEventName = normalizeInputEventName;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

const RCTTextEventType = exports.RCTTextEventType = {
  RCTTextEventTypeFocus: 0,
  RCTTextEventTypeBlur: 1,
  RCTTextEventTypeChange: 2,
  RCTTextEventTypeSubmit: 3,
  RCTTextEventTypeEnd: 4,
  RCTTextEventTypeKeyPress: 5
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function normalizeInputEventName(eventName) {
  if (eventName.startsWith("on")) {
    eventName = `top${eventName.substring(2)}`;
  } else if (!eventName.startsWith("top")) {
    eventName = `top${capitalizeFirstLetter(eventName)}`;
  }

  return eventName;
}

function stringToHash(input) {
  let hash = 0,
      chr;
  if (input.length === 0) return hash;
  for (let i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

let RCTEventDispatcher = (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = class RCTEventDispatcher {

  static RCTGetEventID(event) {
    return event.viewTag | (stringToHash(event.eventName) & 0xffff) << 32 | event.coalescingKey << 48;
  }

  constructor(bridge) {
    this.bridge = bridge;
    this.events = {};
    this.eventQueue = [];
    this.eventsDispatchScheduled = false;
  }

  sendInputEvent(name, body) {
    name = normalizeInputEventName(name);
    this.bridge.enqueueJSCall("RCTEventEmitter", "receiveEvent", [body.target, name, body]);
  }

  sendTextEvent(type, reactTag, text, key, eventCount) {
    const events = ["focus", "blur", "change", "submitEditing", "endEditing", "keyPress"];

    const body = {
      eventCount,
      target: reactTag
    };

    if (text) {
      body.text = text;
    }

    if (key) {}

    this.sendInputEvent(events[type], body);
  }

  sendEvent(event) {
    const eventID = RCTEventDispatcher.RCTGetEventID(event);

    const previousEvent = this.events[eventID];
    if (previousEvent) {
      (0, _Invariant2.default)(event.canCoalesce(), `Got event which cannot be coalesced, but has the same eventID ${eventID} as the previous event`);
      event = previousEvent.coalesceWithEvent(previousEvent);
    } else {
      this.eventQueue.push(eventID);
    }

    this.events[eventID] = event;

    let scheduleEventsDispatch = false;
    if (!this.eventsDispatchScheduled) {
      this.eventsDispatchScheduled = true;
      scheduleEventsDispatch = true;
    }

    if (scheduleEventsDispatch) {
      this.flushEventsQueue();
    }
  }

  dispatchEvent(event) {
    this.bridge.enqueueJSCallWithDotMethod(event.moduleDotMethod(), event.arguments());
  }

  flushEventsQueue() {
    const events = babelHelpers.extends({}, this.events);
    this.events = {};

    const eventQueue = [...this.eventQueue];
    this.eventQueue = [];

    this.eventsDispatchScheduled = false;

    eventQueue.forEach(eventId => {
      this.dispatchEvent(events[eventId]);
    });
  }
}) || _class;

exports.default = RCTEventDispatcher;
}, 33, null, "RCTEventDispatcher");
__d(/* RCTDeviceInfo */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _class;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _RCTNativeEventEmitter = require(35                     ); // 35 = RCTNativeEventEmitter

var _RCTNativeEventEmitter2 = babelHelpers.interopRequireDefault(_RCTNativeEventEmitter);

let RCTDeviceInfo = (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = class RCTDeviceInfo extends _RCTNativeEventEmitter2.default {
  constructor(bridge) {
    super(bridge);

    window.addEventListener("resize", this.didUpdateDimensions.bind(this), false);

    this.listenerCount = 1;
  }

  constantsToExport() {
    return {
      Dimensions: this.exportedDimensions()
    };
  }

  supportedEvents() {
    return ["didUpdateDimensions"];
  }

  exportedDimensions() {
    const dims = {
      width: Math.ceil(window.innerWidth),
      height: Math.ceil(window.innerHeight),
      scale: this.getDevicePixelRatio(),
      fontScale: 1
    };

    return {
      window: dims,
      screen: dims
    };
  }

  getDevicePixelRatio() {
    let ratio = 1;

    if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
      ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    } else if (window.devicePixelRatio !== undefined) {
      ratio = window.devicePixelRatio;
    }
    return ratio;
  }

  didUpdateDimensions() {
    this.sendEventWithName("didUpdateDimensions", this.exportedDimensions());
  }
}) || _class;

exports.default = RCTDeviceInfo;
}, 34, null, "RCTDeviceInfo");
__d(/* RCTNativeEventEmitter */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _dec2, _desc, _value, _class;

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _NotificationCenter = require(36                  ); // 36 = NotificationCenter

var _NotificationCenter2 = babelHelpers.interopRequireDefault(_NotificationCenter);

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let RCTEventEmitter = (_dec = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec2 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), (_class = class RCTEventEmitter {

  constructor(bridge) {
    this.listenerCount = 0;

    this.bridge = bridge;
  }

  supportedMethods() {
    return undefined;
  }

  sendEventWithName(eventName, body) {
    (0, _Invariant2.default)(this.bridge, "bridge is not set. This is probably because you've" + `explicitly synthesized the bridge in ${this.constructor.name}, even though it's inherited ` + "from RCTEventEmitter.");

    if (this.listenerCount > 0) {
      this.bridge.enqueueJSCall("RCTDeviceEventEmitter", "emit", body ? [eventName, body] : [eventName], null);
      _NotificationCenter2.default.emitEvent(eventName, [body]);
    } else {
      console.warn(`Sending ${eventName} with no listeners registered`);
    }
  }

  startObserving() {}

  stopObserving() {}

  addListener(eventName, callback) {

    if (callback != null) {
      _NotificationCenter2.default.addListener(eventName, callback);
    }

    this.listenerCount++;
    if (this.listenerCount === 1) {
      this.startObserving();
    }
  }

  removeListener(eventName, callback) {
    _NotificationCenter2.default.removeListener(eventName, callback);
    this.removeListeners(1);
  }

  removeListeners(count) {

    this.listenerCount = Math.max(this.listenerCount - count, 0);
    if (this.listenerCount === 0) {
      this.stopObserving();
    }
  }
}, (_applyDecoratedDescriptor(_class.prototype, "addListener", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "addListener"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "removeListeners", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "removeListeners"), _class.prototype)), _class));
exports.default = RCTEventEmitter;
}, 35, null, "RCTNativeEventEmitter");
__d(/* NotificationCenter */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _wolfy87Eventemitter = require(37                    ); // 37 = wolfy87-eventemitter

var _wolfy87Eventemitter2 = babelHelpers.interopRequireDefault(_wolfy87Eventemitter);

let NotificationCenter = class NotificationCenter extends _wolfy87Eventemitter2.default {};
exports.default = new NotificationCenter();
}, 36, null, "NotificationCenter");
__d(/* wolfy87-eventemitter/EventEmitter.js */function(global, require, module, exports) {'use strict';

/*!
 * EventEmitter v5.1.0 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function (exports) {
    'use strict';

    function EventEmitter() {}

    var proto = EventEmitter.prototype;
    var originalGlobalValue = exports.EventEmitter;

    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        } else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    function isValidListener(listener) {
        if (typeof listener === 'function' || listener instanceof RegExp) {
            return true;
        } else if (listener && typeof listener === 'object') {
            return isValidListener(listener.listener);
        } else {
            return false;
        }
    }

    proto.addListener = function addListener(evt, listener) {
        if (!isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    proto.on = alias('addListener');

    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    proto.once = alias('addOnceListener');

    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    proto.off = alias('removeListener');

    proto.addListeners = function addListeners(evt, listeners) {
        return this.manipulateListeners(false, evt, listeners);
    };

    proto.removeListeners = function removeListeners(evt, listeners) {
        return this.manipulateListeners(true, evt, listeners);
    };

    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    } else {
                        multiple.call(this, i, value);
                    }
                }
            }
        } else {
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        if (type === 'string') {
            delete events[evt];
        } else if (evt instanceof RegExp) {
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        } else {
            delete this._events;
        }

        return this;
    };

    proto.removeAllListeners = alias('removeEvent');

    proto.emitEvent = function emitEvent(evt, args) {
        var listenersMap = this.getListenersAsObject(evt);
        var listeners;
        var listener;
        var i;
        var key;
        var response;

        for (key in listenersMap) {
            if (listenersMap.hasOwnProperty(key)) {
                listeners = listenersMap[key].slice(0);

                for (i = 0; i < listeners.length; i++) {
                    listener = listeners[i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    proto.trigger = alias('emitEvent');

    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        } else {
            return true;
        }
    };

    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = EventEmitter;
    } else {
        exports.EventEmitter = EventEmitter;
    }
})(undefined || {});
}, 37, null, "wolfy87-eventemitter/EventEmitter.js");
__d(/* RCTRootShadowView */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _RCTShadowView = require(25             ); // 25 = RCTShadowView

var _RCTShadowView2 = babelHelpers.interopRequireDefault(_RCTShadowView);

let RCTRootShadowView = class RCTRootShadowView extends _RCTShadowView2.default {

  constructor() {
    super();
    this.availableSize = { width: Infinity, height: Infinity };
  }

  updateAvailableSize(size) {
    this.availableSize = size;
    this.makeDirtyRecursive();
  }

  recalculateLayout() {
    const { width, height } = this.availableSize;
    this.yogaNode.calculateLayout(width, height);

    const layoutChanges = this.getLayoutChanges({
      top: 0,
      left: 0
    });

    return layoutChanges;
  }
};
exports.default = RCTRootShadowView;
}, 38, null, "RCTRootShadowView");
__d(/* RCTLayoutAnimationManager */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTKeyframeGenerator = require(40                    ); // 40 = RCTKeyframeGenerator

var _RCTKeyframeGenerator2 = babelHelpers.interopRequireDefault(_RCTKeyframeGenerator);

const PropertiesEnum = {
  opacity: true,
  scaleXY: true
};

const TypesEnum = {
  spring: true,
  linear: true,
  easeInEaseOut: true,
  easeIn: true,
  easeOut: true
};

let RCTLayoutAnimationManager = class RCTLayoutAnimationManager {

  constructor(manager) {
    this.manager = manager;
    this.reset();
  }

  configureNext(config, callback) {
    this.pendingConfig = config;
    this.pendingCallback = callback;
  }

  reset() {
    this.removedNodes = [];
    this.layoutChanges = [];
    this.pendingConfig = undefined;
    this.pendingCallback = undefined;
  }

  isPending() {
    return this.pendingConfig != null;
  }

  addLayoutChanges(changes) {
    this.layoutChanges = this.layoutChanges.concat(changes);
  }

  queueRemovedNode(tag) {
    this.removedNodes.push(tag);
  }

  constructKeyframes(config) {
    const { create, update, delete: del, duration } = config;

    const keyframes = {
      create: (0, _RCTKeyframeGenerator2.default)(create, duration),
      update: (0, _RCTKeyframeGenerator2.default)(update, duration),
      delete: (0, _RCTKeyframeGenerator2.default)(del, duration)
    };

    return keyframes;
  }

  createOpacityKeyframes(from, to, keyframes) {
    return keyframes.map(keyframe => ({
      opacity: `${to + (from - to) * (1 - keyframe)}`
    }));
  }

  createAnimationKeyframes(from, to, keyframes, propName, existingKeyframes) {
    return existingKeyframes.map((existingKeyframe, index) => {
      let newValue = to + (from - to) * (1 - keyframes[index]);

      if (["width", "height"].includes(propName)) {
        if (newValue < 0) {
          newValue = 0;
        } else {
          newValue = Math.ceil(newValue);
        }
      }

      return babelHelpers.extends({}, existingKeyframe, {
        [propName]: `${newValue}px`
      });
    });
  }

  runAnimations(keyframes, config) {
    const animations = [];

    const {
      create: createKeyConfig,
      update: updateKeyConfig,
      delete: deleteKeyConfig
    } = keyframes;

    this.layoutChanges.forEach(layoutChange => {
      const {
        reactTag,
        layout,
        nextMeasurement,
        previousMeasurement
      } = layoutChange;

      const view = this.manager.viewRegistry.get(reactTag);

      (0, _Invariant2.default)(view, "view does not exist");

      if (!previousMeasurement) {
        const keyframes = this.createOpacityKeyframes(0, 1, createKeyConfig.keyframes);
        const config = {
          duration: createKeyConfig.duration
        };

        view.style.willChange = "opacity";

        animations.push(() => {
          view.frame = layout;

          const animation = view.animate(keyframes, config);

          animation.onfinish = () => {
            view.style.willChange = "";
          };

          return animation.finished;
        });
      } else {
        let keyframes = new Array(updateKeyConfig.keyframes.length).fill({
          translateX: `${layout.left}px`,
          translateY: `${layout.top}px`
        });

        const {
          left: nextLeft,
          top: nextTop,
          width: nextWidth,
          height: nextHeight
        } = nextMeasurement;

        const {
          left: prevLeft,
          top: prevTop,
          width: prevWidth,
          height: prevHeight
        } = previousMeasurement;

        const { top, left, width, height } = view.frame;

        if (prevLeft !== nextLeft) {
          keyframes = this.createAnimationKeyframes(left, layout.left, updateKeyConfig.keyframes, "translateX", keyframes);
        }
        if (prevTop !== nextTop) {
          keyframes = this.createAnimationKeyframes(top, layout.top, updateKeyConfig.keyframes, "translateY", keyframes);
        }
        if (prevWidth !== nextWidth) {
          keyframes = this.createAnimationKeyframes(width, layout.width, updateKeyConfig.keyframes, "width", keyframes);
        }
        if (prevHeight !== nextHeight) {
          keyframes = this.createAnimationKeyframes(height, layout.height, updateKeyConfig.keyframes, "height", keyframes);
        }

        keyframes = keyframes.map(frame => {
          const { translateX, translateY } = frame,
                rest = babelHelpers.objectWithoutProperties(frame, ["translateX", "translateY"]);

          let translateString = "";
          translateString += translateX ? `translateX(${translateX}) ` : "";
          translateString += translateY ? `translateY(${translateY}) ` : "";

          return babelHelpers.extends({}, rest, {
            transform: translateString
          });
        });

        const config = {
          duration: updateKeyConfig.duration,
          fill: "backwards"
        };

        view.style.willChange = "transform, width, height";

        animations.push(() => {
          view.frame = layout;

          const animation = view.animate(keyframes, config);

          animation.onfinish = () => {
            view.style.willChange = "";
          };

          return animation.finished;
        });
      }

      this.removedNodes.forEach(reactTag => {
        const view = this.manager.viewRegistry.get(reactTag);
        (0, _Invariant2.default)(view, "view does not exist");

        const keyframes = this.createOpacityKeyframes(1, 0, deleteKeyConfig.keyframes);
        const config = {
          duration: deleteKeyConfig.duration
        };

        view.style.willChange = "opacity";

        animations.push(() => {
          const animation = view.animate(keyframes, config);

          animation.onfinish = () => {
            view.style.willChange = "";
            this.manager.viewRegistry.delete(reactTag);
            view.purge();
          };

          return animation.finished;
        });
      });
    });

    return animations;
  }

  applyLayoutChanges() {
    const pendingConfig = this.pendingConfig;
    const layoutChanges = this.layoutChanges;
    const callback = this.pendingCallback;

    (0, _Invariant2.default)(pendingConfig && layoutChanges && callback, "Attempting to apply a layoutanimation without a pending config.");

    const keyframes = this.constructKeyframes(pendingConfig);
    const animations = this.runAnimations(keyframes, pendingConfig);

    this.manager.addUIBlock(() => {
      Promise.all(animations.map(f => f())).then(() => {
        callback();
      });
      this.reset();
    });
  }
};
exports.default = RCTLayoutAnimationManager;
}, 39, null, "RCTLayoutAnimationManager");
__d(/* RCTKeyframeGenerator */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bezierEasing = require(41             ); // 41 = bezier-easing

var _bezierEasing2 = babelHelpers.interopRequireDefault(_bezierEasing);

var _rebound = require(42       ); // 42 = rebound

var _rebound2 = babelHelpers.interopRequireDefault(_rebound);

var _fastMemoize = require(43            ); // 43 = fast-memoize

var _fastMemoize2 = babelHelpers.interopRequireDefault(_fastMemoize);

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

const timestepCoefficient = 1;

const staticEasingFunctions = {
  linear: x => x,
  easeIn: (0, _bezierEasing2.default)(0.42, 0, 1, 1),
  easeOut: (0, _bezierEasing2.default)(0, 0, 0.58, 1),
  easeInEaseOut: (0, _bezierEasing2.default)(0.42, 0, 0.58, 1)
};

const springTimestep = 16.667 * timestepCoefficient;

function generateStaticKeyframes(ease, duration) {
  const numSteps = duration / springTimestep;
  const timestep = 1.0 / numSteps;

  const keyframes = [];

  let currentX = 0;
  for (let i = 0; i < numSteps; i++) {
    keyframes.push(ease(currentX));
    currentX += timestep;
  }

  keyframes.push(1);

  return { keyframes, duration };
}

const looper = new _rebound2.default.SimulationLooper(springTimestep);
const springSystem = new _rebound2.default.SpringSystem(looper);

function generateSpringKeyframes(springDamping, initialVelocity = 0) {
  const mass = 1;
  const tension = 40;
  const friction = springDamping * (2 * Math.sqrt(mass * tension));

  const springConfig = _rebound2.default.SpringConfig.fromOrigamiTensionAndFriction(tension, friction);
  const spring = springSystem.createSpringWithConfig(springConfig);

  const result = [];
  function readStep(spring) {
    result.push(spring.getCurrentValue());
  }

  spring.addListener({ onSpringUpdate: readStep });
  spring._endValue = 1.0;
  spring._currentState.velocity = initialVelocity;
  springSystem.activateSpring(spring.getId());
  spring.removeAllListeners();

  const springDuration = result.length * springTimestep;

  return { keyframes: result, duration: springDuration };
}

const generateKeyframes = (0, _fastMemoize2.default)((config, duration) => {
  const { type, springDamping, initialVelocity } = config;

  if (type && type !== "spring") {
    const easingFunction = staticEasingFunctions[type];
    const resolvedDuration = config.duration ? config.duration : duration;

    return generateStaticKeyframes(easingFunction, resolvedDuration);
  }

  if (type && type === "spring" && springDamping) {
    return generateSpringKeyframes(springDamping, initialVelocity);
  }

  (0, _Invariant2.default)(false, "Invalid layoutAnimation configuration provided");
});

exports.default = generateKeyframes;
}, 40, null, "RCTKeyframeGenerator");
__d(/* bezier-easing/src/index.js */function(global, require, module, exports) {'use strict';

var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1) {
  return 3.0 * aA1;
}

function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  var currentX,
      currentT,
      i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
    var currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessT;
    }
    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}

module.exports = function bezier(mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX(aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing(x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x;
    }

    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};
}, 41, null, "bezier-easing/src/index.js");
__d(/* rebound/rebound.js */function(global, require, module, exports) {'use strict';

(function () {
  var rebound = {};
  var util = rebound.util = {};
  var concat = Array.prototype.concat;
  var slice = Array.prototype.slice;

  util.bind = function bind(func, context) {
    var args = slice.call(arguments, 2);
    return function () {
      func.apply(context, concat.call(args, slice.call(arguments)));
    };
  };

  util.extend = function extend(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  };

  var SpringSystem = rebound.SpringSystem = function SpringSystem(looper) {
    this._springRegistry = {};
    this._activeSprings = [];
    this.listeners = [];
    this._idleSpringIndices = [];
    this.looper = looper || new AnimationLooper();
    this.looper.springSystem = this;
  };

  util.extend(SpringSystem.prototype, {

    _springRegistry: null,

    _isIdle: true,

    _lastTimeMillis: -1,

    _activeSprings: null,

    listeners: null,

    _idleSpringIndices: null,

    setLooper: function (looper) {
      this.looper = looper;
      looper.springSystem = this;
    },

    createSpring: function (tension, friction) {
      var springConfig;
      if (tension === undefined || friction === undefined) {
        springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
      } else {
        springConfig = SpringConfig.fromOrigamiTensionAndFriction(tension, friction);
      }
      return this.createSpringWithConfig(springConfig);
    },

    createSpringWithBouncinessAndSpeed: function (bounciness, speed) {
      var springConfig;
      if (bounciness === undefined || speed === undefined) {
        springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
      } else {
        springConfig = SpringConfig.fromBouncinessAndSpeed(bounciness, speed);
      }
      return this.createSpringWithConfig(springConfig);
    },

    createSpringWithConfig: function (springConfig) {
      var spring = new Spring(this);
      this.registerSpring(spring);
      spring.setSpringConfig(springConfig);
      return spring;
    },

    getIsIdle: function () {
      return this._isIdle;
    },

    getSpringById: function (id) {
      return this._springRegistry[id];
    },

    getAllSprings: function () {
      var vals = [];
      for (var id in this._springRegistry) {
        if (this._springRegistry.hasOwnProperty(id)) {
          vals.push(this._springRegistry[id]);
        }
      }
      return vals;
    },

    registerSpring: function (spring) {
      this._springRegistry[spring.getId()] = spring;
    },

    deregisterSpring: function (spring) {
      removeFirst(this._activeSprings, spring);
      delete this._springRegistry[spring.getId()];
    },

    advance: function (time, deltaTime) {
      while (this._idleSpringIndices.length > 0) this._idleSpringIndices.pop();
      for (var i = 0, len = this._activeSprings.length; i < len; i++) {
        var spring = this._activeSprings[i];
        if (spring.systemShouldAdvance()) {
          spring.advance(time / 1000.0, deltaTime / 1000.0);
        } else {
          this._idleSpringIndices.push(this._activeSprings.indexOf(spring));
        }
      }
      while (this._idleSpringIndices.length > 0) {
        var idx = this._idleSpringIndices.pop();
        idx >= 0 && this._activeSprings.splice(idx, 1);
      }
    },

    loop: function (currentTimeMillis) {
      var listener;
      if (this._lastTimeMillis === -1) {
        this._lastTimeMillis = currentTimeMillis - 1;
      }
      var ellapsedMillis = currentTimeMillis - this._lastTimeMillis;
      this._lastTimeMillis = currentTimeMillis;

      var i = 0,
          len = this.listeners.length;
      for (i = 0; i < len; i++) {
        listener = this.listeners[i];
        listener.onBeforeIntegrate && listener.onBeforeIntegrate(this);
      }

      this.advance(currentTimeMillis, ellapsedMillis);
      if (this._activeSprings.length === 0) {
        this._isIdle = true;
        this._lastTimeMillis = -1;
      }

      for (i = 0; i < len; i++) {
        listener = this.listeners[i];
        listener.onAfterIntegrate && listener.onAfterIntegrate(this);
      }

      if (!this._isIdle) {
        this.looper.run();
      }
    },

    activateSpring: function (springId) {
      var spring = this._springRegistry[springId];
      if (this._activeSprings.indexOf(spring) == -1) {
        this._activeSprings.push(spring);
      }
      if (this.getIsIdle()) {
        this._isIdle = false;
        this.looper.run();
      }
    },

    addListener: function (listener) {
      this.listeners.push(listener);
    },

    removeListener: function (listener) {
      removeFirst(this.listeners, listener);
    },

    removeAllListeners: function () {
      this.listeners = [];
    }

  });

  var Spring = rebound.Spring = function Spring(springSystem) {
    this._id = 's' + Spring._ID++;
    this._springSystem = springSystem;
    this.listeners = [];
    this._currentState = new PhysicsState();
    this._previousState = new PhysicsState();
    this._tempState = new PhysicsState();
  };

  util.extend(Spring, {
    _ID: 0,

    MAX_DELTA_TIME_SEC: 0.064,

    SOLVER_TIMESTEP_SEC: 0.001

  });

  util.extend(Spring.prototype, {

    _id: 0,

    _springConfig: null,

    _overshootClampingEnabled: false,

    _currentState: null,

    _previousState: null,

    _tempState: null,

    _startValue: 0,

    _endValue: 0,

    _wasAtRest: true,

    _restSpeedThreshold: 0.001,

    _displacementFromRestThreshold: 0.001,

    listeners: null,

    _timeAccumulator: 0,

    _springSystem: null,

    destroy: function () {
      this.listeners = [];
      this.frames = [];
      this._springSystem.deregisterSpring(this);
    },

    getId: function () {
      return this._id;
    },

    setSpringConfig: function (springConfig) {
      this._springConfig = springConfig;
      return this;
    },

    getSpringConfig: function () {
      return this._springConfig;
    },

    setCurrentValue: function (currentValue, skipSetAtRest) {
      this._startValue = currentValue;
      this._currentState.position = currentValue;
      if (!skipSetAtRest) {
        this.setAtRest();
      }
      this.notifyPositionUpdated(false, false);
      return this;
    },

    getStartValue: function () {
      return this._startValue;
    },

    getCurrentValue: function () {
      return this._currentState.position;
    },

    getCurrentDisplacementDistance: function () {
      return this.getDisplacementDistanceForState(this._currentState);
    },

    getDisplacementDistanceForState: function (state) {
      return Math.abs(this._endValue - state.position);
    },

    setEndValue: function (endValue) {
      if (this._endValue == endValue && this.isAtRest()) {
        return this;
      }
      this._startValue = this.getCurrentValue();
      this._endValue = endValue;
      this._springSystem.activateSpring(this.getId());
      for (var i = 0, len = this.listeners.length; i < len; i++) {
        var listener = this.listeners[i];
        var onChange = listener.onSpringEndStateChange;
        onChange && onChange(this);
      }
      return this;
    },

    getEndValue: function () {
      return this._endValue;
    },

    setVelocity: function (velocity) {
      if (velocity === this._currentState.velocity) {
        return this;
      }
      this._currentState.velocity = velocity;
      this._springSystem.activateSpring(this.getId());
      return this;
    },

    getVelocity: function () {
      return this._currentState.velocity;
    },

    setRestSpeedThreshold: function (restSpeedThreshold) {
      this._restSpeedThreshold = restSpeedThreshold;
      return this;
    },

    getRestSpeedThreshold: function () {
      return this._restSpeedThreshold;
    },

    setRestDisplacementThreshold: function (displacementFromRestThreshold) {
      this._displacementFromRestThreshold = displacementFromRestThreshold;
    },

    getRestDisplacementThreshold: function () {
      return this._displacementFromRestThreshold;
    },

    setOvershootClampingEnabled: function (enabled) {
      this._overshootClampingEnabled = enabled;
      return this;
    },

    isOvershootClampingEnabled: function () {
      return this._overshootClampingEnabled;
    },

    isOvershooting: function () {
      var start = this._startValue;
      var end = this._endValue;
      return this._springConfig.tension > 0 && (start < end && this.getCurrentValue() > end || start > end && this.getCurrentValue() < end);
    },

    advance: function (time, realDeltaTime) {
      var isAtRest = this.isAtRest();

      if (isAtRest && this._wasAtRest) {
        return;
      }

      var adjustedDeltaTime = realDeltaTime;
      if (realDeltaTime > Spring.MAX_DELTA_TIME_SEC) {
        adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;
      }

      this._timeAccumulator += adjustedDeltaTime;

      var tension = this._springConfig.tension,
          friction = this._springConfig.friction,
          position = this._currentState.position,
          velocity = this._currentState.velocity,
          tempPosition = this._tempState.position,
          tempVelocity = this._tempState.velocity,
          aVelocity,
          aAcceleration,
          bVelocity,
          bAcceleration,
          cVelocity,
          cAcceleration,
          dVelocity,
          dAcceleration,
          dxdt,
          dvdt;

      while (this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {

        this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

        if (this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC) {
          this._previousState.position = position;
          this._previousState.velocity = velocity;
        }

        aVelocity = velocity;
        aAcceleration = tension * (this._endValue - tempPosition) - friction * velocity;

        tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
        tempVelocity = velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
        bVelocity = tempVelocity;
        bAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

        tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
        tempVelocity = velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
        cVelocity = tempVelocity;
        cAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

        tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
        tempVelocity = velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
        dVelocity = tempVelocity;
        dAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

        dxdt = 1.0 / 6.0 * (aVelocity + 2.0 * (bVelocity + cVelocity) + dVelocity);
        dvdt = 1.0 / 6.0 * (aAcceleration + 2.0 * (bAcceleration + cAcceleration) + dAcceleration);

        position += dxdt * Spring.SOLVER_TIMESTEP_SEC;
        velocity += dvdt * Spring.SOLVER_TIMESTEP_SEC;
      }

      this._tempState.position = tempPosition;
      this._tempState.velocity = tempVelocity;

      this._currentState.position = position;
      this._currentState.velocity = velocity;

      if (this._timeAccumulator > 0) {
        this._interpolate(this._timeAccumulator / Spring.SOLVER_TIMESTEP_SEC);
      }

      if (this.isAtRest() || this._overshootClampingEnabled && this.isOvershooting()) {

        if (this._springConfig.tension > 0) {
          this._startValue = this._endValue;
          this._currentState.position = this._endValue;
        } else {
          this._endValue = this._currentState.position;
          this._startValue = this._endValue;
        }
        this.setVelocity(0);
        isAtRest = true;
      }

      var notifyActivate = false;
      if (this._wasAtRest) {
        this._wasAtRest = false;
        notifyActivate = true;
      }

      var notifyAtRest = false;
      if (isAtRest) {
        this._wasAtRest = true;
        notifyAtRest = true;
      }

      this.notifyPositionUpdated(notifyActivate, notifyAtRest);
    },

    notifyPositionUpdated: function (notifyActivate, notifyAtRest) {
      for (var i = 0, len = this.listeners.length; i < len; i++) {
        var listener = this.listeners[i];
        if (notifyActivate && listener.onSpringActivate) {
          listener.onSpringActivate(this);
        }

        if (listener.onSpringUpdate) {
          listener.onSpringUpdate(this);
        }

        if (notifyAtRest && listener.onSpringAtRest) {
          listener.onSpringAtRest(this);
        }
      }
    },

    systemShouldAdvance: function () {
      return !this.isAtRest() || !this.wasAtRest();
    },

    wasAtRest: function () {
      return this._wasAtRest;
    },

    isAtRest: function () {
      return Math.abs(this._currentState.velocity) < this._restSpeedThreshold && (this.getDisplacementDistanceForState(this._currentState) <= this._displacementFromRestThreshold || this._springConfig.tension === 0);
    },

    setAtRest: function () {
      this._endValue = this._currentState.position;
      this._tempState.position = this._currentState.position;
      this._currentState.velocity = 0;
      return this;
    },

    _interpolate: function (alpha) {
      this._currentState.position = this._currentState.position * alpha + this._previousState.position * (1 - alpha);
      this._currentState.velocity = this._currentState.velocity * alpha + this._previousState.velocity * (1 - alpha);
    },

    getListeners: function () {
      return this.listeners;
    },

    addListener: function (newListener) {
      this.listeners.push(newListener);
      return this;
    },

    removeListener: function (listenerToRemove) {
      removeFirst(this.listeners, listenerToRemove);
      return this;
    },

    removeAllListeners: function () {
      this.listeners = [];
      return this;
    },

    currentValueIsApproximately: function (value) {
      return Math.abs(this.getCurrentValue() - value) <= this.getRestDisplacementThreshold();
    }

  });

  var PhysicsState = function PhysicsState() {};

  util.extend(PhysicsState.prototype, {
    position: 0,
    velocity: 0
  });

  var SpringConfig = rebound.SpringConfig = function SpringConfig(tension, friction) {
    this.tension = tension;
    this.friction = friction;
  };

  var AnimationLooper = rebound.AnimationLooper = function AnimationLooper() {
    this.springSystem = null;
    var _this = this;
    var _run = function () {
      _this.springSystem.loop(Date.now());
    };

    this.run = function () {
      util.onFrame(_run);
    };
  };

  rebound.SimulationLooper = function SimulationLooper(timestep) {
    this.springSystem = null;
    var time = 0;
    var running = false;
    timestep = timestep || 16.667;

    this.run = function () {
      if (running) {
        return;
      }
      running = true;
      while (!this.springSystem.getIsIdle()) {
        this.springSystem.loop(time += timestep);
      }
      running = false;
    };
  };

  rebound.SteppingSimulationLooper = function (timestep) {
    this.springSystem = null;
    var time = 0;

    this.run = function () {};

    this.step = function (timestep) {
      this.springSystem.loop(time += timestep);
    };
  };

  var OrigamiValueConverter = rebound.OrigamiValueConverter = {
    tensionFromOrigamiValue: function (oValue) {
      return (oValue - 30.0) * 3.62 + 194.0;
    },

    origamiValueFromTension: function (tension) {
      return (tension - 194.0) / 3.62 + 30.0;
    },

    frictionFromOrigamiValue: function (oValue) {
      return (oValue - 8.0) * 3.0 + 25.0;
    },

    origamiFromFriction: function (friction) {
      return (friction - 25.0) / 3.0 + 8.0;
    }
  };

  var BouncyConversion = rebound.BouncyConversion = function (bounciness, speed) {
    this.bounciness = bounciness;
    this.speed = speed;
    var b = this.normalize(bounciness / 1.7, 0, 20.0);
    b = this.projectNormal(b, 0.0, 0.8);
    var s = this.normalize(speed / 1.7, 0, 20.0);
    this.bouncyTension = this.projectNormal(s, 0.5, 200);
    this.bouncyFriction = this.quadraticOutInterpolation(b, this.b3Nobounce(this.bouncyTension), 0.01);
  };

  util.extend(BouncyConversion.prototype, {

    normalize: function (value, startValue, endValue) {
      return (value - startValue) / (endValue - startValue);
    },

    projectNormal: function (n, start, end) {
      return start + n * (end - start);
    },

    linearInterpolation: function (t, start, end) {
      return t * end + (1.0 - t) * start;
    },

    quadraticOutInterpolation: function (t, start, end) {
      return this.linearInterpolation(2 * t - t * t, start, end);
    },

    b3Friction1: function (x) {
      return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
    },

    b3Friction2: function (x) {
      return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2.;
    },

    b3Friction3: function (x) {
      return 0.00000045 * Math.pow(x, 3) - 0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;
    },

    b3Nobounce: function (tension) {
      var friction = 0;
      if (tension <= 18) {
        friction = this.b3Friction1(tension);
      } else if (tension > 18 && tension <= 44) {
        friction = this.b3Friction2(tension);
      } else {
        friction = this.b3Friction3(tension);
      }
      return friction;
    }
  });

  util.extend(SpringConfig, {
    fromOrigamiTensionAndFriction: function (tension, friction) {
      return new SpringConfig(OrigamiValueConverter.tensionFromOrigamiValue(tension), OrigamiValueConverter.frictionFromOrigamiValue(friction));
    },

    fromBouncinessAndSpeed: function (bounciness, speed) {
      var bouncyConversion = new rebound.BouncyConversion(bounciness, speed);
      return this.fromOrigamiTensionAndFriction(bouncyConversion.bouncyTension, bouncyConversion.bouncyFriction);
    },

    coastingConfigWithOrigamiFriction: function (friction) {
      return new SpringConfig(0, OrigamiValueConverter.frictionFromOrigamiValue(friction));
    }
  });

  SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG = SpringConfig.fromOrigamiTensionAndFriction(40, 7);

  util.extend(SpringConfig.prototype, { friction: 0, tension: 0 });

  var colorCache = {};
  util.hexToRGB = function (color) {
    if (colorCache[color]) {
      return colorCache[color];
    }
    color = color.replace('#', '');
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    var parts = color.match(/.{2}/g);

    var ret = {
      r: parseInt(parts[0], 16),
      g: parseInt(parts[1], 16),
      b: parseInt(parts[2], 16)
    };

    colorCache[color] = ret;
    return ret;
  };

  util.rgbToHex = function (r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    r = r.length < 2 ? '0' + r : r;
    g = g.length < 2 ? '0' + g : g;
    b = b.length < 2 ? '0' + b : b;
    return '#' + r + g + b;
  };

  var MathUtil = rebound.MathUtil = {
    mapValueInRange: function (value, fromLow, fromHigh, toLow, toHigh) {
      var fromRangeSize = fromHigh - fromLow;
      var toRangeSize = toHigh - toLow;
      var valueScale = (value - fromLow) / fromRangeSize;
      return toLow + valueScale * toRangeSize;
    },

    interpolateColor: function (val, startColor, endColor, fromLow, fromHigh, asRGB) {
      fromLow = fromLow === undefined ? 0 : fromLow;
      fromHigh = fromHigh === undefined ? 1 : fromHigh;
      startColor = util.hexToRGB(startColor);
      endColor = util.hexToRGB(endColor);
      var r = Math.floor(util.mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r));
      var g = Math.floor(util.mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g));
      var b = Math.floor(util.mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b));
      if (asRGB) {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      } else {
        return util.rgbToHex(r, g, b);
      }
    },

    degreesToRadians: function (deg) {
      return deg * Math.PI / 180;
    },

    radiansToDegrees: function (rad) {
      return rad * 180 / Math.PI;
    }

  };

  util.extend(util, MathUtil);

  function removeFirst(array, item) {
    var idx = array.indexOf(item);
    idx != -1 && array.splice(idx, 1);
  }

  var _onFrame;
  if (typeof window !== 'undefined') {
    _onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }
  if (!_onFrame && typeof process !== 'undefined' && process.title === 'node') {
    _onFrame = setImmediate;
  }

  util.onFrame = function onFrame(func) {
    return _onFrame(func);
  };

  if (typeof exports != 'undefined') {
    util.extend(exports, rebound);
  } else if (typeof window != 'undefined') {
    window.rebound = rebound;
  }
})();
}, 42, null, "rebound/rebound.js");
__d(/* fast-memoize/src/index.js */function(global, require, module, exports) {'use strict';

module.exports = function memoize(fn, options) {
  var cache = options && options.cache ? options.cache : cacheDefault;

  var serializer = options && options.serializer ? options.serializer : serializerDefault;

  var strategy = options && options.strategy ? options.strategy : strategyDefault;

  return strategy(fn, {
    cache: cache,
    serializer: serializer
  });
};

function isPrimitive(value) {
  return value == null || typeof value !== 'function' && typeof value !== 'object';
}

function monadic(fn, cache, serializer, arg) {
  var cacheKey = isPrimitive(arg) ? arg : serializer(arg);

  if (!cache.has(cacheKey)) {
    var computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
    return computedValue;
  }

  return cache.get(cacheKey);
}

function variadic(fn, cache, serializer) {
  var args = Array.prototype.slice.call(arguments, 3);
  var cacheKey = serializer(args);

  if (!cache.has(cacheKey)) {
    var computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
    return computedValue;
  }

  return cache.get(cacheKey);
}

function strategyDefault(fn, options) {
  var memoized = fn.length === 1 ? monadic : variadic;

  memoized = memoized.bind(this, fn, options.cache.create(), options.serializer);

  return memoized;
}

function serializerDefault() {
  return JSON.stringify(arguments);
}

function ObjectWithoutPrototypeCache() {
  this.cache = Object.create(null);
}

ObjectWithoutPrototypeCache.prototype.has = function (key) {
  return key in this.cache;
};

ObjectWithoutPrototypeCache.prototype.get = function (key) {
  return this.cache[key];
};

ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
  this.cache[key] = value;
};

var cacheDefault = {
  create: function create() {
    return new ObjectWithoutPrototypeCache();
  }
};
}, 43, null, "fast-memoize/src/index.js");
__d(/* RCTTiming */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _dec2, _class, _desc, _value, _class2;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let RCTTiming = (_dec = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), _dec2 = (0, _RCTBridge.RCT_EXPORT_METHOD)(_RCTBridge.RCTFunctionTypeNormal), (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = (_class2 = class RCTTiming {

  constructor(bridge) {
    this.bridge = bridge;
    this.timers = {};
  }

  createTimer(callbackId, duration, jsSchedulingTime, repeats) {
    const currentTimeMillis = Date.now();
    const currentDateNowTimeMillis = jsSchedulingTime + 1000 / 60;
    const adjustedDuration = Math.max(0.0, jsSchedulingTime - currentDateNowTimeMillis + duration);
    const initialTargetTime = currentTimeMillis + adjustedDuration;

    const timer = {
      callbackId,
      duration,
      jsSchedulingTime: initialTargetTime,
      repeats
    };

    if (adjustedDuration === 0) {
      if (timer.repeats) {
        timer.jsSchedulingTime += timer.duration;
        this.timers[String(callbackId)] = timer;
      }
      this.bridge.enqueueJSCall("JSTimersExecution", "callTimers", [[callbackId]]);
    } else {
      this.timers[String(callbackId)] = timer;
    }
  }

  deleteTimer(callbackId) {
    delete this.timers[String(callbackId)];
  }

  frame() {
    const toRemove = [];
    const timers = [];
    const time = Date.now();

    for (const timer in this.timers) {
      const t = this.timers[timer];
      if (t.jsSchedulingTime <= time) {
        timers.push(this.timers[timer].callbackId);
        if (t.repeats) {
          t.jsSchedulingTime += t.duration;
        } else {
          toRemove.push(timer);
        }
      }
    }

    if (timers.length) {
      this.bridge.enqueueJSCall("JSTimersExecution", "callTimers", [timers]);
    }

    for (const timer of toRemove) {
      delete this.timers[timer];
    }
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "createTimer", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "createTimer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteTimer", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteTimer"), _class2.prototype)), _class2)) || _class);
exports.default = RCTTiming;
}, 44, null, "RCTTiming");
__d(/* RCTTouchHandler */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _UIView = require(23      ); // 23 = UIView

var _UIView2 = babelHelpers.interopRequireDefault(_UIView);

var _RCTEventDispatcher = require(33                  ); // 33 = RCTEventDispatcher

var _RCTEventDispatcher2 = babelHelpers.interopRequireDefault(_RCTEventDispatcher);

var _RCTTouchEvent = require(46             ); // 46 = RCTTouchEvent

var _RCTTouchEvent2 = babelHelpers.interopRequireDefault(_RCTTouchEvent);

var _Guid = require(47    ); // 47 = Guid

var _Guid2 = babelHelpers.interopRequireDefault(_Guid);

let RCTTouchHandler = class RCTTouchHandler {

  constructor(bridge) {
    this.mouseClickBegan = event => {
      const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
      if (!touches) return;

      this.touchesBegan(touches);

      const view = this.view;
      if (view) {
        view.addEventListener("mouseup", this.mouseClickEnded);
      }
    };

    this.mouseClickMoved = event => {
      const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
      if (!touches) return;

      this.touchesMoved(touches);
    };

    this.mouseClickEnded = event => {
      const touches = RCTTouchHandler.RCTNormalizeInteractionEvent(event);
      if (!touches) return;

      this.touchesEnded(touches);

      const view = this.view;
      if (view) {
        view.removeEventListener("mouseup", this.mouseClickEnded);
      }
    };

    this.eventDispatcher = bridge.moduleForClass(_RCTEventDispatcher2.default);

    this.nativeTouches = [];
    this.nativeTouchesByIdentifier = {};
    this.reactTouches = [];
    this.touchViews = [];
  }

  static RCTNormalizeInteractionEvent(rawEvent) {
    if (rawEvent instanceof MouseEvent) {
      rawEvent.preventDefault();
      const target = rawEvent.target;

      (0, _Invariant2.default)(target instanceof _UIView2.default, "Cannot normalize interaction event on object which does not inherit from UIView");

      if ("which" in rawEvent && rawEvent.which === 3) {
        return null;
      } else if ("button" in rawEvent && rawEvent.button === 2) {
        return null;
      }

      return [{
        view: target,
        identifier: 0,
        pageX: rawEvent.pageX,
        pageY: rawEvent.pageY,
        locationX: rawEvent.offsetX,
        locationY: rawEvent.offsetY,
        timestamp: rawEvent.timeStamp
      }];
    } else {
      throw new Error("Invalid Event");
    }
  }

  attachToView(view) {
    this.view = view;
    view.addGestureRecognizer(this);
  }

  detachFromView(view) {
    this.view = undefined;
    view.removeGestureRecognizer(this);
  }

  recordNewTouches(touches) {
    touches.forEach(touch => {
      (0, _Invariant2.default)(!this.nativeTouchesByIdentifier.hasOwnProperty(touch.identifier), "Touch is already recorded. This is a critical bug");

      let targetView = touch.view;
      while (targetView) {
        if (targetView === this.view) break;
        if (targetView.reactTag && targetView.touchable) break;
        targetView = targetView.parentElement;
      }

      const reactTag = targetView.reactTag;
      const touchID = touch.identifier;

      const reactTouch = {
        target: reactTag,
        identifier: touchID
      };

      this.touchViews.push(targetView);
      this.nativeTouches.push(touch);
      this.nativeTouchesByIdentifier[touchID] = touch;
      this.reactTouches.push(reactTouch);
    });
  }

  recordRemovedTouches(touches) {
    for (let touch of touches) {
      const nativeTouch = this.nativeTouchesByIdentifier[touch.identifier];

      if (!nativeTouch) {
        continue;
      }

      const index = this.nativeTouches.indexOf(nativeTouch);

      this.touchViews.splice(index, 1);
      this.nativeTouches.splice(index, 1);
      delete this.nativeTouchesByIdentifier[touch.identifier];
      this.reactTouches.splice(index, 1);
    }
  }

  updateReactTouch(touchIndex) {
    const nativeTouch = this.nativeTouches[touchIndex];

    const updatedReactTouch = babelHelpers.extends({}, this.reactTouches[touchIndex], {
      pageX: nativeTouch.pageX,
      pageY: nativeTouch.pageY,
      locationX: nativeTouch.locationX,
      locationY: nativeTouch.locationY,
      timestamp: nativeTouch.timestamp
    });

    this.reactTouches[touchIndex] = updatedReactTouch;
  }

  updateAndDispatchTouches(touches, eventName) {
    const changedIndexes = [];
    for (let touch of touches) {
      const nativeTouch = this.nativeTouchesByIdentifier[touch.identifier];
      if (!nativeTouch) {
        console.log("updateAndDispatch failed");
        continue;
      }

      const index = this.nativeTouches.indexOf(nativeTouch);

      if (index === -1) continue;

      this.updateReactTouch(index);
      changedIndexes.push(index);
    }

    if (changedIndexes.length === 0) {
      console.log("no changed Indexes");
      return;
    }

    const reactTouches = this.reactTouches.map(reactTouch => babelHelpers.extends({}, reactTouch));

    const canBeCoalesced = eventName === "touchMove";

    if (!canBeCoalesced) {
      this.coalescingKey++;
    }

    (0, _Invariant2.default)(this.view, "attempting to send event to unknown view");

    const event = new _RCTTouchEvent2.default(eventName, this.view.reactTag, reactTouches, changedIndexes, this.coalescingKey);

    if (!canBeCoalesced) {
      this.coalescingKey++;
    }

    this.eventDispatcher.sendEvent(event);
  }

  touchesBegan(touches) {
    this.recordNewTouches(touches);
    this.updateAndDispatchTouches(touches, "touchStart");
  }

  touchesMoved(touches) {
    this.updateAndDispatchTouches(touches, "touchMove");
  }

  touchesEnded(touches) {
    this.updateAndDispatchTouches(touches, "touchEnd");
    this.recordRemovedTouches(touches);
  }
};
exports.default = RCTTouchHandler;
}, 45, null, "RCTTouchHandler");
__d(/* RCTTouchEvent */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTEventDispatcher = require(33                  ); // 33 = RCTEventDispatcher

var _RCTEventDispatcher2 = babelHelpers.interopRequireDefault(_RCTEventDispatcher);

let RCTTouchEvent = class RCTTouchEvent {

  constructor(eventName, reactTag, reactTouches, changedIndexes, coalescingKey) {
    this.viewTag = reactTag;
    this.eventName = eventName;
    this.reactTouches = reactTouches;
    this.changedIndexes = changedIndexes;
    this.coalescingKey = coalescingKey;
  }

  canCoalesce() {
    return this.eventName === "touchMove";
  }

  coalesceWithEvent(event) {
    (0, _Invariant2.default)(event instanceof RCTTouchEvent, "Touch event cannot be coalesced with any other type of event");
    (0, _Invariant2.default)(this.reactTouches.length !== event.reactTouches.length, "Touch events have different number of touches.");

    let newEventIsMoreRecent = false;
    let oldEventIsMoreRecent = false;
    let count = this.reactTouches.length;
    for (let i = 0; i < count; i++) {
      const touch = this.reactTouches[i];
      const newTouch = event.reactTouches[i];

      (0, _Invariant2.default)(touch.identifier !== newTouch.identifier, "Touch events doesn't have touches in the same order.");

      if (touch.timestamp > newTouch.timestamp) {
        oldEventIsMoreRecent = true;
      } else {
        newEventIsMoreRecent = true;
      }
    }

    (0, _Invariant2.default)([oldEventIsMoreRecent, newEventIsMoreRecent].filter(e => e).length === 1, "Neither touch event is exclusively more recent than the other one.");

    return newEventIsMoreRecent ? event : this;
  }

  moduleDotMethod() {
    return "RCTEventEmitter.receiveTouches";
  }

  arguments() {
    return [(0, _RCTEventDispatcher.normalizeInputEventName)(this.eventName), this.reactTouches, this.changedIndexes];
  }

  coalescingKey() {
    return this.coalescingKey;
  }
};
exports.default = RCTTouchEvent;
}, 46, null, "RCTTouchEvent");
__d(/* Guid */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = guid;
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}
}, 47, null, "Guid");
__d(/* BundleFromRoot */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bundleFromRoot;
function bundleFromRoot(root) {
  let path = location.pathname;
  if (!path.endsWith("/")) {
    path = path.substr(0, path.lastIndexOf("/"));
  } else {
    path = path.substr(0, path.length - 1);
  }
  return location.protocol + "//" + location.host + path + "/" + root;
}
}, 48, null, "BundleFromRoot");
__d(/* RCTPlatform */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _class;

var _RCTBridge = require(15         ); // 15 = RCTBridge

const supportsTouchForceChange = "ontouchforcechange" in window.document;

let RCTPlatformConstants = (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = class RCTPlatformConstants {
  constantsToExport() {
    return {
      forceTouchAvailable: supportsTouchForceChange
    };
  }
}) || _class;

exports.default = RCTPlatformConstants;
}, 49, null, "RCTPlatform");
__d(/* RCTTextManager */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _dec2, _dec3, _dec4, _class, _desc, _value, _class2;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _RCTViewManager = require(22              ); // 22 = RCTViewManager

var _RCTViewManager2 = babelHelpers.interopRequireDefault(_RCTViewManager);

var _RCTText = require(51       ); // 51 = RCTText

var _RCTText2 = babelHelpers.interopRequireDefault(_RCTText);

var _RCTShadowText = require(52             ); // 52 = RCTShadowText

var _RCTShadowText2 = babelHelpers.interopRequireDefault(_RCTShadowText);

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let RCTTextManager = (_dec = (0, _RCTViewManager.RCT_EXPORT_MIRRORED_PROP)("fontFamily", "string"), _dec2 = (0, _RCTViewManager.RCT_EXPORT_MIRRORED_PROP)("fontSize", "number"), _dec3 = (0, _RCTViewManager.RCT_EXPORT_VIEW_PROP)("accessible", "bool"), _dec4 = (0, _RCTViewManager.RCT_EXPORT_VIEW_PROP)("selectable", "bool"), (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = (_class2 = class RCTTextManager extends _RCTViewManager2.default {
  view() {
    return new _RCTText2.default();
  }

  shadowView() {
    return new _RCTShadowText2.default();
  }

  setFontFamily(view, value) {
    view.fontFamily = value;
  }

  setFontSize(view, value) {
    view.fontSize = value;
  }

  setAccessible(view, value) {}

  setSelectable(view, value) {
    view.selectable = value;
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "setFontFamily", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "setFontFamily"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setFontSize", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "setFontSize"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setAccessible", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "setAccessible"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setSelectable", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "setSelectable"), _class2.prototype)), _class2)) || _class);
exports.default = RCTTextManager;
}, 50, null, "RCTTextManager");
__d(/* RCTText */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _class;

var _RCTView = require(31       ); // 31 = RCTView

var _RCTView2 = babelHelpers.interopRequireDefault(_RCTView);

var _CustomElement = require(24             ); // 24 = CustomElement

var _CustomElement2 = babelHelpers.interopRequireDefault(_CustomElement);

let RCTText = (_dec = (0, _CustomElement2.default)("rct-text"), _dec(_class = class RCTText extends _RCTView2.default {

  constructor() {
    super();

    Object.assign(this.style, {
      position: "static",
      display: "inline"
    });

    this.selectable = false;
    this.fontFamily = "sans-serif";
  }

  get frame() {
    return super.frame;
  }

  set frame(value) {
    super.frame = value;

    Object.assign(this.style, {
      position: "absolute",
      display: "block"
    });
  }

  get fontFamily() {
    return this.style.fontFamily;
  }

  set fontFamily(value) {
    this.style.fontFamily = value;
  }

  get fontSize() {
    return this.style.fontFamily;
  }

  set fontSize(value) {
    this.style.fontSize = value;
  }

  get selectable() {
    return this._selectable;
  }

  set selectable(value) {
    this._selectable = value;
    const valueResult = value ? "text" : "none";
    Object.assign(this.style, {
      webkitUserSelect: valueResult,
      MozUserSelect: valueResult,
      userSelect: valueResult
    });
  }
}) || _class);
exports.default = RCTText;
}, 51, null, "RCTText");
__d(/* RCTShadowText */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Guid = require(47    ); // 47 = Guid

var _Guid2 = babelHelpers.interopRequireDefault(_Guid);

var _Invariant = require(16         ); // 16 = Invariant

var _Invariant2 = babelHelpers.interopRequireDefault(_Invariant);

var _RCTShadowView = require(25             ); // 25 = RCTShadowView

var _RCTShadowView2 = babelHelpers.interopRequireDefault(_RCTShadowView);

var _RCTShadowRawText = require(53                ); // 53 = RCTShadowRawText

var _RCTShadowRawText2 = babelHelpers.interopRequireDefault(_RCTShadowRawText);

var _yogaJs = require(26       ); // 26 = yoga-js

const TEXT_SHADOW_STYLE_PROPS = ["fontFamily", "fontSize", "fontStyle", "fontWeight", "lineHeight"];

let RCTShadowText = class RCTShadowText extends _RCTShadowView2.default {

  constructor() {
    super();

    this.yogaNode.setMeasureFunc((width, widthMeasureMode, height, heightMeasureMode) => this.measure(width, widthMeasureMode, height, heightMeasureMode));

    this.props = {};
    this.textChildren = [];
    this.textDirty = true;
    this.numberOfLines = 0;

    TEXT_SHADOW_STYLE_PROPS.forEach(shadowPropName => {
      Object.defineProperty(this, shadowPropName, {
        configurable: true,
        get: () => this.props[shadowPropName],
        set: value => {
          this.props[shadowPropName] = value;
          this.markTextDirty();
          return true;
        }
      });
    });

    this.fontFamily = "sans-serif";
  }

  get numberOfLines() {
    return this._numberOfLines;
  }

  set numberOfLines(value) {
    this._numberOfLines = value;
    this.markTextDirty();
  }

  get testDOMElement() {
    if (this._testDOMElement == null) {
      const domElement = document.createElement("div");
      domElement.id = (0, _Guid2.default)();
      Object.assign(domElement.style, {
        position: "absolute",
        visibility: "hidden",
        maxHeight: "auto",
        maxWidth: "auto",
        whiteSpace: "nowrap"
      });
      document.body && document.body.appendChild(domElement);
      this._testDOMElement = domElement;
    }
    return this._testDOMElement;
  }

  markTextDirty() {
    this.makeDirty();
    this.textDirty = true;
  }

  clearTestDomElement() {
    const testDomElement = this.testDOMElement;
    while (testDomElement.firstChild) {
      testDomElement.removeChild(testDomElement.firstChild);
    }
  }

  measure(width, widthMeasureMode, height, heightMeasureMode) {
    this.clearTestDomElement();

    const whiteSpace = this.numberOfLines === 1 ? "nowrap" : "normal";

    if (widthMeasureMode !== _yogaJs.MEASURE_MODE_EXACTLY || heightMeasureMode !== _yogaJs.MEASURE_MODE_EXACTLY) {
      if (widthMeasureMode !== _yogaJs.MEASURE_MODE_UNDEFINED) {
        Object.assign(this.testDOMElement.style, {
          maxWidth: width,
          maxHeight: "auto",
          whiteSpace
        });
      } else {
        Object.assign(this.testDOMElement.style, {
          maxWidth: "auto",
          maxHeight: height,
          whiteSpace
        });
      }
    } else {
      return {
        width: width || 0,
        height: height || 0
      };
    }

    this.testDOMElement.appendChild(this.getTestTree());

    return {
      width: this.testDOMElement.clientWidth + 1,
      height: this.testDOMElement.clientHeight + 1
    };
  }

  getTestTree() {
    if (!this.textDirty) {
      (0, _Invariant2.default)(this._testTree, "ShadowText is not marked as dirty but there is no cached testTree");
      return this._testTree;
    }

    const spanWrapper = document.createElement("span");
    Object.assign(spanWrapper.style, this.props);

    this.textChildren.forEach(child => {
      if (child instanceof _RCTShadowRawText2.default && child.text.length) {
        spanWrapper.insertAdjacentHTML("beforeend", child.text);
      } else if (child instanceof RCTShadowText) {
        spanWrapper.insertAdjacentElement("beforeend", child.getTestTree());
      }
    });

    this._testTree = spanWrapper;
    this.textDirty = false;

    return this._testTree;
  }

  insertReactSubviewAtIndex(subview, index) {
    subview.reactSuperview = this;
    this.textChildren.splice(index, 0, subview);
    this.makeDirty();
  }

  removeReactSubview(subview) {
    subview.reactSuperview = undefined;
    this.textChildren = this.textChildren.filter(s => s !== subview);
    this.makeDirty();
  }

  purge() {
    super.purge();
    if (this._testDOMElement) {
      document.body.remove(this._testDOMElement);
    }
  }
};
exports.default = RCTShadowText;
}, 52, null, "RCTShadowText");
__d(/* RCTShadowRawText */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _RCTShadowView = require(25             ); // 25 = RCTShadowView

var _RCTShadowView2 = babelHelpers.interopRequireDefault(_RCTShadowView);

let RCTShadowRawText = class RCTShadowRawText extends _RCTShadowView2.default {

  constructor() {
    super();

    this.textDirty = true;
    this._text = "";
  }

  markTextDirty() {
    let cur = this.reactSuperview;
    while (cur) {
      cur.isDirty = true;
      cur.markTextDirty && cur.markTextDirty();
      cur = cur.reactSuperview;
    }
  }

  get text() {
    return this._text;
  }

  set text(value) {
    this._text = value || "";
    this.textDirty = true;
    this.markTextDirty();
  }
};
exports.default = RCTShadowRawText;
}, 53, null, "RCTShadowRawText");
__d(/* RCTRawTextManager */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _class, _desc, _value, _class2;

var _RCTBridge = require(15         ); // 15 = RCTBridge

var _RCTBridge2 = babelHelpers.interopRequireDefault(_RCTBridge);

var _RCTViewManager = require(22              ); // 22 = RCTViewManager

var _RCTViewManager2 = babelHelpers.interopRequireDefault(_RCTViewManager);

var _RCTRawText = require(55          ); // 55 = RCTRawText

var _RCTRawText2 = babelHelpers.interopRequireDefault(_RCTRawText);

var _RCTShadowRawText = require(53                ); // 53 = RCTShadowRawText

var _RCTShadowRawText2 = babelHelpers.interopRequireDefault(_RCTShadowRawText);

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let RCTRawTextManager = (_dec = (0, _RCTViewManager.RCT_EXPORT_MIRRORED_PROP)("text", "string", false), (0, _RCTBridge.RCT_EXPORT_MODULE)(_class = (_class2 = class RCTRawTextManager extends _RCTViewManager2.default {
  view() {
    return new _RCTRawText2.default();
  }

  shadowView() {
    return new _RCTShadowRawText2.default();
  }

  setText(view, value) {
    view.text = value;
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "setText", [_dec], Object.getOwnPropertyDescriptor(_class2.prototype, "setText"), _class2.prototype)), _class2)) || _class);
exports.default = RCTRawTextManager;
}, 54, null, "RCTRawTextManager");
__d(/* RCTRawText */function(global, require, module, exports) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dec, _class;

var _RCTView = require(31       ); // 31 = RCTView

var _RCTView2 = babelHelpers.interopRequireDefault(_RCTView);

var _CustomElement = require(24             ); // 24 = CustomElement

var _CustomElement2 = babelHelpers.interopRequireDefault(_CustomElement);

let RCTRawText = (_dec = (0, _CustomElement2.default)("rct-raw-text"), _dec(_class = class RCTRawText extends _RCTView2.default {
  constructor() {
    super();

    Object.assign(this.style, {
      position: "static",
      display: "inline"
    });

    this.hasBeenFramed = true;
    this.opacity = 1;
  }

  get text() {
    return this.innerHTML;
  }

  set text(value) {
    this.innerHTML = value;
  }
}) || _class);
exports.default = RCTRawText;
}, 55, null, "RCTRawText");
;require(0);