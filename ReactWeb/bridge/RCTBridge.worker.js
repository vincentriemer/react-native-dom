ErrorUtils = {
  setGlobalHandler: () => {},
  reportFatalError: console.error
};

function sendMessage(topic, payload) {
  postMessage(JSON.stringify({ topic, payload }));
}

var Status = undefined;

function loadBundle(bundle) {
  return new Promise(function(resolve, reject) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", bundle, true);
    xmlHttp.setRequestHeader("Accept", "multipart/mixed");
    xmlHttp.onload = function() {
      importScripts(bundle);
      resolve();
    };
    xmlHttp.onerror = function(evt) {
      reject(evt);
    };
    xmlHttp.onabort = function(evt) {
      reject(evt);
    };
    xmlHttp.onprogress = function(evt) {
      const progressEvents = xmlHttp.response.match(/\{[\S]*\}/g);
      if (progressEvents) {
        const { done, total } = JSON.parse(
          progressEvents[progressEvents.length - 1]
        );

        if (done && total) {
          sendMessage("updateProgress", { done, total });
        }
      }
    };
    xmlHttp.send();
  });
}

function handleError(e) {
  console.warn(e);
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", bundle, true);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      var result = JSON.parse(xmlhttp.responseText);
      if (result) {
        if (
          result.type === "UnableToResolveError" ||
          result.type === "NotFoundError"
        ) {
          console.warn(result.message);
        } else {
          if (result.snippet) {
            // remove all color characters and split the lines for improved clarity
            result.snippet = result.snippet
              .replace(/\u001b\[.*?m/g, "")
              .split("\\n");
          }
          if (result.filename && result.filename.indexOf(":") <= 2) {
            result.filename = "file:///" + result.filename;
          }
          if (result.errors) {
            for (var i = 0; i < result.errors.length; i++) {
              var error = result.errors[i];
              if (error.filename && error.filename.indexOf(":") <= 2) {
                error.filename = "file:///" + error.filename;
              }
            }
          }
          console.warn(JSON.stringify(result, undefined, 2));
        }
      }
    }
    xmlhttp.send(null);
  };
}

onmessage = ({ data }) => {
  const { topic, payload } = JSON.parse(data);
  // console.log("Recieved message from main thread:", topic, payload);

  switch (topic) {
    case "loadBridgeConfig": {
      const { config, bundle } = payload;
      __fbBatchedBridgeConfig = config;
      loadBundle(bundle)
        .then(function() {
          sendMessage("bundleFinishedLoading");
        })
        .catch(handleError);
      break;
    }
    case "callFunctionReturnFlushedQueue": {
      const flushedQueue = __fbBatchedBridge.callFunctionReturnFlushedQueue(
        ...payload
      );
      try {
        sendMessage("flushedQueue", flushedQueue);
      } catch (e) {
        console.warn(e);
        console.warn(msg);
        console.warn(JSON.stringify(results));
      }
      break;
    }
    case "invokeCallbackAndReturnFlushedQueue": {
      const flushedQueue = __fbBatchedBridge.invokeCallbackAndReturnFlushedQueue(
        ...payload
      );
      try {
        sendMessage("flushedQueue", flushedQueue);
      } catch (e) {
        console.warn(e);
        console.warn(msg);
        console.warn(JSON.stringify(results));
      }
      break;
    }
    case "flush": {
      const flushedQueue = __fbBatchedBridge.flushedQueue.apply(null);
      try {
        sendMessage("flushedQueue", flushedQueue);
      } catch (e) {
        console.warn(e);
        console.warn(msg);
        console.warn(JSON.stringify(results));
      }
      break;
    }
  }
};
