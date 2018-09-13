"use strict";

var path = require("path");

var config = {
  projectRoot: path.resolve(__dirname, "../.."),
  resolver: {
    hasteImplModulePath: require.resolve("./jest/hasteImpl"),
    platforms: ["dom"],
    providesModuleNodeModules: ["react-native-dom"],
    extraNodeModules: {
      "react-native-dom": __dirname,
      "react-native": path.resolve(__dirname, "./node_modules/react-native")
    }
  }
};

module.exports = config;
