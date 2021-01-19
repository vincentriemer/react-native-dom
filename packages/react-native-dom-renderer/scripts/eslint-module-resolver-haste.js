const path = require("path");
const fs = require("fs");

const opts = {
  include: [path.resolve(__dirname, "..", "ReactDom")],
  extensions: [".js"]
};

function buildModuleMap(opts) {
  const hasteMap = {};
  const walk = function(file) {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      fs.readdirSync(file).forEach(function(file0) {
        if (
          file0.indexOf([
            // blacklist
            "node_modules",
            "__tests__",
            "__mocks__",
            "__fixtures__"
          ]) >= 0
        ) {
          return;
        }
        walk(file + "/" + file0);
      });
      return;
    }
    if (stat.isFile()) {
      let fileName = (/^(.*)\.js$/.exec(file) || [])[1];
      if (!fileName) {
        return;
      }
      const m = /^(.*)\.(\w+)$/.exec(fileName);
      if (m && ["ios", "android", "native", "dom"].indexOf(m[2]) >= 0) {
        fileName = m[1];
      }
      const content = fs.readFileSync(file, "utf-8");
      const moduleName = fileName.replace(/^.*[\\\/]/, "");
      if (hasteMap[moduleName] && hasteMap[moduleName] !== fileName) {
        throw new Error(
          "Duplicate haste module: " +
            moduleName +
            " in files: " +
            fileName +
            " & " +
            hasteMap[moduleName]
        );
      }
      hasteMap[moduleName] = file;
    }
  };

  opts.include.forEach((root) => {
    const dir = root.replace(/\/\*\*$/, "");
    walk(dir);
  });

  return hasteMap;
}

const moduleMap = buildModuleMap(opts);

function mapModule(state, module) {
  if (moduleMap.hasOwnProperty(module)) {
    const currentDir = path.dirname(
      path.resolve(__dirname, "..", state.file.opts.filename)
    );
    const relativePath = path.relative(currentDir, moduleMap[module]);
    return "./" + relativePath;
  }
  return null;
}

module.exports = {
  interfaceVersion: 2,
  resolve(source, file, config) {
    if (moduleMap.hasOwnProperty(source)) {
      return { found: true, path: moduleMap[source] };
    } else {
      return { found: false };
    }
  }
};
