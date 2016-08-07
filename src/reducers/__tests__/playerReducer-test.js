/* eslint-env jest */

import playerReducer from '../playerReducer';
import { addPlayer } from '../../actions/playerActionCreators';

describe('playerReducer', function() {
  describe('adding a player', function() {
    it('returns a new player object', function() {
      const newPlayer = playerReducer(undefined, addPlayer(123));

      expect(newPlayer.get('id')).toBe(123);
    });
  });
});
