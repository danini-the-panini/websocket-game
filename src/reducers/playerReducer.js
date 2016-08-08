import Immutable from 'immutable';
import { ADD_PLAYER, SET_NAME } from '../actionTypes';

export default function playerReducer(player, action) {
  const isCurrent = player && action.id === player.get('id');
  switch (action.type) {
  case ADD_PLAYER:
    return Immutable.Map({ id: action.id, ...action.data });
  case SET_NAME:
    return isCurrent ? player.set('name', action.name) : player;
  default:
    return player;
  }
}
