import THREE from "three";
import { assert } from "chai";

import Position from "../../src/traits/position";

describe("Position", () => {
  describe("#constructor", () => {
    it("initializes a THREE.js object and velocities", () => {
      const trait = new Position();

      assert.instanceOf(trait.object, THREE.Object3D);
      assert.instanceOf(trait.velocity, THREE.Vector3);
      assert(trait.velocity.equals(new THREE.Vector3()));
      assert.equal(trait.angularVelocity, 0);
    });
  });

  describe("#update", () => {
    it("updates the position and rotation based on velocity and delta", () => {
      const trait = new Position();
      trait.object.position.set(1, 1, 0);
      trait.object.rotation.set(0, 0, 1);
      trait.velocity.set(1, 2, 0);
      trait.angularVelocity = 2;

      trait.update({ delta: 1 });

      assert.deepEqual(trait.object.position.toArray(), [2, 3, 0]);
      assert.deepEqual(trait.object.rotation.toArray(), [0, 0, 3, "XYZ"]);

      trait.velocity.set(-2, 1, 0);
      trait.angularVelocity = -2;
      trait.update({ delta: 2 });

      assert.deepEqual(trait.object.position.toArray(), [-2, 5, 0]);
      assert.deepEqual(trait.object.rotation.toArray(), [0, 0, -1, "XYZ"]);
    });
  });
});
