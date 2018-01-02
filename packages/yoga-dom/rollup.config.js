import commonjs from "rollup-plugin-commonjs";

export default {
  input: "src/index.js",
  context: "window",
  plugins: [commonjs()],
};
