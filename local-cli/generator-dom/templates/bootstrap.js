import { RNDomInstance } from "react-native-dom";

// Path to RN Bundle Entrypoint ================================================
const rnBundlePath = "./entry.bundle?platform=dom&dev=true";

// React Native DOM Runtime Options =============================================
const ReactNativeDomOptions = {
  enableHotReload: false,
  nativeModules: []
};

// Helper Functions ============================================================
function addScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.setAttribute("src", src);
    s.onerror = reject;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

function waitForWebComponentsPolyfill() {
  return new Promise((resolve) => {
    window.addEventListener("WebComponentsReady", resolve);
  });
}

// Polyfills ============================================================
const polyfillPromises = [];

// Web Components Polyfill
polyfillPromises.push(
  addScript(
    "https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.1/webcomponents-loader.js"
  )
);
polyfillPromises.push(waitForWebComponentsPolyfill());

// Web Animations Polyfill
polyfillPromises.push(
  addScript(
    "https://cdnjs.cloudflare.com/ajax/libs/web-animations/2.3.1/web-animations-next.min.js"
  )
);

// App Initialization ============================================================
Promise.all(polyfillPromises).then(() => {
  const app = new RNDomInstance(
    rnBundlePath,
    "<%= name %>",
    document.body,
    ReactNativeDomOptions
  );

  app.start();
});
