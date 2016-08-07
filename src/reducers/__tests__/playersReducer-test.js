/* eslint-env jest */

import Immutable from 'immutable';

import playersReducer from '../playersReducer';
import { addPlayer, removePlayer } from '../../actions/playerActionCreators';

describe('playerReducer', function() {
  describe('adding a player', function() {
    it('adds a new player to the players map', function() {
      const oldPlayers = Immutable.Map({})
        .set(123, { id: 123 })
        .set(234, { id: 234 });

      const newPlayers = playersReducer(oldPlayers, addPlayer(345));

      expect(newPlayers.has(123)).toBe(true);
      expect(newPlayers.has(234)).toBe(true);
      expect(newPlayers.has(345)).toBe(true);
    });
  });

  describe('removing a player', function() {
    it('removes the specified player from the players map', function() {
      const oldPlayers = Immutable.Map({})
        .set(123, { id: 123 })
        .set(234, { id: 234 });

      const newPlayers = playersReducer(oldPlayers, removePlayer(123));

      expect(newPlayers.has(123)).toBe(false);
      expect(newPlayers.has(234)).toBe(true);
    });
  });
});
