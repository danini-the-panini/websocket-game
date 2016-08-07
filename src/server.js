/* eslint-env node */

import express from 'express';
import expressWs from 'express-ws';

import configureStore from './configureStore';
import serverReducer from './serverReducer';
import {
  onClientConnected, onClientAction, onClientDisconnected
} from './serverActionCreators';

const store = configureStore(serverReducer);

const app = express();
expressWs(app);

app.use(express.static('public'));

let nextId = 1;

app.ws('/game', ws => {
  const id = nextId++;
  store.dispatch(onClientConnected(id, ws));
  ws.on('message', msg => {
    store.dispatch(onClientAction(id, JSON.parse(msg)));
  });
  ws.on('close', () => {
    store.dispatch(onClientDisconnected(id));
  });
  ws.on('error', () => {
    // handle client error?
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`); // eslint-disable-line no-console
});
