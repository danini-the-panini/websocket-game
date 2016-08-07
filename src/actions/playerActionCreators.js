import { ADD_PLAYER, REMOVE_PLAYER } from '../actionTypes';

export function addPlayer(id, data = {}) {
  return {
    type: ADD_PLAYER,
    id, data
  };
}

export function removePlayer(id) {
  return {
    type: REMOVE_PLAYER,
    id
  };
}
