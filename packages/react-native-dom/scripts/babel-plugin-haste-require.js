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
      hasteMap[moduleName] = fileName;
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

module.exports = function({ types }) {
  /**
   * Will transform `require('moduleName')`.
   */
  function transformRequireCall(path, state) {
    var calleePath = path.get("callee");
    if (
      !types.isIdentifier(calleePath.node, { name: "require" }) &&
      !(
        types.isMemberExpression(calleePath.node) &&
        types.isIdentifier(calleePath.node.object, { name: "require" }) &&
        types.isIdentifier(calleePath.node.property, { name: "requireActual" })
      )
    ) {
      return;
    }

    var args = path.get("arguments");
    if (!args.length) {
      return;
    }

    const moduleArg = args[0];
    if (moduleArg.node.type === "StringLiteral") {
      const module = mapModule(state, moduleArg.node.value);
      if (module) {
        moduleArg.replaceWith(types.stringLiteral(module));
      }
    }
  }

  /**
   * Will transform `import [kind] [identifier_name] [from] 'moduleName'`.
   */
  function transformImport(path, state) {
    const source = path.get("source");
    if (source.type === "StringLiteral") {
      const module = mapModule(state, source.node.value);
      if (module) {
        source.replaceWith(types.stringLiteral(module));
      }
    }
  }

  return {
    visitor: {
      CallExpression: {
        exit(path, state) {
          if (path.node.seen) {
            return;
          }

          transformRequireCall(path, state);
          path.node.seen = true;
        }
      },
      ImportDeclaration: {
        exit(path, state) {
          if (path.node.seen) {
            return;
          }

          transformImport(path, state);
          path.node.seen = true;
        }
      }
    }
  };
};
