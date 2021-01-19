// @ts-check
const cli = require('react-native-dom-cli');

module.exports = {
    // **** This section defined commands and options on how to provide the Windows platform to external applications
    commands: cli.commands,
    platforms: {
      dom: {
        linkConfig: () => null,
        projectConfig: () => null,
        dependencyConfig: () => null,
        npmPackageName: 'react-native-dom',
      },
    },
  };
