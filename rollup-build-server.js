#!/usr/bin/env node

const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');

rollup.rollup({
  entry: './server.js',
  plugins: [
    nodeResolve()
  ]
}).then((bundle) => {
  const result = bundle.generate({
    exports: 'none'
  });

  console.log(result.code);
}).catch((error) => {
  console.error(error.stack);
});
