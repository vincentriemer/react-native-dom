import baseConfig from "./rollup.config";

const UMDConfig = Object.assign({}, baseConfig);

UMDConfig.output = {
  name: "Yoga",
  format: "umd",
  file: "dist/Yoga.umd.js",
};

export default UMDConfig;
