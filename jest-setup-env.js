/* eslint-env node */
/* eslint-env jasmine */

import path from 'path';
import 'jasmine-enzyme/lib/jest';
import jasmineReporters from 'jasmine-reporters';

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

// Custom matchers

import Immutable from 'immutable';

const customMatchers = {
  toEqualJS() {
    return {
      compare(actual, expected) {
        const pass = Immutable.is(actual, Immutable.fromJS(expected));
        const message = pass ?
          `Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(expected)}` :
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`;
        return { pass, message };
      }
    };
  }
};

beforeEach(function() {
  jasmine.addMatchers(customMatchers);
});
