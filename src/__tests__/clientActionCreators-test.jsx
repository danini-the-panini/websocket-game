/* eslint-env jest */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

import {
  WINDOW_RESIZE, KEY_DOWN, KEY_UP
} from '../actionTypes';

import getInitialState from '../getInitialState';
import * as clientActionCreators from '../clientActionCreators';

describe('Cient Action Creators', function() {
  describe('onWindowResize', function() {
    it('creates a "onWindowResize" action', function() {
      expect(clientActionCreators.onWindowResize().type).toBe(WINDOW_RESIZE);
    });
  });

  describe('onKeyDown', function() {
    it('creates a "onKeyDown" action when the key is not pressed', function() {
      const store = mockStore(getInitialState());
      store.dispatch(clientActionCreators.onKeyDown({ key: 'ArrowLeft' }));

      const action = store.getActions()[0];
      expect(action.type).toBe(KEY_DOWN);
      expect(action.key).toBe('ArrowLeft');
    });

    it('does not create a "onKeyDown" action when the key is already pressed', function() {
      const store = mockStore(getInitialState().merge({ keys: { ArrowLeft: true } }));
      store.dispatch(clientActionCreators.onKeyDown({ key: 'ArrowLeft' }));

      expect(store.getActions().length).toBe(0);
    });
  });

  describe('onKeyUp', function() {
    it('creates a "onKeyUp" action', function() {
      const action = clientActionCreators.onKeyUp({ key: 'ArrowLeft' });
      expect(action.type).toBe(KEY_UP);
      expect(action.key).toBe('ArrowLeft');
    });
  });
});
