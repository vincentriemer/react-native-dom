var ticking = false;
var fetchQueue = [];

function createQueueElement(url, callbackId) {
  return {
    url: url,
    callbackId: callbackId
  };
}

function requestTick() {
  if (!ticking && fetchQueue.length > 0) {
    ticking = true;
    loadNextImage();
  }
}

function constructCallback(callbackId) {
  return function(returnCode) {
    return function() {
      ticking = false;
      self.postMessage(JSON.stringify([callbackId, returnCode]));
      requestTick();
    };
  };
}

function loadNextImage() {
  var imageData = fetchQueue.shift();
  var url = imageData.url;
  var callbackId = imageData.callbackId;

  var cb = constructCallback(callbackId);

  var onload = cb(0);
  var onerror = cb(1);

  var xhr = new XMLHttpRequest();
  xhr.responseType = "blob";
  xhr.onload = onload;
  xhr.onerror = onerror;
  xhr.open("GET", url, true);
  xhr.send();
}

self.onmessage = function(e) {
  var data = JSON.parse(e.data);

  var url = data.url;
  var callbackId = data.callbackId;

  fetchQueue.push(createQueueElement(url, callbackId));
  requestTick();
};
