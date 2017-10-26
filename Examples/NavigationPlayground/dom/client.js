import { RNWebInstance } from "react-native-dom";

function init(bundle, parent, enableHotReload) {
  const web = new RNWebInstance(
    bundle,
    "NavigationPlayground",
    parent,
    enableHotReload
  );

  web.start();
  return web;
}

window.ReactWeb = { init };
