const fs = require("fs");
const path = require("path");
const glob = require("glob");

const getDependencyConfig = require("./getDependencyConfig");
const updateDependencyConfig = require("./updateDependencyConfig");
const updateVendorModule = require("./updateVendorModuleFile");

module.exports = function registerNativeDomModule(
  name,
  domConfig,
  params,
  projectConfig
) {
  if (!name.startsWith("react-native") || name === "react-native-dom") return;

  const requirePath = domConfig.requirePath;

  // Add to domDependencyConfig.json
  const depConfig = getDependencyConfig(projectConfig.depConfigPath);
  depConfig[name] = requirePath;
  updateDependencyConfig(depConfig, projectConfig.depConfigPath);

  // Re-generate vendor module file
  updateVendorModule(depConfig, projectConfig.vendorModulePath);
};
