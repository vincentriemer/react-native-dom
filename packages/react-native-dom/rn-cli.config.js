"use strict";

var path = require("path");
const blacklist = require("metro/src/blacklist");
const defaultPolyfills = require("react-native/rn-get-polyfills");

var config = {
  getProjectRoots() {
    return [
      path.resolve(__dirname),
      path.resolve(__dirname, ".."), // for monorepo dependencies
      path.resolve(__dirname, "../..") // for hoisted dependencies
    ];
  },
  getBlacklistRE() {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/]);
  },
  getAssetExts() {
    return [];
  },
  getPlatforms() {
    return ["dom"];
  },
  getProvidesModuleNodeModules() {
    return ["react-native", "react-native-dom"];
  },
  getPolyfills: () =>
    [].concat(defaultPolyfills(), [
      require.resolve("./Libraries/polyfills/setBabelHelper.js")
    ])
};

module.exports = config;
