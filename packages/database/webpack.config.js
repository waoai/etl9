const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  entry: {
    bundle: "./index.js",
    seed: "./seed/run"
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
    libraryTarget: "umd"
  },
  mode: "production",
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.sql$/,
        loader: "raw-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          plugins: ["@babel/plugin-transform-flow-strip-types"]
        }
      }
    ]
  }
}
