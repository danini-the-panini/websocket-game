#!/usr/bin/env node

const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

rollup.rollup({
  entry: './server.js',
  plugins: [
    nodeResolve(),
    commonjs({
      exclude: './server.js'
    })
  ]
}).then((bundle) => {
  return bundle.generate({
    exports: 'none'
  });
}).then((result) => {
  console.log(result.code);
}).catch((error) => {
  console.error(error.stack);
});
