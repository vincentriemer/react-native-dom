// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)

var Module;
// prettier-ignore
if (!Module) Module = eval("(function() { try { return {{{ EXPORT_NAME }}} || {} } catch(e) { return {} } })()");

var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

Module["readAsync"] = function readAsync(url, onload, onerror) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
      // file URLs can return 0
      onload(xhr.response);
      return;
    }
    var data = tryParseAsDataURI(url);
    if (data) {
      onload(data.buffer);
      return;
    }
    onerror();
  };
  xhr.onerror = onerror;
  xhr.send(null);
};

Module["print"] = function shell_print(x) {
  console.log(x);
};
Module["printErr"] = function shell_printErr(x) {
  console.warn(x);
};

Module["quit"] = function(status, toThrow) {
  throw toThrow;
};

// *** Environment setup code ***

// Closure helpers
Module.print = Module["print"];
Module.printErr = Module["printErr"];

// Callbacks
Module["preRun"] = [];
Module["postRun"] = [];

// prettier-ignore
{{BODY}}

// {{MODULE_ADDITIONS}}
