const path = require("path");

const findDependencyConfigPath = require("./findDepConfigPath");
const findVendorModulePath = require("./findVendorModulePath");
const getDomRequirePath = require("./getDomRequirePath");

exports.projectConfig = function projectConfigDom(folder, userConfig) {
  const depConfigPath =
    userConfig.depConfigPath || findDependencyConfigPath(folder);

  const vendorModulePath =
    userConfig.bootstrapPath || findVendorModulePath(folder);

  const nodeModulesFolder = path.join(folder, "node_modules");

  return {
    depConfigPath,
    vendorModulePath,
    nodeModulesFolder
  };
};

exports.dependencyConfig = function dependencyConfigDom(folder, userConfig) {
  const requirePath = getDomRequirePath(folder);

  if (requirePath == null) return null;

  return { requirePath: requirePath };
};
