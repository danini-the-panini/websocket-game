import playerReducer from './playerReducer';
import { ADD_PLAYER, REMOVE_PLAYER } from '../actionTypes';

export default function playersReducer(players, action) {
  switch (action.type) {
  case ADD_PLAYER:
    return players.set(action.id, playerReducer(undefined, action));
  case REMOVE_PLAYER:
    return players.delete(action.id);
  default:
    return players.map(v => playerReducer(v, action));
  }
}
