import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import gameReducer from './reducers';
import getInitialState from './getInitialState';

import { Iterable } from 'immutable';

const stateTransformer = state => Iterable.isIterable(state) ? state.toJS() : state;
const loggerMiddleware = createLogger({ stateTransformer });

export default function configureStore(reducer = gameReducer, initialState = {}) {
  return createStore(
    reducer,
    getInitialState(initialState),
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  );
}
