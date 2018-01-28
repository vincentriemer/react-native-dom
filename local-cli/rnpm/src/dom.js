"use strict";

const fs = require("fs");
const execSync = require("child_process").execSync;
const path = require("path");
const semver = require("semver");
const Registry = require("npm-registry");
const validUrl = require("valid-url");

const REACT_NATIVE_PACKAGE_JSON_PATH = function() {
  return path.resolve(
    process.cwd(),
    "node_modules",
    "react-native",
    "package.json"
  );
};

const REACT_NATIVE_DOM_GENERATE_PATH = function() {
  return path.resolve(
    process.cwd(),
    "node_modules",
    "react-native-dom",
    "local-cli",
    "generate-dom.js"
  );
};

let npmConfReg = execSync("npm config get registry")
  .toString()
  .trim();
let NPM_REGISTRY_URL = validUrl.is_uri(npmConfReg)
  ? npmConfReg
  : "http://registry.npmjs.org";

const npm = new Registry({ registry: NPM_REGISTRY_URL });

function getLatestVersion() {
  return new Promise(function(resolve, reject) {
    npm.packages.release("react-native-dom", "latest", (err, releases) => {
      if (err) {
        reject(err);
      } else if (!releases || releases.length === 0) {
        reject(new Error("Could not find react-native-dom@latest."));
      } else {
        resolve(releases[0].version);
      }
    });
  });
}

function getMatchingVersion(version) {
  console.log(`Checking for react-native-dom version matching ${version}...`);
  return new Promise(function(resolve, reject) {
    npm.packages.range("react-native-dom", version, (err, release) => {
      if (err || !release) {
        return getLatestVersion()
          .then((latestVersion) => {
            reject(
              new Error(
                `Could not find react-native-dom@${version}. ` +
                  `Latest version of react-native-dom is ${latestVersion}, try switching to ` +
                  `react-native-dom@${semver.major(
                    latestVersion
                  )}.${semver.minor(latestVersion)}.*.`
              )
            );
          })
          .catch((error) =>
            reject(new Error(`Could not find react-native-windows@${version}.`))
          );
      } else {
        resolve(release.version);
      }
    });
  });
}

const getInstallPackage = function(version) {
  let packageToInstall = "react-native-dom";

  const validVersion = semver.valid(version);
  const validRange = semver.validRange(version);

  if (validVersion || validRange) {
    return getMatchingVersion(version).then(
      (resultVersion) => packageToInstall + "@" + resultVersion
    );
  } else {
    return Promise.resolve(version);
  }
};

const getReactNativeVersion = function() {
  console.log("Reading react-native version from node_modules...");
  if (fs.existsSync(REACT_NATIVE_PACKAGE_JSON_PATH())) {
    const version = JSON.parse(
      fs.readFileSync(REACT_NATIVE_PACKAGE_JSON_PATH(), "utf-8")
    ).version;
    return `${semver.major(version)}.${semver.minor(version)}.*`;
  }
};

const getReactNativeAppName = function() {
  console.log("Reading application name from package.json...");
  return JSON.parse(fs.readFileSync("package.json", "utf8")).name;
};

/**
 * Check that 'react-native init' itself used yarn to install React Native.
 * When using an old global react-native-cli@1.0.0 (or older), we don't want
 * to install React Native with npm, and React + Jest with yarn.
 * Let's be safe and not mix yarn and npm in a single project.
 * @param projectDir e.g. /Users/martin/AwesomeApp
 */
const isGlobalCliUsingYarn = function(projectDir) {
  return fs.existsSync(path.join(projectDir, "yarn.lock"));
};

module.exports = function dom(config, args, options) {
  const name = args[0] ? args[0] : getReactNativeAppName();
  const version = options.domVersion ? options.domVersion : getLatestVersion();

  getInstallPackage(version)
    .then((rnDomPackage) => {
      console.log(`Installing ${rnDomPackage}...`);
      const pkgmgr = isGlobalCliUsingYarn(process.cwd())
        ? "yarn add"
        : "npm install --save";

      const execOptions = options.verbose ? { stdio: "inherit" } : {};
      execSync(`${pkgmgr} ${rnDomPackage}`, execOptions);
      console.log(`${rnDomPackage} succesfully installed`);

      const generateDom = require(REACT_NATIVE_DOM_GENERATE_PATH());
      generateDom(process.cwd(), name);
    })
    .catch((error) => console.error(error.message));
};
