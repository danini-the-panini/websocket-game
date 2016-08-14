import Immutable from 'immutable';

import playerReducer from './playerReducer';
import { ADD_PLAYER, REMOVE_PLAYER } from '../actionTypes';

export default function playersReducer(players, action) {
  switch (action.type) {
  case ADD_PLAYER:
    return players.set(action.id, Immutable.Map({ id: action.id, ...action.data }));
  case REMOVE_PLAYER:
    return players.delete(action.id);
  default:
    return action.id ? players.set(action.id, playerReducer(players.get(action.id), action)) : players;
  }
}
