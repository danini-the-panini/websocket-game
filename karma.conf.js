/* eslint-env node */

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai"],
    files: [
      "test_client/**/*_test.js",
      "test_shared/**/*_test.js"
    ],
    preprocessors: {
      "test_client/**/*_test.js": ["rollup"],
      "test_shared/**/*_test.js": ["rollup"]
    },
    exclude: [],
    rollupPreprocessor: {
      rollup: {
        plugins: [
          require("rollup-plugin-node-resolve")({
            preferBuiltins: false
          }),
          require("rollup-plugin-commonjs")({
            exclude: ["src/**", "test_shared/**", "test_client/**"]
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
