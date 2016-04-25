import THREE from "three";

import Trait from "../trait";

const RIGHT = 37;
const UP = 38;
const LEFT = 39;
const DOWN = 40;

const MAX_SPEED = 0.012;
const ACCELERATION = 0.0003;
const DAMPENING = 0.99;

export default class KeyboardControlable extends Trait {
  update(details) {
    const velocity = this.entity.traits.Position.velocity;
    const object = this.entity.traits.Position.object;
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
      object.rotation.z -= 0.1;
    } else if (details.keys[RIGHT]) {
      object.rotation.z += 0.1;
    }
  }

  attachTo(entity) {
    if (!entity.traits.Position) {
      throw new Error("Entity has no Position trait");
    }
    super.attachTo(entity);
  }
}
