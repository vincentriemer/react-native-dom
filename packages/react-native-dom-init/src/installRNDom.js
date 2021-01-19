import { execSync } from "child_process";
import * as fs from "fs";

import { green } from "chalk";
import { sync } from "find-up";
import {valid, major, minor, patch, validRange, satisfies} from "semver";
import NPMRegistry from 'npm-registry'
import { isUri } from 'valid-url'

import { isProjectUsingYarn } from "./utils";
import { userError } from "./userError";

const PKG = "react-native-dom"
const npmConfigReg = execSync("npm config get registry").toString().trim();
const registryUrl = isUri(npmConfigReg) ? npmConfigReg : "http://registry.npmjs.org"
const npm = new NPMRegistry({registry: registryUrl});

const getLatestRND = () => {
  return new Promise((resolve, reject) => {
    npm.packages.release(PKG, "latest", (err, releases) => {
      if (err) {
        console.log("in if")
        reject(new Error("Could not find react-native-dom@latest."));
      } else if (!releases || releases.length === 0) {
        console.log("in elif")
        reject(new Error("Could not find react-native-dom@latest."));
      } else {
        console.log("in resolve");
        resolve(releases[0].version);
      }
    });
  });
}
const getMatchingVersion = (version) => {
  console.log(`Checking for react-native-dom version matching ${version}...`);
  return new Promise((resolve, reject) => {
    npm.packages.range(PKG, version, (error, release) => {
      if (error || !release) {
        console.log("checking for latest")
        return getLatestRND()
          .then((latestVersion) => {
            reject(new Error(`Could not find react-native-dom@${version}. Latest version of react-native-dom is ${latestVersion}, try switching to react-native-dom@${major(latestVersion)}.${minor(latestVersion)}.*.`));
          })
          .catch((error) => {
            console.log("in catch", error);
            reject(new Error(`Could not find react-native-dom@${version}.`))
          }
          );
      } else {
        resolve(release.version);
      }
    })
  })
}

const getRNVersion = () => {
  const pkgJsonPath = require.resolve("react-native/package.json", {
    paths: [process.cwd()],
  })
  if (fs.existsSync(pkgJsonPath)) {
    let rnVersion = require(pkgJsonPath).version;
    if (rnVersion) {
      const validVersion = valid(rnVersion);
      if (validVersion) {
        return `${major(validVersion)}.${minor(validVersion)}.${patch(validVersion)}`
      }
    }
  }
  userError(
  'Must be run from a project that already depends on react-native, and has react-native installed.',
    'NO_REACTNATIVE_FOUND',
  );
}

const getAllRNDVersion = canary => {
  return new Promise((resolve, reject) => {
    npm.packages.releases(PKG, (err, releases) => {
      if (err) return reject(err);
      resolve(
        Object.keys(releases)
          .filter((release) => {
            if (["latest", "canary"].includes(release)) return false;
            if (!canary && release.includes("alpha")) return false;
            return true;
          }, {})
          .map((r) => releases[r])
      );
    })
  }) 
}

const getMatchingRNDVersion = (version, includeCanary) => {
  if (version) {
    const validVersion = valid(version);
    const Range = validRange(version);

    if (validVersion || Range) {
      return getMatchingVersion(version);
    } else {
      return Promise.resolve(version);
    }
  } else {
    const rnVersion = getRNVersion();
    if (rnVersion) {
      return getAllRNDVersion(includeCanary)
        .then((releases) => {
          releases.sort((a, b) => {
            if (a.date < b.date) return 1;
            if (a.date > b.date) return -1;
            return 0;
          });
          for (const release of releases) {
            if (
              satisfies(
                rnVersion,
                release.peerDependencies["react-native"]
              )
            )
              return release.version;
          }
    
          throw new Error(
            `No version of 'react-native-dom' found that satisfies a peer dependency on 'react-native@${rnVersion}'`
          );
        })
        .catch((err) => {
          throw new Error(err);
        })
    }
  }
};
export const installRNDom = (argv) => {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const execOptions = argv.verbose ? { stdio: "inherit" } : {};
    const version = argv.domVersion;
    const includeCanary = argv.includeCanary;
    const exact = argv.exact;
    const pkgCmd = isProjectUsingYarn(process.cwd())
        ? "yarn add" + (exact ? " --exact" : "")
        : "npm install" + (exact ? " --save-exact" : " --save");
  
  
    console.log(`Installing ${green("react-native-dom")}...`);
    const pkgJsonPath = sync("package.json", { cwd });
  
    if (!pkgJsonPath) {
      userError(
        "Unable to find package.json.  This should be run from within an existing react-native project.",
        "NO_PACKAGE_JSON"
      );
    }
    getMatchingRNDVersion(version, includeCanary)
      .then(versionToInstall => {
        console.log(versionToInstall);
        const rnDomPackage = `${PKG}@${versionToInstall}`;
        execSync(`${pkgCmd} ${rnDomPackage}`, execOptions);
        resolve("installed")
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });

  })
}
