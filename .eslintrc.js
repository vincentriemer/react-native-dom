const path = require("path");

module.exports = {
  root: true,
  parser: "babel-eslint",
  plugins: ["prettier", "import"],
  rules: {
    "no-extra-bind": 2,
    "no-else-return": 2,
    "no-useless-return": 2,
    "no-var": 2,
    "prettier/prettier": 2,
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ]
      }
    ],
    "import/no-unresolved": 2,
    "import/export": 2,
    "import/no-extraneous-dependencies": 2,
    "import/first": 2
  },
  settings: {
    "import/resolver": {
      [path.resolve(
        __dirname,
        "./packages/react-native-dom/scripts/eslint-module-resolver-haste"
      )]: {},
      node: {
        paths: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "./packages/react-native-dom/node_modules")
        ]
      }
    }
  }
};
