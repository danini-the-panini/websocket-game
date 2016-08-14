import THREE from 'three';
import Immutable from 'immutable';

const MAX_SPEED = 0.2;
const ACCELERATION = 0.005;
const DAMPENING = 0.99;

const TWO_PI = Math.PI*2;

const velocity = new THREE.Vector3();
const _vector = new THREE.Vector3();

function controlPlayer(state, player) {
  const keys = state.get('keys');
  if (!keys) return player;
  const playerVelocity = player.get('velocity') || Immutable.Map({ x: 0, y: 0, z: 0 });

  velocity.set(
    playerVelocity.get('x'),
    playerVelocity.get('y'),
    playerVelocity.get('z')
  );

  let playerRotation = player.get('rotation') || 0;
  if(keys.get('ArrowUp')) {
    _vector
      .set(Math.cos(playerRotation), Math.sin(playerRotation), 0)
      .multiplyScalar(ACCELERATION);
    velocity.add(_vector);
  } else if (keys.get('ArrowDown')) {
    _vector
      .set(Math.cos(playerRotation), Math.sin(playerRotation), 0)
      .multiplyScalar(-ACCELERATION);
    velocity.add(_vector);
  } else {
    velocity.multiplyScalar(DAMPENING);
  }
  if (velocity.lengthSq() > MAX_SPEED * MAX_SPEED) {
    velocity.setLength(MAX_SPEED);
  }
  if(keys.get('ArrowLeft')) {
    playerRotation += 0.1;
  } else if (keys.get('ArrowRight')) {
    playerRotation -= 0.1;
  }
  if (playerRotation > TWO_PI) {
    playerRotation -= TWO_PI;
  } else if (playerRotation < 0) {
    playerRotation = TWO_PI - playerRotation;
  }
  return player
    .merge({
      velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
      rotation: playerRotation
    });
}

function animatePlayer(state, player) {
  const playerVelocity = player.get('velocity') ||
    Immutable.Map({ x: 0, y: 0, z: 0 });
  const playerPosition = player.get('position') ||
    Immutable.Map({ x: 0, y: 0, z: 0 });

  return player.set('position', Immutable.Map({
    x: playerPosition.get('x') + playerVelocity.get('x'),
    y: playerPosition.get('y') + playerVelocity.get('y'),
    z: playerPosition.get('z') + playerVelocity.get('z')
  }));
}

export default function clientAnimationReducer(state) {
  const players = state.get('players');
  const playerId = state.get('playerId');
  const currentPlayer = players.get(playerId);

  return state.set('players', players.map(player => {
    if (player === currentPlayer) {
      return animatePlayer(state, controlPlayer(state, player));
    }
    return animatePlayer(state, player);
  }));
}
