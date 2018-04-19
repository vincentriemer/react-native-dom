import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Button,
  Animated
} from "react-native";

var CustomLayoutAnimation = {
  ...LayoutAnimation.Presets.spring,
  delete: {
    type: LayoutAnimation.Types.easeOut,
    property: LayoutAnimation.Properties.opacity,
    duration: 1
  }
};

class AnimationExample extends Component {
  constructor() {
    super();

    this.state = {
      index: 0,
      borderRadius: new Animated.Value(0)
    };
  }

  onPress(index) {
    if (index === this.state.index) return;

    LayoutAnimation.configureNext(CustomLayoutAnimation);

    if (index === 1) {
      Animated.timing(this.state.borderRadius, {
        toValue: -1,
        duration: 0
      }).start();
    }

    Animated.timing(this.state.borderRadius, {
      toValue: index === 0 ? 0 : 1,
      duration: 300
    }).start();

    this.setState({ index });
  }

  renderButton(index) {
    return (
      <TouchableOpacity
        key={"button" + index}
        style={styles.button}
        onPress={() => this.onPress(index)}
      >
        <Text>{index}</Text>
      </TouchableOpacity>
    );
  }

  renderCircle(key) {
    var size = 50;
    return (
      <View
        key={key}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2.0,
          backgroundColor: "sandybrown",
          margin: 150
        }}
      />
    );
  }

  render() {
    var leftStyle = this.state.index === 0 ? { flex: 1 } : { width: 20 };
    var middleStyle = this.state.index === 2 ? { width: 20 } : { flex: 1 };
    var rightStyle = { flex: 1 };

    var whiteHeight = this.state.index * 80;

    var numCircles = this.state.index === 0 ? 1 : 4;
    var circles = [];
    for (var i = 0; i < numCircles; i++) {
      circles.push(this.renderCircle(i));
    }

    return (
      <View style={styles.container}>
        <View style={styles.topButtons}>
          {this.renderButton(0)}
          {this.renderButton(1)}
        </View>
        <View style={styles.content}>
          <Animated.View
            style={{
              width: this.state.index === 0 ? 300 : "100%",
              height: this.state.index === 0 ? 300 : "100%",
              backgroundColor: "#70398E",
              borderRadius: this.state.borderRadius.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [400, 150, 0]
              }),
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              flexWrap: "wrap",
              overflow: "hidden"
            }}
          >
            {circles}
          </Animated.View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  topButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    backgroundColor: "lightblue"
  },
  button: {
    flex: 1,
    height: 60,
    alignSelf: "stretch",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    margin: 8
  },
  content: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center"
  },
  circleContainer: {
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    padding: 30,
    justifyContent: "center",
    alignItems: "center"
  }
});

AppRegistry.registerComponent("layoutanimations", () => AnimationExample);
