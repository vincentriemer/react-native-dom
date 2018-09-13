"use strict";

const path = require("path");
const fs = require("fs");
const Generator = require("yeoman-generator");

const utils = require("../generator-utils");

const REACT_NATIVE_PACKAGE_JSON_PATH = () => {
  return path.resolve(
    process.cwd(),
    "node_modules",
    "react-native",
    "package.json"
  );
};

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("name", { type: String, required: true });

    this.option("verbose", {
      desc: "Enables logging",
      type: Boolean,
      defaults: false
    });
  }

  configuring() {
    this.fs.copy(
      this.templatePath("_gitignore"),
      this.destinationPath(path.join("dom", ".gitignore"))
    );
  }

  writting() {
    const templateVars = { name: this.name };

    this.fs.copyTpl(
      this.templatePath("bootstrap.js"),
      this.destinationPath(path.join("dom", "bootstrap.js")),
      templateVars
    );

    this.fs.copyTpl(
      this.templatePath("entry.js"),
      this.destinationPath(path.join("dom", "entry.js")),
      templateVars
    );

    this.fs.copyTpl(
      this.templatePath("index.html"),
      this.destinationPath(path.join("dom", "index.html")),
      templateVars
    );
  }

  end() {
    this.log("To run your app on the browser:");
    this.log("    react-native run-dom");
  }
};
