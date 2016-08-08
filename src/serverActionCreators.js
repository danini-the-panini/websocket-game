import { CONNECTION_ACK, JOIN_SERVER, LEAVE_SERVER } from './actionTypes';
import { addPlayer, removePlayer, setName } from './actions/playerActionCreators';

function connectionAck(id) {
  return { type: CONNECTION_ACK, id };
}

export function onClientConnected(id, ws) {
  return dispatch => {
    dispatch(addPlayer(id, { ws }));
    ws.send(JSON.stringify(connectionAck(id)));
  };
}

function broadcastAllButSource(players, id, action) {
  players
    .filterNot((_, key) => key === id)
    .map(player => player.get('ws'))
    .forEach(ws => ws.send(JSON.stringify({ ...action, id })));
}

function broadcastAll(players, id, action) {
  players
    .map(player => player.get('ws'))
    .forEach(ws => ws.send(JSON.stringify({ ...action, id })));
}

function dispatchPlayerAction(dispatch, id, action) {
  dispatch({ ...action, id });
}

export function onClientAction(id, action) {
  return (dispatch, getStore) => {
    const players = getStore().get('players');
    const player = players.get(id);
    switch (action.type) {
    case JOIN_SERVER:
      // TODO: normalize name!
      dispatch(setName(id, action.name));
      broadcastAll(players, id, action);
      players
        .filterNot((_, key) => key === id)
        .forEach(p => player.get('ws').send(JSON.stringify({
          type: JOIN_SERVER,
          id: p.get('id'),
          name: p.get('name')
        })));
      break;
    default:
      dispatchPlayerAction(dispatch, id, action);
      broadcastAllButSource(players, id, action);
    }
  };
}

export function onClientDisconnected(id) {
  return (dispatch, getStore) => {
    const players = getStore().get('players');
    dispatch(removePlayer(id));
    broadcastAllButSource(players, id, { type: LEAVE_SERVER });
  };
}
