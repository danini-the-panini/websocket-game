import Immutable from 'immutable';

import gameReducer from './reducers';
import {
  CONNECTING_TO_SERVER, CONNECTED_TO_SERVER, DISCONNECTED_FROM_SERVER, CONNECTION_ACK,
  WINDOW_ANIMATE, WINDOW_RESIZE, KEY_UP, KEY_DOWN
} from './actionTypes';
import getInitialState from './getInitialState';

import clientAnimationReducer from './clientAnimationReducer';

function keysReducer(keys = Immutable.Map(), action) {
  switch (action.type) {
  case KEY_DOWN:
    return keys.set(action.key, true);
  case KEY_UP:
    return keys.set(action.key, false);
  }
}

function clientReducerImpl(state, action) {
  switch (action.type) {
  case CONNECTING_TO_SERVER:
    return state.set('connecting', true);
  case CONNECTED_TO_SERVER:
    return state.set('connecting', false).set('ws', action.ws);
  case CONNECTION_ACK:
    return state.set('playerId', action.id);
  case DISCONNECTED_FROM_SERVER:
    return getInitialState();
  case WINDOW_ANIMATE:
    return clientAnimationReducer(state); // TODO
  case WINDOW_RESIZE:
    return state.merge({ windowWidth: action.width, windowHeight: action.height });
  default:
    return state.set('keys', keysReducer(state.get('kets'), action));
  }
}

export default function clientReducer(state, action) {
  return gameReducer(clientReducerImpl(state, action), action);
}
