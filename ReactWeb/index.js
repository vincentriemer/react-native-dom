// @flow
import ReactWorker from "./jsExecutor/index.worker.js";
import RCTRootView from "./bridge/RCTRootView";

const reactWorker = new ReactWorker();
const rootView = new RCTRootView(reactWorker, "HelloWorldApp");

const rootElement = document.getElementById("root");
if (rootElement != null) {
  rootView.render(rootElement);
}
