import {sync} from 'find-up'
import * as fs from 'fs'
import { userError } from "./userError";

export const addCommandsToPackageJson = () => {
    const cwd = process.cwd();
    const pkgJsonPath = sync("package.json", { cwd });
    if (!pkgJsonPath) {
        userError(
        "Unable to find package.json.  This should be run from within an existing react-native project.",
        "NO_PACKAGE_JSON"
        );
    }

    const pkgJson = require(pkgJsonPath);
    if (pkgJson.scripts) {
        pkgJson.scripts["dom"] = "react-native run-dom";
        pkgJson.scripts["bundleDom"] = "react-native build-dom";
    } else {
        pkgJson["scripts"] = {};
        pkgJson.scripts["dom"] = "react-native run-dom";
        pkgJson.scripts["bundleDom"] = "react-native build-dom";
    }
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
}