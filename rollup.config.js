import fs from "fs";
import path from "path";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import Visualizer from "rollup-plugin-visualizer";
import globals from "rollup-plugin-node-globals";

function findVersion(file, extensions) {
  for (let e of extensions) {
    if (fs.existsSync(file + e)) {
      console.log("found version", file + e);
      return file + e;
    }
  }
  return null;
}

function hasteResolve(opts) {
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
      if (m && ["ios", "android", "native", "web"].indexOf(m[2]) >= 0) {
        fileName = m[1];
      }
      const content = fs.readFileSync(file, "utf-8");
      const moduleName = (/\* @providesModule ([\w.-]+)/.exec(content) ||
        [])[1];
      if (!moduleName) {
        return;
      }
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

  opts.include.forEach(root => {
    const dir = root.replace(/\/\*\*$/, "");
    walk(dir);
  });

  return {
    name: "haste-resolve",
    resolveId(importee, importer) {
      if (hasteMap[importee]) {
        return findVersion(
          path.resolve(hasteMap[importee]),
          opts.extensions || [".js"]
        );
      }
      return null;
    }
  };
}

export default {
  input: "ReactDom",
  output: {
    format: "es",
    file: "lib/ReactNativeDOM.js"
  },
  plugins: [
    nodeResolve({
      browser: true
    }),
    hasteResolve({
      include: [
        "ReactDom",
        "Libraries",
        "node_modules/react-native/Libraries/Utilities/MatrixMath.js"
      ],
      extensions: [".dom.js", ".js"]
    }),
    babel({
      //exclude: 'node_modules/**',
      sourceMaps: "inline",
      include: [
        "ReactDom/**",
        "Libraries/**",
        "node_modules/react-native/Libraries/**"
      ],
      babelrc: false,
      presets: ["flow"],
      plugins: [
        "transform-object-rest-spread",
        "transform-decorators-legacy",
        "transform-class-properties",
        "transform-es2015-classes",
        "transform-inline-environment-variables",
        "preval",
        "external-helpers"
      ]
    }),
    replace({
      //'\\bprocess.env.NODE_ENV': '"production"',
      __DEV__: "false"
    }),
    commonjs({
      namedExports: {
        "node_modules/react-native/Libraries/Utilities/MatrixMath.js": [
          "createIdentityMatrix",
          "multiplyInto",
          "createTranslate2d",
          "reuseScale3dCommand",
          "reuseTranslate2dCommand"
        ]
      }
    }),
    {
      ongenerate(opts) {
        const { modules } = opts.bundle;
        const deps = {};
        modules.forEach(m => {
          deps[m.id] = {}; // = m.dependencies;
          m.dependencies.forEach(d => {
            deps[m.id][d] = true;
          });
        });
        const cycles = {};
        const walk = path => {
          Object.keys(deps[path[0]] || {}).forEach(id => {
            const path0 = [id].concat(path);
            const f = path0.slice(1).indexOf(id);
            if (id[0] != "\0" && f >= 0) {
              if (!cycles[id]) {
                console.log(
                  "cycle: ",
                  path0
                    .slice(0, f + 2)
                    .reverse()
                    .map(x => x.replace(/^.*node_modules\//, ""))
                    .join(" -> ")
                );
              }
              cycles[id] = true;
              return;
            }
            walk(path0);
          });
          deps[path[0]] = [];
        };
        for (let k in deps) {
          walk([k]);
        }
      }
    },
    globals(),
    Visualizer()
  ]
};
