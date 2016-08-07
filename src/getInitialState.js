import Immutable from 'immutable';

export default function getInitialState(state = {}) {
  return Immutable.fromJS({
    players: {}
  }).merge(state);
}
