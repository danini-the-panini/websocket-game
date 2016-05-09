/* eslint-env node */

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai", "source-map-support"],
    files: [
      "test/client/**/*_test.js",
      "test/shared/**/*_test.js"
    ],
    preprocessors: {
      "test/**/*.js": ["rollup"]
    },
    exclude: [],
    rollupPreprocessor: {
      rollup: {
        plugins: [
          require("rollup-plugin-istanbul")({
            exclude: ["node_modules/**", "test/**/*.js"]
          }),
          require("rollup-plugin-node-resolve")({
            preferBuiltins: false
          }),
          require("rollup-plugin-commonjs")({
            exclude: ["src/**", "test/**"]
          }),
          require("rollup-plugin-babel")({
            exclude: "node_modules/**",
            presets: ["es2015-rollup"],
            sourceMaps: "inline",
            babelrc: false
          })
        ]
      },
      bundle: {
        sourceMap: "inline"
      }
    },
    reporters: ["mocha", "coverage"],
    coverageReporter: {
      includeAllSources: true,
      dir: "coverage",
      subdir: "client",
      type: "json",
      file: "coverage-final.info"
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["Chrome"],
    singleRun: true,
    concurrency: Infinity
  });
};
