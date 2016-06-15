"use strict";

module.exports = {
  entry: "./src/client.js",
  output: { path: `${__dirname}/public/scripts`, filename: "client.js" },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: { presets: ["es2015", "stage-0", "react"] }
      },
      {
        test: /\.s(c|a)ss$/,
        loaders: ["style", "css?sourceMap", "sass?sourceMap"]
      }
    ]
  },
  devtool: 'source-map'
};
