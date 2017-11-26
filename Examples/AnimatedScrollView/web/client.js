import { RNWebInstance } from "../../../ReactWeb";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "scrollview", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
