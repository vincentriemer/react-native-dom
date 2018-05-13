"use strict";

var config = {
  getPlatforms() {
    return ["dom"];
  },
  getProvidesModuleNodeModules() {
    return ["react-native", "react-native-dom"];
  }
};

module.exports = config;
