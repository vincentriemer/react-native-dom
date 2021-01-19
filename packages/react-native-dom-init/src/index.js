import * as yargs from 'yargs';
import { red } from 'chalk';
import { getReactNativeProjectName } from './getReactNativeProject';
import { installRNDom } from './installRNDom';
import { requireGenerateRNDom } from './requireGenerateRNDom';
import {addCommandsToPackageJson} from "./addCommandsToPackageJson";
import { string } from 'yargs';

const argv = yargs
    .version(false)
    .strict(true)
    .options({
        verbose: {
            type: 'boolean',
            describe: 'Enables logging.',
            default: false,
        },
        domVersion: {
            type: 'string',
            describe: 'The version of react-native-dom to use',
            default: ''
        },
        includeCanary: {
            type: "boolean",
            describe: "When resolving compatible react-native-dom versions, if canary releases should be considered",
            default: false
        },
        exact: {
            type: "boolean",
            describe: "Install react-native-dom at an exact version",
            default: false
        }

    })
    .check(a => {
        if (a._.length !== 0) {
          throw `Unrecognized option ${a._}`;
        }
        return true;
    }).argv;
if (argv.verbose) {
    console.log(argv);
}
(() => {
    try {
        const name = getReactNativeProjectName();
        installRNDom(argv)
            .then((isInstalled) => {
                if (isInstalled === "installed"){
                    addCommandsToPackageJson();
                    const generateRNDom = requireGenerateRNDom();
                    generateRNDom(process.cwd(), name);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (error){
        const exitCode = error.exitCode || 'UNKNOWN_ERROR';
        if (exitCode !== 'SUCCESS') {
            console.error(red(error.message));
            if (argv.verbose) {
                console.error(error);
            }
        }
    }
})()