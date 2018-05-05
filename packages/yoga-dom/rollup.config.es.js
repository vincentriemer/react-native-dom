import baseConfig from "./rollup.config";

const ESConfig = Object.assign({}, baseConfig);

ESConfig.output = {
  format: "es",
  file: "lib/Yoga.es.js"
};

export default ESConfig;
