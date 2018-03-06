import commonjs from "rollup-plugin-commonjs";
import builtins from "rollup-plugin-node-builtins";

export default {
  input: "src/index.js",
  context: "window",
  plugins: [commonjs(), builtins()],
};
