const fs = require("fs");
const glob = require("glob");
const path = require("path");

const { NATIVE_MODULE_IDENT } = require("../../constants");

module.exports = function findVendorModulePath(folder) {
  const jsPaths = glob.sync(path.join("**", "*.js"), {
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

  // Search for file that contains usage of `new RNDomInstance`
  for (var filePath of jsPaths) {
    const file = fs.readFileSync(path.join(folder, filePath), "utf8");
    if (file.includes(NATIVE_MODULE_IDENT)) {
      return path.join(folder, filePath);
    }
  }
};
