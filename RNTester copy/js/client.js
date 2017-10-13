import { RNWebInstance } from "react-native-dom";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "RNTesterApp", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
