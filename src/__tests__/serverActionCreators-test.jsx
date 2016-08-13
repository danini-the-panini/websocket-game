/* eslint-env jest */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

const mockWebSocket = () => ({
  send: jest.fn()
});

import {
  ADD_PLAYER
} from '../actionTypes';

import * as serverActionCreators from '../serverActionCreators';
import getInitialState from '../getInitialState';

describe('Server Action Creators', function() {
  // TODO
  describe('.onClientConnected', function() {
    it('adds new player object and sends acknowledgement to client', function() {
      const store = mockStore(getInitialState());
      const ws = mockWebSocket();

      store.dispatch(serverActionCreators.onClientConnected(123, ws));

      expect(store.getActions()[0].type).toBe(ADD_PLAYER);
      expect(ws.send).toBeCalled();
    });
  });
});
