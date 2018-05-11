const path = require("path");

module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    worker: true
  },
  settings: {
    "import/resolver": {
      [path.resolve(__dirname, "./scripts/eslint-module-resolver-haste")]: {},
      "eslint-import-resolver-lerna": {
        packages: path.resolve(__dirname, "../")
      },
      node: {
        paths: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "../../node_modules")
        ]
      }
    }
  }
};
