import { ADD_PLAYER, REMOVE_PLAYER, SET_NAME } from '../actionTypes';

export function addPlayer(id, data = {}) {
  return { type: ADD_PLAYER, id, data };
}

export function removePlayer(id) {
  return { type: REMOVE_PLAYER, id };
}

export function setName(id, name) {
  return { type: SET_NAME, id, name };
}
