import THREE from "three";

import Trait from "../trait";

export default class LawsOfMotion extends Trait {
  constructor(game) {
    super(game);
    this.velocity = new THREE.Vector3();
    this.angularVelocity = 0;

    this._vector = new THREE.Vector3();
  }

  update(details) {
    this._vector.copy(this.velocity).multiplyScalar(details.delta);
    this.entity.traits.Renderable.object.position.add(this._vector);

    this.entity.traits.Renderable.object.rotation.z += this.angularVelocity * details.delta;
  }
}
