import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  View,
  Button,
  ScrollView
} from "react-native";

const SpacedButton = props => (
  <View style={styles.buttonWrapper}>
    <Button {...props} />
  </View>
);

class ButtonExample extends Component {
  renderScrollElement = index => {
    return <View key={`${index}`} style={styles.element} />;
  };

  renderScrollViewContents = () => {
    const scrollViewElements = [];

    for (let i = 0; i < 20; i++) {
      scrollViewElements.push(this.renderScrollElement(i));
    }

    return scrollViewElements;
  };

  getData() {
    const data = [];

    for (let i = 0; i < 30; i++) {
      data.push({ key: `Element ${i}` });
    }

    return data;
  }

  render() {
    const defaultProps = {
      onPress: () => {}
    };

    return (
      <View style={styles.container}>
        <SpacedButton {...defaultProps} title="Default Button" />
        <SpacedButton {...defaultProps} title="Green Button" color="#56BB6D" />
        <SpacedButton {...defaultProps} title="Orange Button" color="#E46737" />
        <SpacedButton {...defaultProps} title="Purple Button" color="#7350BD" />
        <SpacedButton {...defaultProps} title="Pink Button" color="#CF3A60" />
        <SpacedButton {...defaultProps} title="Disabled Button" disabled />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
    paddingVertical: 25,
    paddingHorizontal: 50,
    justifyContent: "center"
  },
  buttonWrapper: {
    marginBottom: 25
  }
});

AppRegistry.registerComponent("button", () => ButtonExample);
