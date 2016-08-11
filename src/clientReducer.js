import gameReducer from './reducers';
import {
  CONNECTING_TO_SERVER, CONNECTED_TO_SERVER, DISCONNECTED_FROM_SERVER, CONNECTION_ACK,
  WINDOW_ANIMATE, WINDOW_RESIZE
} from './actionTypes';
import getInitialState from './getInitialState';

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
    return state; // TODO
  case WINDOW_RESIZE:
    return state.merge({ windowWidth: action.width, windowHeight: action.height });
  default:
    return state;
  }
}

export default function clientReducer(state, action) {
  return gameReducer(clientReducerImpl(state, action), action);
}
