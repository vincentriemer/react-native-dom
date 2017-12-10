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

  const config = {
    method: "GET",
    mode: "no-cors",
    cache: "force-cache"
  };
  fetch(url, config)
    .then(onload)
    .catch(onerror);
}

self.onmessage = function(e) {
  var data = JSON.parse(e.data);

  var url = data.url;
  var callbackId = data.callbackId;

  setTimeout(function() {
    loadImage(url, callbackId);
  }, 0);
};
