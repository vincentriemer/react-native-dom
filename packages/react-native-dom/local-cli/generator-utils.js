"use-strict";

const path = require("path");
const fs = require("fs");

function validatePackageName(name) {
  if (!name.match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
    console.error(
      '"%s" is not a valid name for a project. Please use a valid identifier ' +
        "name (alphanumeric).",
      name
    );
    process.exit(1);
  }
}

function getPackageJson() {
  const packagePath = path.resolve(process.cwd(), "package.json");

  if (!fs.existsSync(packagePath)) {
    console.error("package.json file could not be found in %s", process.cwd());
    process.exit(1);
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  } catch (err) {
    console.error("Could not parse project package.json");
    console.error(err.message);
    process.exit(1);
  }

  return pkg;
}

function getExistingProjectName() {
  const pkg = getPackageJson();

  if (pkg.name == null) {
    console.error("project does not have a name in its package.json");
    process.exit(1);
  }

  return pkg.name;
}

module.exports = {
  validatePackageName: validatePackageName,
  getPackageJson: getPackageJson,
  getExistingProjectName: getExistingProjectName
};
