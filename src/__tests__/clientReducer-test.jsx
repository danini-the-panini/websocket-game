/* eslint-env jest */

import {
  WINDOW_RESIZE, KEY_UP, KEY_DOWN
} from '../actionTypes';

import clientReducer from '../clientReducer';
import getInitialState from '../getInitialState';

describe('Cient Reducer', function() {
  // TODO
  describe('when the window resizes', function() {
    it('sets the window dimensions on the state', function() {
      const action = {
        type: WINDOW_RESIZE,
        width: 1440, height: 900
      };
      const newState = clientReducer(getInitialState(), action);

      expect(newState.get('windowWidth')).toBe(1440);
      expect(newState.get('windowHeight')).toBe(900);
    });
  });

  describe('when a key is pressed', function() {
    it('sets the state', function() {
      const action = {
        type: KEY_DOWN,
        code: 42
      };
      const newState = clientReducer(getInitialState(), action);

      expect(newState.get('keys').get(42)).toBe(true);
    });
  });

  describe('when a key is unpressed', function() {
    it('sets the state', function() {
      const action = {
        type: KEY_UP,
        code: 42
      };
      const newState = clientReducer(getInitialState(), action);

      expect(newState.get('keys').get(42)).toBe(false);
    });
  });
});
