import React, { Component } from "react";
import { AppRegistry, View, Animated, LayoutAnimation } from "react-native";

const childrenIds = [1, 2, 3];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anim: new Animated.Value(0),
      toggle: true
    };
  }

  componentDidMount() {
    setInterval(() => {
      Animated.spring(this.state.anim, {
        toValue: this.state.toggle ? 1 : 0
      }).start();
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      this.setState({ toggle: !this.state.toggle });
    }, 1000);
  }

  render() {
    const flexDirection = this.state.toggle ? "row" : "column";

    return (
      <View
        style={{
          flex: 1,
          flexDirection,
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: "#E58331"
        }}
      >
        <View style={{ width: 100, height: 100, backgroundColor: "#9EDE9D" }} />
        <Animated.View
          style={{
            width: 40,
            height: 40,
            backgroundColor: "#9EDE9D",
            transform: [
              {
                scale: this.state.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 5]
                })
              },
              {
                rotate: this.state.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"]
                })
              },
              {
                rotateX: this.state.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"]
                })
              }
            ]
          }}
        />
        <View style={{ width: 100, height: 100, backgroundColor: "#9EDE9D" }} />
      </View>
    );
  }
}

AppRegistry.registerComponent("helloworld", () => App);
