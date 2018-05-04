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

    for (let i = 0; i < 500; i++) {
      data.push({ key: `Element ${i}` });
    }

    return data;
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.getData()}
          debug={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => console.log(item.key)}
              style={styles.item}
            >
              <Text>{item.key}</Text>
            </TouchableOpacity>
          )}
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
    padding: 50,
    backgroundColor: "pink",
    margin: 20
  }
});

AppRegistry.registerComponent("flatlist", () => FlatListExample);
