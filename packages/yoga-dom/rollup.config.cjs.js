import baseConfig from "./rollup.config";

const CJSConfig = Object.assign({}, baseConfig);

CJSConfig.output = {
  format: "cjs",
  file: "lib/Yoga.cjs.js"
};

export default CJSConfig;
