import {
  CONNECTING_TO_SERVER, CONNECTED_TO_SERVER, DISCONNECTED_FROM_SERVER, JOIN_SERVER, LEAVE_SERVER, WINDOW_RESIZE, WINDOW_ANIMATE, KEY_UP, KEY_DOWN, PLAYER_UPDATE
} from './actionTypes';
import { addPlayer, removePlayer, setName } from './actions/playerActionCreators';

function connecting() {
  return { type: CONNECTING_TO_SERVER };
}

function connected(ws) {
  return { type: CONNECTED_TO_SERVER, ws };
}

function disconnected() {
  return {
    type: DISCONNECTED_FROM_SERVER
  };
}

function onServerAction(action) {
  return dispatch => {
    switch (action.type) {
    case JOIN_SERVER:
      dispatch(addPlayer(action.id));
      dispatch(setName(action.id, action.name));
      break;
    case LEAVE_SERVER:
      dispatch(removePlayer(action.id));
      break;
    default:
      dispatch(action);
    }
  };
}

export function connectToServer(name) {
  return dispatch => {
    dispatch(connecting());
    const ws = new WebSocket(`ws://${window.location.host}/game`);
    ws.onopen = () => {
      dispatch(connected(ws));
      ws.send(JSON.stringify({ type: JOIN_SERVER, name }));
    };
    ws.onclose = () => {
      dispatch(disconnected());
    };
    ws.onmessage = ({ data }) => {
      dispatch(onServerAction(JSON.parse(data)));
    };
    ws.onerror = () => {
      // TODO
    };
    return ws;
  };
}

export function disconnectFromServer() {
  return (dispatch, getState) => {
    getState().get('ws').close();
  };
}

export function onAnimate() {
  return (dispatch, getState) => {
    const state = getState();
    const player = state.get('players').get(state.get('playerId'));
    if (player) {
      state.get('ws').send(JSON.stringify({
        type: PLAYER_UPDATE,
        position: player.get('position'),
        velocity: player.get('velocity'),
        rotation: player.get('rotation')
      }));
    }
    dispatch({ type: WINDOW_ANIMATE, at: +(new Date()) });
  };
}

export function onWindowResize() {
  return {
    type: WINDOW_RESIZE,
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export function onKeyDown({ key }) {
  return (dispatch, getState) => {
    const state = getState();
    const keys = state.get('keys');
    if (keys && keys.get(key) === true) return;
    dispatch({ type: KEY_DOWN, key });
  };
}

export function onKeyUp({ key }) {
  return { type: KEY_UP, key };
}
