import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Button
} from "react-native";

var CustomLayoutAnimation = {
  duration: 400,
  create: {
    type: LayoutAnimation.Types.easeIn,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.8
  },
  delete: {
    type: LayoutAnimation.Types.easeOut,
    property: LayoutAnimation.Properties.opacity
  }
};

class AnimationExample extends Component {
  constructor() {
    super();

    this.state = {
      index: 0
    };
  }

  onPress(index) {
    // Uncomment to animate the next state change.
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    // Or use a Custom Layout Animation
    LayoutAnimation.configureNext(CustomLayoutAnimation);

    this.setState({ index: index });
  }

  renderButton(index) {
    return (
      <TouchableOpacity
        key={"button" + index}
        style={styles.button}
        onPress={() => this.onPress(index)}
      >
        <Text>
          {index}
        </Text>
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
          margin: 20
        }}
      />
    );
  }

  render() {
    const containerBaseStyle = {
      width: 400,
      height: 400,
      backgroundColor: "sandybrown",
      borderRadius: 5,
      padding: 20,
      alignItems: "stretch",
      justifyContent: "flex-start"
    };

    const baseChildStyle = {
      backgroundColor: "lightblue",
      justifyContent: "space-around",
      alignItems: "center",
      borderRadius: 10
    };

    const containerStyle =
      this.state.index === 0
        ? { flex: 1 }
        : {
            width: 500,
            justifyContent: "center",
            alignItems: "center"
          };

    const childStyle =
      this.state.index === 0
        ? { flex: 1, flexDirection: "column" }
        : { width: 400, height: 300, flexDirection: "row" };

    const baseChild2Style = {
      width: 30,
      height: 30,
      backgroundColor: "red"
    };

    const child2Style = this.state.index === 0 ? {} : { height: 50 };

    const child3Style = {
      width: 90,
      height: 90,
      backgroundColor: "red",
      alignItems: "center",
      justifyContent: "center"
    };

    const child4Style = {
      width: 45,
      height: 45,
      backgroundColor: "blue"
    };

    return (
      <View style={styles.container}>
        <View style={styles.topButtons}>
          {this.renderButton(0)}
          {this.renderButton(1)}
        </View>
        <View
          style={[
            styles.content,
            this.state.index === 0
              ? {
                  alignItems: "stretch",
                  justifyContent: "flex-start"
                }
              : {
                  alignItems: "center",
                  justifyContent: "center"
                }
          ]}
        >
          <View style={[containerBaseStyle, containerStyle]}>
            <View style={[baseChildStyle, childStyle]}>
              <View style={[baseChild2Style, child2Style]} />
              <View style={[baseChild2Style, child2Style]} />
              <View style={[baseChild2Style, child2Style]} />
              {this.state.index === 0
                ? null
                : <View style={child3Style}>
                    <View style={child4Style} />
                  </View>}
            </View>
          </View>
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
    padding: 40
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

AppRegistry.registerComponent(
  "transformlayoutanimations",
  () => AnimationExample
);
