ErrorUtils = {
  setGlobalHandler: () => {},
  reportFatalError: console.error
};

function sendMessage(topic, payload) {
  postMessage(JSON.stringify({ topic, payload }));
}

var Status = undefined;

onmessage = ({ data }) => {
  const { topic, payload } = JSON.parse(data);
  // console.log("Recieved message from main thread:", topic, payload);

  switch (topic) {
    case "loadBridgeConfig": {
      const { config, bundle } = payload;

      __fbBatchedBridgeConfig = config;
      importScripts(bundle);

      sendMessage("bundleFinishedLoading");
      break;
    }
    case "callFunctionReturnFlushedQueue": {
      const flushedQueue = __fbBatchedBridge.callFunctionReturnFlushedQueue(
        ...payload
      );
      sendMessage("flushedQueue", flushedQueue);
      break;
    }
    case "invokeCallbackAndReturnFlushedQueue": {
      const flushedQueue = __fbBatchedBridge.invokeCallbackAndReturnFlushedQueue(
        ...payload
      );
      sendMessage("flushedQueue", flushedQueue);
      break;
    }
    case "flush": {
      const flushedQueue = __fbBatchedBridge.flushedQueue.apply(null);
      sendMessage("flushedQueue", flushedQueue);
      break;
    }
  }
};
