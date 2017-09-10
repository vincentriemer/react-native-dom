function constructCallback(callbackId) {
  return function(returnCode) {
    return function() {
      self.postMessage(JSON.stringify([callbackId, returnCode]));
    };
  };
}

function loadImage(url, callbackId) {
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

  setTimeout(function() {
    loadImage(url, callbackId);
  }, 0);
};
