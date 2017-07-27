"use strict";

var fs = require("fs");
var path = require("path");
var appPaths = require("../paths");

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.lstatSync(path.join(srcpath, file)).isDirectory();
  });
}

const examplePaths = getDirectories(appPaths.examples);

examplePaths.forEach(function(example) {});
