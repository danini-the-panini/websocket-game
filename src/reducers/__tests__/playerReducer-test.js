/* eslint-env jest */

import Immutable from 'immutable';

import playerReducer from '../playerReducer';
import { setName } from '../../actions/playerActionCreators';
import { PLAYER_UPDATE } from '../../actionTypes';

describe('playerReducer', function() {
  describe('setting player name', function() {
    it('sets the name on the player', function() {
      const oldPlayer = Immutable.Map({ id: 123 });

      const newPlayer = playerReducer(oldPlayer, setName(123, 'John Doe'));

      expect(newPlayer.get('name')).toBe('John Doe');
    });
  });

  describe('updating a player', function() {
    it('sets the new values on the player object', function() {
      const oldPlayer = Immutable.Map({ id: 123 });
      const playerUpdate = {
        position: { x: 1, y: 2, z: 3 },
        velocity: { x: 4, y: 5, z: 6 },
        rotation: 7
      };

      const newPlayer = playerReducer(oldPlayer, { type: PLAYER_UPDATE, ...playerUpdate });

      expect(newPlayer).toEqualJS({
        id: 123,
        ...playerUpdate
      });
    });
  });
});
