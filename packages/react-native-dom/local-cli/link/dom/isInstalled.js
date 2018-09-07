const fs = require("fs");
const path = require("path");

const getDependencyConfig = require("./getDependencyConfig");

function isDependencyIncluded(requirePath, vendorModulePath) {
  const vendorModuleContents = fs.readFileSync(vendorModulePath, "utf8");
  return vendorModuleContents.includes(requirePath);
}

module.exports = function isInstalled(config, dependencyConfig) {
  const { depConfigPath, vendorModulePath } = config;

  const depConfig = getDependencyConfig(depConfigPath);

  if (depConfig.hasOwnProperty(dependencyConfig)) {
    const requirePath = depConfig[dependencyConfig];
    return isDependencyIncluded(requirePath, vendorModulePath);
  }

  return false;
};
