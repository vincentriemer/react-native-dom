import React, { Component } from "react";
import { AppRegistry, View } from "react-native";

function shuffle(items) {
  for (var i = items.length; i-- > 1; ) {
    var j = Math.floor(Math.random() * i);
    var tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}

const childrenIds = [1, 2, 3];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      children: childrenIds.map(id =>
        <View
          id={id}
          key={id}
          style={{
            margin: 20,
            width: id * 50,
            height: id * 50,
            backgroundColor: "#9EDE9D",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {id === 3
            ? <View
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#F5F5F5",
                }}
              />
            : null}
        </View>
      ),
    };
  }

  componentDidMount() {
    setInterval(() => {
      // this.setState({
      //   alternate: !this.state.alternate,
      // });
      this.setState({
        children: shuffle([...this.state.children]),
      });
    }, 500);
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#E58331",
        }}
      >
        {this.state.children}
      </View>
    );
  }
}

AppRegistry.registerComponent("helloworld", () => App);
