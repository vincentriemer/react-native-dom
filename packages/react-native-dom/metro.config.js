/**
 * @format
 */
const fs = require('fs');
const path = require('path');
const rndPath = __dirname;
const {resolve} = require('metro-resolver');
const blacklist = require('metro-config/src/defaults/blacklist');

function reactNativePlatformResolver(platformImplementations) {
  return (context, _realModuleName, platform, moduleName) => {
    console.log('moduleName = ', moduleName);
    let backupResolveRequest = context.resolveRequest;
    delete context.resolveRequest;

    try {
      let modifiedModuleName = moduleName;
      if (platformImplementations[platform]) {
        if (moduleName === 'react-native') {
          modifiedModuleName = platformImplementations[platform];
        } else if (moduleName.startsWith('react-native/')) {
          modifiedModuleName = `${
            platformImplementations[platform]
          }/${modifiedModuleName.slice('react-native/'.length)}`;
        }
      }
      let result = resolve(context, modifiedModuleName, platform);
      return result;
    } catch (e) {
      throw e;
    } finally {
      context.resolveRequest = backupResolveRequest;
    }
  };
}

module.exports = {
  resolver: {
    // We need a custom resolveRequest right now since our integration tests use a "windesktop" platform thats specific to integration tests.
    resolveRequest: reactNativePlatformResolver({
      dom: 'react-native-dom'
      /**
       * TODO: uncomment once temporary package registry is solved
       */
      // dom: 'react-native-dom'
    }),
    extraNodeModules: {
      // Redirect react-native-windows to this folder
      'react-native-dom': rndPath,
      /**
       * TODO: uncomment once temporary package registry is solved
       */
      // 'react-native-dom': rndPath,
    },
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
