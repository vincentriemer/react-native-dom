import React, { Component } from "react";
import {
  Animated,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Button,
  ScrollView,
  FlatList
} from "react-native";

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

class ScrollViewExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scrollY: new Animated.Value(0)
    };
  }

  _renderScrollViewContent() {
    const data = Array.from({ length: 30 });
    return (
      <View style={styles.scrollViewContent}>
        {data.map((_, i) => (
          <View key={i} style={styles.row}>
            <Text>{i}</Text>
          </View>
        ))}
      </View>
    );
  }

  render() {
    const barHeight = 60;

    const headerOffset = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolateLeft: "extend",
      extrapolateRight: "clamp"
    });

    const headerScale = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 1 / 2],
      extrapolateLeft: "extend",
      extrapolateRight: "clamp"
    });

    return (
      <View style={styles.fill}>
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: headerOffset }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.bar,
              {
                transform: [
                  { translateY: 30 },
                  { scale: headerScale },
                  { translateY: -30 }
                ]
              }
            ]}
          >
            <Text style={styles.title}>Title</Text>
          </Animated.View>
        </Animated.View>
        <Animated.ScrollView
          style={styles.fill}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {this._renderScrollViewContent()}
        </Animated.ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    zIndex: 1
  },
  row: {
    height: 40,
    margin: 16,
    backgroundColor: "#D3D3D3",
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    position: "absolute",
    top: -500,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT + 500,
    backgroundColor: "#03A9F4",
    overflow: "hidden",
    justifyContent: "flex-end",
    zIndex: 2
  },
  bar: {
    marginBottom: 12,
    height: 60,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: 60
  },
  scrollViewContent: {
    marginTop: HEADER_MAX_HEIGHT
  }
});

AppRegistry.registerComponent("scrollview", () => ScrollViewExample);
