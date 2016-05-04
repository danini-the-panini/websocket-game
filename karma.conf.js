/* eslint-env node */

const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const babel = require("rollup-plugin-babel");

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai", "sinon"],
    files: [
      "test_client/**/*_test.js"
    ],
    exclude: [],
    preprocessors: {
      "test_client/**/*_test.js": ["rollup"]
    },
    rollupPreprocessor: {
      rollup: {
        plugins: [
          nodeResolve(),
          commonjs({
            exclude: "src/**"
          }),
          babel({
            exclude: "node_modules/**",
            presets: ["es2015-rollup"],
            babelrc: false
          })
        ]
      },
      bundle: {
        sourceMap: "inline"
      }
    },
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: true,
    concurrency: Infinity
  });
};
