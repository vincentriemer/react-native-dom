var path = require("path");
var glob = require("glob");
var HasteResolverPlugin = require("haste-resolver-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");
var HasteMapWebPackResolver = require("haste-map-webpack-resolver");
var ProgressBarPlugin = require("progress-bar-webpack-plugin");

var hasteMapWebPackResolver = new HasteMapWebPackResolver({
  rootPath: path.resolve(__dirname, "."),
});

const mainEntry = "./ReactWeb/index.js";
const modules = glob.sync("./ReactWeb/modules/*.js");

module.exports = {
  devtool: "source-map",
  entry: modules.concat([mainEntry]),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      ReactBundle: path.resolve(__dirname, "index.js"),
      RCTBridge: path.resolve(__dirname, "ReactWeb", "bridge", "RCTBridge.js"),
    },
  },
  module: {
    loaders: [
      {
        test: /worker\.js$/,
        loaders: ["worker", "babel"],
        // use: [{ loader: "worker-loader" }, { loader: "babel-loader" }],
      },
      {
        test: /\.js$/,
        loader: "babel",
      },
      {
        test: /\.json$/,
        loader: "json",
      },
    ],
  },
  plugins: [
    // new ProgressBarPlugin(hasteMapWebPackResolver),
    // new webpack.ResolverPlugin([hasteMapWebPackResolver]),
    new webpack.DefinePlugin({
      __DEV__: true,
    }),
    new HasteResolverPlugin({
      platform: "web",
      nodeModules: ["react-native"],
    }),
    new HtmlWebpackPlugin(),
  ],
};
