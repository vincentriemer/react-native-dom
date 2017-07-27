"use strict";

var path = require("path");
var fs = require("fs");

var appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

module.exports = {
  examples: resolveApp("Examples")
};
