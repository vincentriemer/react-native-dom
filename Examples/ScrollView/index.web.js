import React, { Component } from "react";
import {
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

  getData() {
    const data = [];

    for (let i = 0; i < 30; i++) {
      data.push({ key: `Element ${i}` });
    }

    return data;
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.getData()}
          removeClippedSubviews
          renderItem={({ item }) =>
            <TouchableOpacity
              onPress={() => console.log(item.key)}
              style={styles.item}
            >
              <Text>
                {item.key}
              </Text>
            </TouchableOpacity>}
        />
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
    flexDirection: "column",
    alignItems: "stretch"
  },
  item: {
    padding: 20,
    // fontSize: 18,
    height: 44,
    backgroundColor: "pink",
    margin: 20
  },
  element: {
    height: 100,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "red"
  }
});

AppRegistry.registerComponent("scrollview", () => ScrollViewExample);
