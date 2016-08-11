import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import clientReducer from './clientReducer';

import Game from './components/Game';
import Game3D from './components/Game3D';

const store = configureStore(clientReducer);

ReactDOM.render(
  <div>
    <Provider store={store}>
      <div>
        <Game.Connected />
        <Game3D.Connected />
      </div>
    </Provider>
  </div>,
  document.getElementById('react-root')
);
