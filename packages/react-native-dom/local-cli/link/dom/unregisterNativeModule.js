const getDependencyConfig = require("./getDependencyConfig");
const updateVendorModule = require("./updateVendorModuleFile");
const updateDependencyConfig = require("./updateDependencyConfig");

module.exports = function unregisterNativeDomModule(
  name,
  domConfig,
  projectConfig
) {
  const depConfig = getDependencyConfig(projectConfig.depConfigPath);
  delete depConfig[name];

  updateDependencyConfig(depConfig, projectConfig.depConfigPath);
  updateVendorModule(depConfig, projectConfig.vendorModulePath);
};
