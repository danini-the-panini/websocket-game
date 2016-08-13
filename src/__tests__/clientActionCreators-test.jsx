/* eslint-env jest */

import {
  WINDOW_RESIZE, KEY_DOWN, KEY_UP
} from '../actionTypes';

import * as clientActionCreators from '../clientActionCreators';

describe('Cient Action Creators', function() {
  // TODO
  describe('onWindowResize', function() {
    it('creates a "onWindowResize" action', function() {
      expect(clientActionCreators.onWindowResize().type).toBe(WINDOW_RESIZE);
    });
  });

  describe('onKeyDown', function() {
    it('creates a "onKeyDown" action', function() {
      const action = clientActionCreators.onKeyDown(13);
      expect(action.type).toBe(KEY_DOWN);
      expect(action.code).toBe(13);
    });
  });

  describe('onKeyUp', function() {
    it('creates a "onKeyUp" action', function() {
      const action = clientActionCreators.onKeyUp(13);
      expect(action.type).toBe(KEY_UP);
      expect(action.code).toBe(13);
    });
  });
});
