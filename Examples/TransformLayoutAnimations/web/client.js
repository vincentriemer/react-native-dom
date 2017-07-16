import { RNWebInstance } from "react-native-web";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "transformlayoutanimations", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
