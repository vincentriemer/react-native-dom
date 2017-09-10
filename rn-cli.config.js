"use strict";

var path = require("path");
const blacklist = require("metro-bundler/src/blacklist");
const defaultPolyfills = require("react-native/rn-get-polyfills");

var config = {
  extraNodeModules: {
    "react-native-dom": path.resolve(__dirname, "ReactWeb", "index")
  },
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
  getPolyfills: () =>
    [].concat(defaultPolyfills(), [
      require.resolve("./Libraries/polyfills/setBabelHelper.js")
    ])
};
function getRoots() {
  var root = process.env.REACT_NATIVE_APP_ROOT;
  if (root) {
    return [path.resolve(root)];
  }
  return [path.resolve(__dirname)];
}
module.exports = config;
