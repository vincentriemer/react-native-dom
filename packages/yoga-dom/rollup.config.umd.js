import baseConfig from "./rollup.config";

const UMDConfig = Object.assign({}, baseConfig);

UMDConfig.output = {
  name: "Yoga",
  format: "umd",
  file: "lib/Yoga.umd.js"
};

export default UMDConfig;
