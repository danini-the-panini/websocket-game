/* eslint-env jest */

import Immutable from 'immutable';

import playerReducer from '../playerReducer';
import { addPlayer, setName } from '../../actions/playerActionCreators';

describe('playerReducer', function() {
  describe('adding a player', function() {
    it('returns a new player object', function() {
      const newPlayer = playerReducer(undefined, addPlayer(123));

      expect(newPlayer.get('id')).toBe(123);
    });
  });

  describe('setting player name', function() {
    it('sets the name on the player', function() {
      const oldPlayer = Immutable.Map({ id: 123 });

      const newPlayer = playerReducer(oldPlayer, setName(123, 'John Doe'));

      expect(newPlayer.get('name')).toBe('John Doe');
    });

    it('does not set the player name if the id is not that of the player', function() {
      const oldPlayer = Immutable.Map({ id: 123 });

      const newPlayer = playerReducer(oldPlayer, setName(999, 'John Doe'));

      expect(newPlayer.has('name')).toBe(false);
    });
  });
});
