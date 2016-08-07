import gameReducer from './reducers';

function serverReducerImpl(state, action) {
  switch (action.type) {
  default:
    return state;
  }
}

export default function serverReducer(state, action) {
  return gameReducer(serverReducerImpl(state, action), action);
}
