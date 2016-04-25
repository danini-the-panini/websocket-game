import THREE from "three";

import Trait from "../trait";

export default class Position extends Trait {
  constructor(game) {
    super(game);
    this.object = new THREE.Object3D();
    this.velocity = new THREE.Vector3();
    this.angularVelocity = 0;

    this._vector = new THREE.Vector3();
  }

  update(details) {
    this._vector.copy(this.velocity).multiplyScalar(details.delta);
    this.object.position.add(this._vector);

    this.object.rotation.z += this.angularVelocity * details.delta;
  }

  cleanUp() {
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }
}
