import React, { Component } from "react";
import { Dimensions, Platform } from "react-native-implementation";

const dimensions = Dimensions.get("window");

console.log("window dimensions passed from native module bridge:", dimensions);
console.log("platform module:", Platform.Version);

Dimensions.addEventListener("change", ({ window, screen }) => {
  console.log(window, screen);
});

// class HelloWorldApp extends Component {
//   render() {
//     return <Text>Hello world!</Text>;
//   }
// }

// AppRegistry.registerComponent("HelloWorldApp", () => HelloWorldApp);
