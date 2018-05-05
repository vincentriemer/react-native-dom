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
      },
      {
        command: "--include-canary",
        description:
          "When resolving compatible react-native-dom versions, if canary releases should be considered",
        default: false
      }
    ]
  }
];
