import {
  CONNECTING_TO_SERVER, CONNECTED_TO_SERVER, DISCONNECTED_FROM_SERVER, CONNECTION_ACK, JOIN_SERVER
} from './actionTypes';
import { addPlayer } from './actions/playerActionCreators';

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
    case CONNECTION_ACK:
      dispatch(addPlayer(action.id));
      dispatch(action);
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
