import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";

export default {
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
  ],
  sourceMap: true,
  intro: "if (typeof module !== 'undefined' && module.exports) require('source-map-support').install();"
};
