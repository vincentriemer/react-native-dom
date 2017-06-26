"use strict";

var path = require("path");
const blacklist = require("metro-bundler/build/blacklist");

var config = {
  getProjectRoots() {
    return getRoots();
  },
  getBlacklistRE() {
    return blacklist([]);
  },
  getAssetExts() {
    return [];
  },
  getPlatforms() {
    return ["web"];
  },
  getProvidesModuleNodeModules() {
    return ["react-native"];
  },
};
function getRoots() {
  var root = process.env.REACT_NATIVE_APP_ROOT;
  if (root) {
    return [path.resolve(root)];
  }
  return [path.resolve(__dirname)];
}
module.exports = config;
