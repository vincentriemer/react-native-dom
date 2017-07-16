import { RNWebInstance } from "react-native-web";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "scrollview", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
