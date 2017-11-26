import { RNWebInstance } from "../../../ReactWeb";

function init(bundle, parent, options) {
  const web = new RNWebInstance(bundle, "button", parent, {
    ...options
  });

  web.start();
  return web;
}

window.ReactWeb = { init };
