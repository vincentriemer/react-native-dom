function loadReactBundle() {
  require("ReactBundle");
}

function sendMessage(topic, payload) {
  postMessage({ topic, payload });
}

global.ErrorUtils = {
  setGlobalHandler: () => {},
  reportFatalError: console.error,
};

// global.nativeRequireModuleConfig =

onmessage = ({ data: { topic, payload } }) => {
  // console.log("Recieved message from main thread:", topic, payload);

  switch (topic) {
    case "loadBridgeConfig": {
      global.__fbBatchedBridgeConfig = payload;
      loadReactBundle();
      sendMessage("bundleFinishedLoading");
      break;
    }
    case "callFunctionReturnFlushedQueue": {
      const batchedBridge = global.__fbBatchedBridge;
      const flushedQueue = batchedBridge.callFunctionReturnFlushedQueue(
        ...payload
      );
      sendMessage("flushedQueue", flushedQueue);
      break;
    }
  }
};
