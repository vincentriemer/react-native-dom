import { RNDomInstance } from "ReactDom";

const iconFontStyles = `@font-face {
  src: url(/assets/node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf);
  font-family: "Material Icons";
}`;

// Create stylesheet
const style = document.createElement("style");
style.type = "text/css";
if (style.styleSheet) {
  style.styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}

// Inject stylesheet
document.head.appendChild(style);

function init(bundle, parent, enableHotReload) {
  const dom = new RNDomInstance(
    bundle,
    "NavigationPlayground",
    parent,
    enableHotReload
  );

  dom.start();
  return dom;
}

window.ReactDom = { init };
