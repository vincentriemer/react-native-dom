"use strict";

const child_process = require("child_process");
const spawn = child_process.spawn,
  execSync = child_process.execSync;
const fs = require("fs");
const http = require("http");
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
  const scriptFile = /^win/.test(process.platform)
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
  const packagerEnvFile = path.join(scriptsDir, ".packager.env");
  const content = `export RCT_METRO_PORT=${port}`;
  // ensure we overwrite file by passing the 'w' flag
  fs.writeFileSync(packagerEnvFile, content, { encoding: "utf8", flag: "w" });

  if (process.platform === "darwin") {
    if (terminal) {
      return child_process.spawnSync(
        "open",
        ["-a", terminal, launchPackagerScript],
        procConfig
      );
    }
    return child_process.spawnSync("open", [launchPackagerScript], procConfig);
  } else if (process.platform === "linux") {
    procConfig.detached = true;
    if (terminal) {
      return child_process.spawn(
        terminal,
        ["-e", "sh " + launchPackagerScript],
        procConfig
      );
    }
    return child_process.spawn("sh", [launchPackagerScript], procConfig);
  } else if (/^win/.test(process.platform)) {
    procConfig.detached = true;
    procConfig.stdio = "ignore";
    return child_process.spawn(
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

function runDom(config, args, options) {
  // fix up options
  options.root = options.root || process.cwd();
  options.port = options.port || 8081;

  isPackagerRunning()
    .then((res) => {
      const isCurrentlyRunning = res === "running";
      if (!isCurrentlyRunning) {
        startServerInNewWindow(options.port);
        return waitPort({
          host: "localhost",
          port: options.port
        });
      }
    })
    .then(() => {
      opn(`http://localhost:${options.port}/dom`);
    });
}

module.exports = {
  name: "run-dom",
  description: "builds your app and starts it in your default browser",
  func: runDom,
  options: [
    {
      command: "--port",
      description: "port to run the packager from"
    }
  ]
};
