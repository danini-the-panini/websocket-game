/* eslint-env node */
/* eslint-env jasmine */

const path = require('path');
require('jasmine-enzyme/lib/jest');
const jasmineReporters = require('jasmine-reporters');

let savePath = 'output/';
if (process.env.CIRCLE_TEST_REPORTS) {
  savePath = path.resolve(process.env.CIRCLE_TEST_REPORTS, 'jest');
}

jasmine.VERBOSE = true;
jasmine.getEnv().addReporter(
  new jasmineReporters.JUnitXmlReporter({
    savePath,
    consolidateAll: false
  })
);
