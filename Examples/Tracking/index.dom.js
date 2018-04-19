import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Button,
  Animated,
  PanResponder
} from "react-native";

const heads = [
  require("./assets/vincent.jpg"),
  require("./assets/ken.jpg"),
  require("./assets/jason.jpg"),
  require("./assets/vjeux.jpg")
];

class TrackingExample extends Component {
  constructor(props) {
    super(props);

    const chatHeads = heads.map(() => new Animated.ValueXY());
    const leader = chatHeads[0];

    chatHeads.forEach((curHeadAnim, index) => {
      if (index === 0) return;
      const tracker = chatHeads[index - 1];
      Animated.spring(curHeadAnim, {
        toValue: tracker
      }).start();
    });

    this.state = { chatHeads, leader };

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.leader.setOffset({
          x: this.state.leader.x._value,
          y: this.state.leader.y._value
        });
        this.state.leader.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.leader.x, dy: this.state.leader.y }
      ]),

      onPanResponderRelease: (e, { vx, vy }) => {
        this.state.leader.flattenOffset();
      }
    });
  }

  render() {
    const { leader, chatHeads } = this.state;

    const images = [...heads].reverse();
    const headAnims = [...chatHeads].reverse();

    return (
      <View style={styles.container}>
        <View style={{ width: 100, height: 100 }}>
          {headAnims.map((headAnim, i) => (
            <Animated.View
              {...(i === headAnims.length - 1
                ? this._panResponder.panHandlers
                : {})}
              key={i}
              style={{
                transform: headAnim.getTranslateTransform()
              }}
            >
              <Animated.Image source={images[i]} style={[styles.head]} />
            </Animated.View>
          ))}
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
  head: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50
  }
});

AppRegistry.registerComponent("TrackingExample", () => TrackingExample);
