# RNPM Plugin for React Native DOM

## Project Initialization

First, ensure you have the react-native CLI installed globally.

```
npm install -g react-native-cli
# or
yarn global add react-native-cli
```

Next, initialize your React Native project the way you typically do.

```
react-native init [project name]
```

Then, `cd` into your project and install `rnpm-plugin-dom` into your
`devDependencies`, after which you can initialize your React Native DOM
scaffolding with the `react-native dom` command.

```
npm install --save-dev rnpm-plugin-dom
# or
yarn add --dev rnpm-plugin-dom

# Add DOM support to your React Native project
react-native dom
```

### Usage

```
react-native dom [name] [--domVersion <version>] [--includeCanary <true/false>]
```
