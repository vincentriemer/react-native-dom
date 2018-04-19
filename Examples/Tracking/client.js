import { RNDomInstance } from "ReactDom";

function init(bundle, parent, options) {
  const dom = new RNDomInstance(bundle, "TrackingExample", parent, {
    ...options
  });

  dom.start();
  return dom;
}

window.ReactDom = { init };
