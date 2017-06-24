import { RNWebInstance } from "react-native-web";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "helloworld", parent, {
    ...options,
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
