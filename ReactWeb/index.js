// @flow
import ReactThread from "./jsExecutor/index.worker.js";
const reactThread = new ReactThread();

import RCTBridge from "./bridge/RCTBridge";

const bridge = new RCTBridge();
bridge.setThread(reactThread);
bridge.initializeModules();
