const fs = require("fs");

module.exports = function getDependencyConfig(depConfigPath) {
  const rawConfig = fs.readFileSync(depConfigPath, "utf8");
  return JSON.parse(rawConfig);
};
