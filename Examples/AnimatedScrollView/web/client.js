import { RNWebInstance } from "../../../ReactWeb";

function init(bundle, parent, enableHotReload) {
  const web = new RNWebInstance(bundle, "scrollview", parent, enableHotReload);

  web.start();
  return web;
}

window.ReactWeb = { init };
