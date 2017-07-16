import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Button,
  ScrollView
} from "react-native";

class ScrollViewExample extends Component {
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

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {this.renderScrollViewContents()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue"
  },
  scrollView: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch"
  },
  element: {
    height: 100,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "red"
  }
});

AppRegistry.registerComponent("scrollview", () => ScrollViewExample);
