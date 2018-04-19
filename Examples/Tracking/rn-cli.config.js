"use strict";

const path = require("path");
const blacklist = require("metro-bundler/build/blacklist");

/**
 * Default configuration for the CLI.
 *
 * If you need to override any of this functions do so by defining the file
 * `rn-cli.config.js` on the root of your project with the functions you need
 * to tweak.
 */
const config = {
  getProjectRoots() {
    return getRoots();
  },

  // Ignore these files or directories when looking for modules.
  // OVRUI/package.json - Avoid importing OVRUI via its package.json file,
  //   so that we can point the packager at the src directory instead, and
  //   automatically respond to updates in that directory.
  // ReactVR/website -  Avoid the react-native which may be installed here.
  // .git - Avoid all .git directories
  getBlacklistRE() {
    return blacklist([]);
  },

  // Any modules that are under react-native-github and we want
  // to be able to require from non-opensource code, need to be
  // listed here
  extraNodeModules: {
    fbjs: path.resolve(__dirname, "..", "..", "node_modules", "fbjs"),
    react: path.resolve(__dirname, "..", "..", "node_modules", "react"),
    "react-native": path.resolve(
      __dirname,
      "..",
      "..",
      "node_modules",
      "react-native"
    ),
    "react-native-dom": path.resolve(__dirname, "..", "..", "ReactDom", "index")
  },

  getAssetExts() {
    return [];
  },

  getPlatforms() {
    return ["dom"];
  },

  getProvidesModuleNodeModules() {
    return ["react-native"];
  }
};

function getRoots() {
  return [path.resolve(__dirname, "..", "..")];
}

module.exports = config;
