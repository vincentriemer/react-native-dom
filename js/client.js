import { RNDomInstance } from "react-native-dom";

function init(bundle, parent, options) {
  const web = new RNDomInstance(bundle, "RNTesterApp", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactDom = { init };
