/* eslint-env jest */
/* eslint-env jasmine */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

const mockWebSocket = (name) => ({
  send: jasmine.createSpy(`WebSocket#send [${name}]`)
});

import {
  ADD_PLAYER, SET_NAME, JOIN_SERVER, PLAYER_UPDATE
} from '../actionTypes';

import * as serverActionCreators from '../serverActionCreators';
import getInitialState from '../getInitialState';

describe('Server Action Creators', function() {
  describe('.onClientConnected', function() {
    it('adds new player object and sends acknowledgement to client', function() {
      const store = mockStore(getInitialState());
      const ws = mockWebSocket();

      store.dispatch(serverActionCreators.onClientConnected(123, ws));

      expect(store.getActions()[0].type).toBe(ADD_PLAYER);
      expect(ws.send).toHaveBeenCalledWith('{"type":"CONNECTION_ACK","id":123}');
    });
  });

  describe('.onClientAction', function() {
    beforeEach(function() {
      this.players = Immutable.Map.of(
        123, Immutable.Map({ id: 123, ws: mockWebSocket(123) }),
        234, Immutable.Map({ id: 234, ws: mockWebSocket(234), name: 'Larry' }),
        345, Immutable.Map({ id: 345, ws: mockWebSocket(345), name: 'Kim' })
      );
      this.state = getInitialState().set('players', this.players);
      this.store = mockStore(this.state);
    });

    describe('JOIN_SERVER', function() {
      beforeEach(function() {
        this.action = { type: JOIN_SERVER, name: 'Bob' };
        this.store.dispatch(serverActionCreators.onClientAction(123, this.action));
      });

      it('sets the name of the player', function() {
        expect(this.store.getActions()[0]).toEqual(jasmine.objectContaining({
          type: SET_NAME,
          name: 'Bob'
        }));
      });

      it('broadcasts to ALL players', function() {
        const EXPECTED_MESSAGE = '{"type":"JOIN_SERVER","name":"Bob","id":123}';
        expect(this.players.getIn([123, 'ws']).send).toHaveBeenCalledWith(EXPECTED_MESSAGE);
        expect(this.players.getIn([234, 'ws']).send).toHaveBeenCalledWith(EXPECTED_MESSAGE);
        expect(this.players.getIn([345, 'ws']).send).toHaveBeenCalledWith(EXPECTED_MESSAGE);
      });

      it('sends the OTHER players to the JOINED player', function() {
        expect(this.players.getIn([123, 'ws']).send).toHaveBeenCalledTimes(3);
        expect(this.players.getIn([123, 'ws']).send)
          .toHaveBeenCalledWith('{"type":"JOIN_SERVER","id":234,"name":"Larry"}');
        expect(this.players.getIn([123, 'ws']).send)
          .toHaveBeenCalledWith('{"type":"JOIN_SERVER","id":345,"name":"Kim"}');
      });
    });

    describe('PLAYER_UPDATE', function() {
      beforeEach(function() {
        this.action = {
          type: PLAYER_UPDATE,
          position: { x: 1, y: 2, z: 3 },
          velocity: { x: 4, y: 5, z: 6 },
          rotation: 7
        };
        this.store.dispatch(serverActionCreators.onClientAction(123, this.action));
      });

      it('dispatches the action', function() {
        const dispatchedAction = this.store.getActions()[0];
        expect(dispatchedAction).toEqual(jasmine.objectContaining(this.action));
        expect(dispatchedAction.id).toBe(123);
      });

      it('broadcasts the action to OTHER players', function() {
        const EXPECTED_MESSAGE = '{"type":"PLAYER_UPDATE","position":{"x":1,"y":2,"z":3},"velocity":{"x":4,"y":5,"z":6},"rotation":7,"id":123}';
        expect(this.players.getIn([123, 'ws']).send).not.toHaveBeenCalled();
        expect(this.players.getIn([234, 'ws']).send).toHaveBeenCalledWith(EXPECTED_MESSAGE);
        expect(this.players.getIn([345, 'ws']).send).toHaveBeenCalledWith(EXPECTED_MESSAGE);
      });
    });
  });
});
