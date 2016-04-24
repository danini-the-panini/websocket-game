import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
  entry: "./server.js",
  plugins: [
    nodeResolve(),
    commonjs({
      exclude: "./server.js"
    })
  ],
  format: "cjs",
  sourceMap: true
};
