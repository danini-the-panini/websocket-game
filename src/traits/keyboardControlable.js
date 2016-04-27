import THREE from "three";

import Trait from "../trait";

const RIGHT = 37;
const UP = 38;
const LEFT = 39;
const DOWN = 40;

const MAX_SPEED = 0.012;
const ACCELERATION = 0.0003;
const DAMPENING = 0.99;
const ANGULAR_VELOCITY = 0.006;

export default class KeyboardControlable extends Trait {
  update(details) {
    const velocity = this.entity.traits.LawsOfMotion.velocity;
    const object = this.entity.traits.Renderable.object;
    if(details.keys[UP]) {
      velocity.add(new THREE.Vector3(0, 1, 0).applyQuaternion(object.quaternion).normalize().multiplyScalar(ACCELERATION));
    } else if (details.keys[DOWN]) {
      velocity.add(new THREE.Vector3(0, 1, 0).applyQuaternion(object.quaternion).normalize().multiplyScalar(-ACCELERATION));
    } else {
      velocity.multiplyScalar(DAMPENING);
    }
    if (velocity.lengthSq() > MAX_SPEED * MAX_SPEED) {
      velocity.setLength(MAX_SPEED);
    }
    if(details.keys[LEFT]) {
      this.entity.traits.LawsOfMotion.angularVelocity = -ANGULAR_VELOCITY;
    } else if (details.keys[RIGHT]) {
      this.entity.traits.LawsOfMotion.angularVelocity = ANGULAR_VELOCITY;
    } else {
      this.entity.traits.LawsOfMotion.angularVelocity = 0;
    }
  }
}
