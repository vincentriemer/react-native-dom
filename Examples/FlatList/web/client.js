import { RNDomInstance } from "ReactDom";

function init(bundle, parent, options) {
  const web = new RNDomInstance(bundle, "flatlist", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactDom = { init };
