import React, { Component } from "react";
import { AppRegistry, View } from "react-native-implementation";

class HelloWorldApp extends Component {
  render() {
    return <View />;
  }
}

AppRegistry.registerComponent("HelloWorldApp", () => HelloWorldApp);
