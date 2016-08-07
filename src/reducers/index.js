import Immutable from 'immutable';

import playersReducer from './playersReducer';

export default function gameReducer(state, action) {
  return state.merge(Immutable.Map({
    players: playersReducer(state.get('players'), action)
  }));
}
