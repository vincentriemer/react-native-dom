/**
 * commented out temporary uncomment once we have npm registry for packages
 */
// import { RNDomInstance } from "react-native-dom-renderer";
import { RNDomInstance } from "react-native-dom-renderer";
import { name as appName } from "../app.json";

// Path to RN Bundle Entrypoint ================================================
const rnBundlePath = "./entry.bundle?platform=dom&dev=true";

// React Native DOM Runtime Options =============================================
const ReactNativeDomOptions = {
  enableHotReload: false,
  nativeModules: []
};

// App Initialization ============================================================
const app = new RNDomInstance(
  rnBundlePath,
  appName,
  document.body,
  ReactNativeDomOptions
);

app.start();
