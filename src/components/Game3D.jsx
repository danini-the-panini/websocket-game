import React from 'react';
import React3 from 'react-three-renderer';
import THREE from 'three';
import { connect, Provider } from 'react-redux';
import Immutable from 'immutable';
import storeShape from 'react-redux/lib/utils/storeShape';

import {
  connectToServer, disconnectFromServer, onAnimate, onWindowResize, onKeyDown, onKeyUp
} from '../clientActionCreators';
import Tank from './Tank';

export default class Game3D extends React.Component {
  static propTypes = {
    connecting: React.PropTypes.bool,
    player: React.PropTypes.instanceOf(Immutable.Map),
    players: React.PropTypes.instanceOf(Immutable.Map),
    width: React.PropTypes.number,
    height: React.PropTypes.number,

    connectToServer: React.PropTypes.func.isRequired,
    disconnectFromServer: React.PropTypes.func.isRequired,
    onAnimate: React.PropTypes.func.isRequired,
    onWindowResize: React.PropTypes.func.isRequired,
    onKeyDown: React.PropTypes.func.isRequired,
    onKeyUp: React.PropTypes.func.isRequired,

    store: storeShape
  }

  static contextTypes = {
    store: storeShape
  }

  constructor(props, context) {
    super(props, context);
    this.store = props.store || context.store;
  }

  componentDidMount() {
    window.addEventListener('resize', this.props.onWindowResize);
    document.addEventListener('keydown', this.props.onKeyDown);
    document.addEventListener('keyup', this.props.onKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onWindowResize);
  }

  onConnect = () => {
    this.props.connectToServer(this.refs.nameInput.value);
  }

  onDisconnect = () => {
    this.props.disconnectFromServer();
  }

  mapPlayers(cb) {
    if (this.props.players.isEmpty()) return null;
    return this.props.players.map(cb).toList();
  }

  render() {
    const { width, height, onAnimate } = this.props;
    if (this.props.player) {
      return (
        <React3 mainCamera="camera" {...{width, height, onAnimate}}>
          <scene>
            <Provider store={this.store}>
              <group>
                <perspectiveCamera name="camera"
                  fov={75} aspect={width / height} near={0.1} far={1000}
                  position={new THREE.Vector3(0, 0, 5)} />

                {this.mapPlayers((player, id) => (
                  <Tank.Connected playerId={id} key={id} />
                ))}
              </group>
            </Provider>
          </scene>
        </React3>
      );
    }
    return null;
  }
}

Game3D.Connected = connect(
  state => {
    const players = state.get('players');
    const playerId = state.get('playerId');
    return {
      connecting: state.get('connecting'),
      player: players.get(playerId),
      players,
      width: state.get('windowWidth') || window.innerWidth,
      height: state.get('windowHeight') || window.innerHeight
    };
  },
  {
    connectToServer, disconnectFromServer, onAnimate, onWindowResize, onKeyDown, onKeyUp
  }
)(Game3D);
