/* eslint-env jest */

import { addPlayer, removePlayer } from '../playerActionCreators';
import { ADD_PLAYER, REMOVE_PLAYER } from '../../actionTypes';

describe('playerActionCreators', function() {
  describe('addPlayer', function() {
    it('creates an "add player" action', function() {
      const action = addPlayer(123);

      expect(action.type).toBe(ADD_PLAYER);
      expect(action.id).toBe(123);
    });
  });

  describe('removePlayer', function() {
    it('creates a "remove player" action', function() {
      const action = removePlayer(123);

      expect(action.type).toBe(REMOVE_PLAYER);
      expect(action.id).toBe(123);
    });
  });
});
