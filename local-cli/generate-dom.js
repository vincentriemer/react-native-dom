"use strict";

const fs = require("fs");
const path = require("path");
const yeoman = require("yeoman-environment");

function generateDom(projectDir, name, verbose) {
  const oldCwd = process.cwd();

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
  }

  const env = yeoman.createEnv();
  const generatorPath = path.join(__dirname, "generator-dom");
  env.register(generatorPath, "react:dom");
  const args = ["react:dom", name].concat(process.argv.slice(4));
  env.run(args, { verbose: verbose }, function() {
    process.chdir(oldCwd);
  });
}

module.exports = generateDom;
