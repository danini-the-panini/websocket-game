import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
  entry: "./src/server.js",
  plugins: [
    nodeResolve(),
    commonjs({
      exclude: "./src/server.js"
    })
  ],
  format: "cjs",
  sourceMap: true,
  intro: "require('source-map-support').install();"
};
