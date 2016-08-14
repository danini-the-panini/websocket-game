import Immutable from 'immutable';
import { SET_NAME, PLAYER_UPDATE } from '../actionTypes';

export default function playerReducer(player, action) {
  switch (action.type) {
  case SET_NAME:
    return player.set('name', action.name);
  case PLAYER_UPDATE:
    return player
      .set('position', Immutable.Map(action.position))
      .set('velocity', Immutable.Map(action.velocity))
      .set('rotation', action.rotation);
  default:
    return player;
  }
}
