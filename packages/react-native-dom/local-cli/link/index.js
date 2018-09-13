exports.linkConfig = function() {
  return {
    isInstalled: require("./dom/isInstalled"),
    register: require("./dom/registerNativeModule"),
    unregister: require("./dom/unregisterNativeModule")
  };
};
