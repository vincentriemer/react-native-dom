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
class FlatListExample extends Component {
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
    backgroundColor: "pink",
    margin: 20
  }
});

AppRegistry.registerComponent("flatlist", () => FlatListExample);
