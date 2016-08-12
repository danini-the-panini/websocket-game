/* eslint-env jest */

import {
  WINDOW_RESIZE
} from '../actionTypes';

import * as clientActionCreators from '../clientActionCreators';

describe('Cient Action Creators', function() {
  // TODO
  describe('onWindowResize', function() {
    it('creates a "onWindowResize" action', function() {
      expect(clientActionCreators.onWindowResize().type).toBe(WINDOW_RESIZE);
    });
  });
});
