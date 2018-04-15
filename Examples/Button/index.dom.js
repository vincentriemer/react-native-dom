import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  View,
  Button,
  ScrollView
} from "react-native";

const SpacedButton = (props) => (
  <View style={styles.buttonWrapper}>
    <Button {...props} />
  </View>
);

class ButtonExample extends Component {
  constructor(props) {
    super(props);
  }

  renderScrollElement = (index) => {
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
        <SpacedButton
          {...defaultProps}
          title="Default Button"
          onPress={() => {
            throw new Error(
              `What have you done to my DOM!?!

Y̢̻̭̻̳ͧͤ̂̍͛̋̽o̺̪̮̜͈̓͌ͯ̄ͥͧͤ͘ͅu̬͔̳̎ͣͥͧͫ ̴̩̠̪̩̼̩ha̮̠̹̩̅̉͗͌̉͡v̥ͮ̕e͔̙̥̱͗̊ ̒͂ͪ̈ų͎̗̖̯̻̗͐͑̋̂p̠̞͈̦̌̀̀s̭̖̺̱ͅȇ̮̞̾̀͋ͧt̖̥̦̭͕̲̘ͥ̍ͦ͋̚ ̻̠̹͉̤͇̿ͥ͋̐̔ͮͭt̲̝̻͖̜̖͚̔͐͗͌̓͒h͝e̼͙͛͢ ̛̝̲̣̯̮̙̘́ͣ̓̿͋dͥ͑͆ͦ̊̓҉̭̬è̗̗͔͓̼̤͕m̷̼̗̙ͪ͒o̴̖̭͙̣̣ ̱͔̭̻̪̪̅̐g̹͊o̖̼̙̒͗̉̀d̶̥͓͙͇̜̝̍͌̚s҉͈̥͍̱̫ pͦ̍̔ͦ̒ͥͥ̊͑ͮ͏͡҉̬̼̫̘̥̪̼r̶̶͍̰͚͔̣̦̝̠̘̦̜̰̲̩͈ͣ͒̆̌̓̋̿͜e̸͕̬̠̩̳̟ͥ̑ͣ̋̀̚̕͞͠ͅp̢̖̣̹͍̞͎̠̞̮͔̾ͫ̋̏̀̆͢ͅa̮̦̖̮͎͎͎̠̲̼̮̳̟̻̹̖̫̜ͫͤͨ͋̔̐̌ͪ̒́͘͠r̒̌͗̂̂ͣ̀̆̒ͫͨͤ̓̚͏̶͚͍͎͚͖̰͚̺̫̖̟̘̳̤ͅe̶̼͕͔͈͚̰̬̤̾̈́ͩ̈́̈ͮ͐͑̅ͬ͆ͦ͆̔́͝ͅ ̴̴͇̝̹̮̬͓͖̝̮̌ͦͦ̈ͣ̋̓͋̀ͭ͐ͤͮͫ͋̓̚͠͡t̝̪̪̟̤͔͕̥̖̠̜̝͇̫͔͇̫͇̬͋̐͊͛̋ͤ̽̓̃ͦͤ́͘͢ǒ̢̢̧͔͙̩̘̪̙̪̫̠̱̱͙̥̪͚̆͐̂̽̂̋̊̑ͧ͆̚̕͜ ͍̖͔̦͖̯͈̲̱̬̖͉͔̝͚̫̬͙ͪ͛ͪͪ͊̓̇͡f̌̂ͤ̑̓̏͗̾ͨ̚͏̧̞͈̤̫͍̦͓̫̩̞̯͠͠e̷̮̠̠̖̗͔̗̪̼̞̗̘ͨͤ̈̀̽͆̋͌͝ȩ͚̬̮̹ͩͧ͊͋̌ͤ̿͂̊̓͑ͬ͡ͅl̛͎̟͙͍̟̊̍̀ͦ̒̎ͪ̎̅̍ͦ͌̔ͩͨ̎̋͟ ̷̢̨̩̙͎͙̲̠̦̠̻͉̭̱̣͓̇ͨ̽͗̒ͦ̋͒̌́̋͊͒ͣ̈̔̆̃͠ͅt̶̨̢̰͔̱͉̘̰̬͔̰̯̞̯͓̍ͣ̓ͤ̈́́͋ͯ̄̊ͨ̑̈́͌̍̾͗͐̚̕͟ḩ̗̫̥͎̭͖̰̺̠͔̘̺̻͔͔̦̺͛ͭ̐͆̽͆̎̃͊͑̍ͯ̐͗̀ͅe̢̓̈̈͑́͂͋̊́͜͏̤̩̫̹̲̙̗̳̰̹̮̮͔͖̭͔ͅi̿̑̓͛̏̑̿͒̾ͫ̌͐̂̐̚҉̴̶̨̯̙̠̝̬̗͙̯͝r̡̃̍ͫͭ̏͆̏̉̿̓͊̔͒̉͡͡҉̪̜͔̹̭̝̠ ̷̵̭̣̟͉̦͌ͬ͋ͣ͗̇ͤ͂ͣ͑ͧͤͨ̐ͥͥͨͦ͠ẘ̡͉̙͙̯͕͖̩̫̳̱͉̯̩͇̠͕̱̀̽͒̋ͦ͘ͅr̡̨̛̛̩̝̖͎̠̩̝̞͇ͪͮ̊ͮ̽̓ͪ̂ͤ̓̈̎̓̉̚͢ḁ̶̺̲͇̺ͨͪͫ̿̎͒̓͋̆̑̌̽͛ͦͮ̓͗ͣ͢t̒ͬ͛̿ͤ͑̂͋ͧͦ̿͂͏̵̱̯̟͍̠͔̭̬̯̲̘̙͖̪̞͖̰̰͝h̶̥̜̹͈̟̪͈͍͖̠͛̑ͩ̉̾̀̄͜͟͞͡!̧̮͖͖͔͐̈̍̌͌ͥ̈
`
            );
          }}
        />
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
