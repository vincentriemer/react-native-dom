"use strict";

const child_process = require("child_process");
const spawn = child_process.spawn,
    spawnSync = child_process.spawnSync;
const fs = require("fs");
const path = require("path");
const opn = require("opn");
const fetch = require("node-fetch");
const waitPort = require("wait-port");


/**
 * Indicates whether or not the packager is running. It returns a promise that
 * when fulfilled can returns one out of these possible values:
 *   - `running`: the packager is running
 *   - `not_running`: the packager nor any process is running on the expected
 *                    port.
 *   - `unrecognized`: one other process is running on the port we expect the
 *                     packager to be running.
 */
function isPackagerRunning(packagerPort) {
    return fetch(`http://localhost:${packagerPort}/status`).then(
      (res) =>
        res
          .text()
          .then(
            (body) =>
              body === "packager-status:running" ? "running" : "unrecognized"
          ),
      () => "not_running"
    );
}

function startServerInNewWindow(port = process.env.RCT_METRO_PORT || 8081) {
    const isWindows = /^win/.test(process.platform);
    const scriptFile = isWindows
      ? "launchPackager.bat"
      : "launchPackager.command";
    const scriptsDir = path.join(
      process.cwd(),
      "node_modules/react-native/scripts"
    );
    const launchPackagerScript = path.resolve(scriptsDir, scriptFile);
    const procConfig = { cwd: scriptsDir };
    const terminal = process.env.REACT_TERMINAL;
  
    // setup the .packager.env file to ensure the packager starts on the right port
    const packagerFile = isWindows ? '.packager.bat' : '.packager.env';
    const packagerEnvFile = path.join(scriptsDir, packagerFile);
    const content = isWindows ? `set RCT_METRO_PORT=${port}` : `export RCT_METRO_PORT=${port}`;
    // ensure we overwrite file by passing the 'w' flag
    fs.writeFileSync(packagerEnvFile, content, { encoding: "utf8", flag: "w" });
  
    if (process.platform === "darwin") {
      if (terminal) {
        return spawnSync(
          "open",
          ["-a", terminal, launchPackagerScript],
          procConfig
        );
      }
      return spawnSync("open", [launchPackagerScript], procConfig);
    } else if (process.platform === "linux") {
      procConfig.detached = true;
      if (terminal) {
        return spawn(
          terminal,
          ["-e", "sh " + launchPackagerScript],
          procConfig
        );
      }
      return spawn("sh", [launchPackagerScript], procConfig);
    } else if (isWindows) {
      procConfig.detached = true;
      procConfig.stdio = "ignore";
      return spawn(
        "cmd.exe",
        ["/C", launchPackagerScript],
        procConfig
      );
    } else {
      console.log(
        chalk.red(
          `Cannot start the packager. Unknown platform ${process.platform}`
        )
      );
    }
}

function runDom (_argv, config, args) {
    args.root = args.root || process.cwd();
    args.port = args.port || 8081;
    isPackagerRunning(args.port)
    .then((res) => {
      const isCurrentlyRunning = res === "running";
      if (!isCurrentlyRunning) {
        startServerInNewWindow(args.port);
        return waitPort({
          host: "localhost",
          port: args.port
        });
      }
    })
    .then(() => {
      opn(`http://localhost:${args.port}/dom`);
    });
}

module.exports = {
    name: "run-dom",
    description: "builds your app and starts it in your default browser",
    func: runDom,
    options: [
      {
        name: "--port [number]",
        description: "port to run the packager from",
        parse: val => Number(val)
      }
    ]
};