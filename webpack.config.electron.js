const path = require("path");
const webpack = require("webpack");
const CompressionPlugin = require('compression-webpack-plugin');

// let commitHash = require('child_process')
//   .execSync('git rev-parse --short HEAD')
//   .toString();

module.exports = {
  // devtool: "source-map",
  entry: [
    "./src/index"
  ],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/dist/"
  },
  target: "electron-renderer",
  plugins: [
    // new webpack.optimize.OccurenceOrderPlugin(),
    // as of webpack 2 OccurrenceOrderPlugin is on by default
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      },
      global: {}
    }),

    new webpack.optimize.UglifyJsPlugin(), // minify everything,
    new webpack.optimize.AggressiveMergingPlugin(), // merge chunks
    new CompressionPlugin({ // gzip everything
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ],
  module: {
    rules: [{
      test: /\.js$/,
      use: ["babel-loader"],
      include: path.join(__dirname, "src")
    },
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    },
    {
      test: /\.(gif|png|jpe?g|svg)$/i,
      use: "file-loader",
      include: path.join(__dirname, "src")
    }]
  }
};
