import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import less from "less";

import pjson from "./package.json";

const production = true; //!process.env.ROLLUP_WATCH;

const baseConfig = {
  input: "src/index.svelte",
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      customElement: true,
      preprocess: {
        style: ({ filename, content, attributes }) => {
          if (attributes.type !== "text/less") {
            return null;
          }

          return less
            .render(content, {
              filename,
              sourceMap: {}
            })
            .then(({ css, map }) => ({ code: css, map }));
        }
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),

    // If we're building for production (npm run build
    // instead of npm run dev), transpile and minify
    production && babel({ exclude: "node_modules/**" }),
    production && uglify()
  ]
};

const baseOutput = {
  sourcemap: true,
  name: "RNDomSlider"
};

const entryPoints = ["main", "umd:main", "module"];

const formats = {
  main: "cjs",
  "umd:main": "umd",
  module: "es"
};

const createConfig = (format, file) => ({
  ...baseConfig,
  output: {
    ...baseOutput,
    format,
    file
  }
});

export default entryPoints
  .map((entry) => {
    const path = pjson[entry];
    if (path) {
      return createConfig(formats[entry], path);
    }
    return null;
  })
  .concat([createConfig("iife", "public/bundle.js")]);
