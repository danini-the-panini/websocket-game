import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";

export default {
  entry: "./client.js",
  plugins: [
    nodeResolve(),
    commonjs({
      exclude: "./client.js"
    }),
    babel({
      exclude: "node_modules/**",
      presets: ["es2015-rollup"]
    })
  ],
  format: "cjs"
};
