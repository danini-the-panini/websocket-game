/* eslint-env jest */

import serverReducer from '../serverReducer';
import getInitialState from '../getInitialState';

describe('Server Reducer', function() {
  // TODO
  describe('when an unknown action comes through', function() {
    it('does nothing', function() {
      const action = { type: 'UNKNOWN' };
      const oldState = getInitialState();
      const newState = serverReducer(oldState, action);

      expect(newState).toBe(oldState);
    });
  });
});
