/* eslint-env node */
/* eslint-env jasmine */

require('jasmine-enzyme/lib/jest');
const jasmineReporters = require('jasmine-reporters');

jasmine.VERBOSE = true;
jasmine.getEnv().addReporter(
  new jasmineReporters.JUnitXmlReporter({
    consolidateAll: true,
    savePath: 'output/',
    filePrefix: 'test-results'
  })
);
