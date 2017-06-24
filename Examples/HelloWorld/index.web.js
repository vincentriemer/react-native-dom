import React, { Component } from "react";
import { AppRegistry, View } from "react-native";

class App extends Component {
  render() {
    return <View style={{ flex: 1, backgroundColor: "#7F7E7F" }} />;
  }
}

AppRegistry.registerComponent("helloworld", () => App);
