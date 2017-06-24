// @flow
import RCTRootView from "RCTRootView";
import bundleFromRoot from "BundleFromRoot";

// const reactWorker = new ReactWorker();
// const rootView = new RCTRootView(reactWorker, "HelloWorldApp");

// const rootElement = document.getElementById("root");
// if (rootElement != null) {
//   rootView.render(rootElement);
// }

export class RNWebInstance {
  rootView: RCTRootView;

  constructor(bundle: string, moduleName: string, parent: Element) {
    this.rootView = new RCTRootView(bundleFromRoot(bundle), moduleName, parent);
  }

  start() {
    this.rootView.render();
  }
}
