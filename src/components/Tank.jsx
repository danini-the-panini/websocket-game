import React from 'react';
import THREE from 'three';
import { connect } from 'react-redux';
import Immutable from 'immutable';

export default class Tank extends React.Component {
  static propTypes = {
    player: React.PropTypes.instanceOf(Immutable.Map)
  }

  getRotation() {
    return new THREE.Euler(
      0.0,
      0.0,
      this.props.player.get('rotation') || 0.0
    );
  }

  getPosition() {
    const position = this.props.player.get('position');
    if (!position) return new THREE.Vector3();
    return new THREE.Vector3(
      position.get('x') || 0.0,
      position.get('y') || 0.0,
      0.0
    );
  }

  render() {
    return (
      <object3D rotation={this.getRotation()} position={this.getPosition()} >
        <mesh>
          <boxGeometry width={1} height={1} depth={1} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
        <mesh position={new THREE.Vector3(0.5, 0.0, 0.5)}>
          <boxGeometry width={0.5} height={0.5} depth={0.5} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
      </object3D>
    );
  }
}

Tank.Connected = connect(
  (state, { playerId }) => ({
    player: state.get('players').get(playerId)
  }),
  {}
)(Tank);
