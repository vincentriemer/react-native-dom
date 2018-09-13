const fs = require("fs");
const glob = require("glob");
const path = require("path");

const DEP_CONFIG_FILENAME = "domDependencyConfig.json";

module.exports = function findDependencyConfigPath(folder) {
  const depConfigPaths = glob.sync(path.join("**", DEP_CONFIG_FILENAME), {
    cwd: folder,
    ignore: [
      "node_modules/**",
      "**/build/**",
      "Examples/**",
      "examples/**",
      "**/bin/**",
      "**/obj/**",
      "**/dist/**"
    ]
  });

  if (depConfigPaths.length === 0) {
    throw new Error(
      `Could not find ${DEP_CONFIG_FILENAME} in your project, please add it.`
    );
  }

  if (depConfigPaths.length > 1) {
    throw new Error(
      `Multiple ${DEP_CONFIG_FILENAME} files found: [${depConfigPaths.join(
        ", "
      )}]`
    );
  }

  return path.join(folder, depConfigPaths[0]);
};
