"use strict";

const path = require("path");
const fs = require("fs");
const Generator = require("yeoman-generator");

const utils = require("../generator-utils");
const configUpdater = require("./cli-config-updater");

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

    const configPath = this.destinationPath(path.join("rn-cli.config.js"));
    if (this.fs.exists(configPath)) {
      try {
        const configContents = this.fs.read(configPath);
        const updatedConfigContents = configUpdater(configContents);
        this.fs.write(configPath, updatedConfigContents);
      } catch (err) {
        console.warn("Error updating rn-cli.config.js: ", err.message);
      }
    } else {
      this.fs.copyTpl(this.templatePath("rn-cli.config.js"), configPath);
    }
  }

  end() {
    this.log("To run your app on the browser:");
    this.log("    react-native run-dom");
  }
};
