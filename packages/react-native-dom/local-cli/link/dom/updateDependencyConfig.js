const fs = require("fs");

module.exports = function updateDependencyConfig(config, path) {
  fs.writeFileSync(path, JSON.stringify(config, null, "  "));
};
