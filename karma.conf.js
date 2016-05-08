/* eslint-env node */

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai"],
    files: [
      "test/client/**/*_test.js",
      "test/shared/**/*_test.js"
    ],
    preprocessors: {
      "test/client/**/*_test.js": ["rollup"],
      "test/shared/**/*_test.js": ["rollup"]
    },
    exclude: [],
    rollupPreprocessor: {
      rollup: {
        plugins: [
          require("rollup-plugin-node-resolve")({
            preferBuiltins: false
          }),
          require("rollup-plugin-commonjs")({
            exclude: ["src/**", "test/**"]
          }),
          require("rollup-plugin-babel")({
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
    reporters: ["mocha"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["Chrome"],
    singleRun: true,
    concurrency: Infinity
  });
};
