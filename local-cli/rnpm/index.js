module.exports = [
  {
    func: require("./src/dom"),
    description: "Generate React Native DOM template project",
    name: "dom",
    options: [
      {
        command: "--domVersion [version]",
        description: "The version of react-native-dom to use"
      },
      {
        command: "--verbose",
        description: "Enables logging",
        default: false
      }
    ]
  }
];
