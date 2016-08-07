import Immutable from 'immutable';
import { ADD_PLAYER, JOIN_SERVER } from '../actionTypes';

export default function playerReducer(player, action) {
  const isCurrent = player && action.id === player.get('id');
  switch (action.type) {
  case ADD_PLAYER:
    return Immutable.Map({ id: action.id, ...action.data });
  case JOIN_SERVER:
    return isCurrent ? player.set('name', action.name) : player;
  default:
    return player;
  }
}
