import { RNWebInstance } from "react-native-dom";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "button", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
