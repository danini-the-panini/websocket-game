import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import gameReducer from './reducers';
import getInitialState from './getInitialState';

import { Iterable } from 'immutable';

const stateTransformer = state => Iterable.isIterable(state) ? state.toJS() : state;
const loggerMiddleware = createLogger({
  level: ({ type }) => type.match(/ANIMATE/) ? null : 'log',
  logger: {...console, group: (...args) => {
    for (let arg of args) if (arg.match(/ANIMATE/)) return;
    console.group(...args); // eslint-disable-line no-console
  }},
  stateTransformer
});

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
