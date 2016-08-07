import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import clientReducer from './clientReducer';

import Game from './components/Game';

const store = configureStore(clientReducer);

ReactDOM.render(
  <Provider store={store}>
    <Game.Connected />
  </Provider>,
  document.getElementById('react-root')
);
