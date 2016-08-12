/* eslint-env jest */

import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

const mockWebSocket = () => ({
  send: sinon.spy()
});

import {
  ADD_PLAYER, CONNECTION_ACK
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

      expect(store.getActions[0].type).toBe(ADD_PLAYER);
      expect(ws.sned).toHaveBeenCalledWith(sinon.match({ type: CONNECTION_ACK, id: 123 }));
    });
  });
});
