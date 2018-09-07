"use strict";

var path = require("path");
const blacklist = require("metro-config/src/defaults/blacklist");

var config = {
  projectRoot: path.resolve(__dirname, "../.."),
  resetCache: true,
  resolver: {
    hasteImplModulePath: require.resolve("./jest/hasteImpl"),
    platforms: ["dom"],
    providesModuleNodeModules: ["react-native-dom"],
    extraNodeModules: {
      "react-native-dom": __dirname,
      "react-native": path.resolve(__dirname, "./node_modules/react-native"),
      "rndom-redbox": path.resolve(__dirname, "../rndom-redbox"),
      "rndom-switch": path.resolve(__dirname, "../rndom-switch")
    }
  }
};

module.exports = config;
