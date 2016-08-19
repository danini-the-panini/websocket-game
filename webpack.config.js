/* eslint-env node */

const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getNodeModulesExternals = () => {
  const nodeModules = {};

  fs.readdirSync('node_modules')
    .filter(x => !x.match(/\.bin$/))
    .forEach(mod => {
      nodeModules[mod] = `commonjs ${mod}`;
    });

  return nodeModules;
};

const BASE_CONFIG = Object.freeze({
  entry: [],
  plugins: [],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.(pug|jade)$/,
        loader: 'pug-loader'
      },
      {
        test: /\.js(x|)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'inline-source-map'
});

const CLIENT_CONFIG = Object.assign({}, BASE_CONFIG, {
  entry: [...BASE_CONFIG.entry, './src/client.jsx'],
  output: {
    filename: 'scripts/client.js',
    path: './dist/public'
  },
  module: Object.assign({}, BASE_CONFIG.module, {
    loaders: [
      ...BASE_CONFIG.module.loaders,
      {
        test: /\.(jpg|png)$/,
        loader: 'url?limit=25000'
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  }),
  plugins: [
    ...BASE_CONFIG.plugins,
    new HtmlWebpackPlugin({
      title: 'Game',
      template: './src/index.pug'
    })
  ],
  devServer: {
    proxy: {
      '/game': {
        target: 'ws://localhost:8001',
        ws: true
      }
    }
  }
});

const SERVER_CONFIG = Object.assign({}, BASE_CONFIG, {
  target: 'node',
  entry: [...BASE_CONFIG.entry, './src/server.js'],
  output: {
    filename: 'server.js',
    path: './dist'
  },
  externals: getNodeModulesExternals()
});

module.exports = [
  CLIENT_CONFIG,
  SERVER_CONFIG
];
