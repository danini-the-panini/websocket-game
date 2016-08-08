import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { connectToServer, disconnectFromServer } from '../clientActionCreators';

export default class Game extends React.Component {
  static propTypes = {
    connecting: React.PropTypes.bool,
    player: React.PropTypes.instanceOf(Immutable.Map),
    players: React.PropTypes.instanceOf(Immutable.Map),

    connectToServer: React.PropTypes.func.isRequired,
    disconnectFromServer: React.PropTypes.func.isRequired
  }

  onConnect = () => {
    this.props.connectToServer(this.refs.nameInput.value);
  }

  onDisconnect = () => {
    this.props.disconnectFromServer();
  }

  render() {
    if (this.props.player) {
      return (
        <div>
          <h1>#{this.props.player.get('id')}: {this.props.player.get('name')}</h1>
          <button onClick={this.onDisconnect}>Disconnect</button>
          <hr />
          <ol>
            {this.props.players.isEmpty() ? null : this.props.players.entrySeq().map(([id, player]) => (
              <li key={id}>#{player.get('id')}: {player.get('name')}</li>
            ))}
          </ol>
        </div>
      );
    }
    if (this.props.connecting) {
      return <div>Connecting...</div>;
    }
    return (
      <div>
        <label>Name</label>
        <input ref="nameInput" placeholder="e.g. John Doe"/>
        <button onClick={this.onConnect}>Connect</button>
      </div>
    );
  }
}

Game.Connected = connect(
  state => {
    const players = state.get('players');
    const playerId = state.get('playerId');
    return {
      connecting: state.get('connecting'),
      player: players.get(playerId),
      players
    };
  },
  { connectToServer, disconnectFromServer }
)(Game);
