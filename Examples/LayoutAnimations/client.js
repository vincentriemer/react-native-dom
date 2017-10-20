import { RNWebInstance } from "../../ReactWeb/index";

function init(bundle, parent, enableHotReload) {
  const web = new RNWebInstance(
    bundle,
    "layoutanimations",
    parent,
    enableHotReload
  );

  web.start();
  return web;
}

window.ReactWeb = { init };
