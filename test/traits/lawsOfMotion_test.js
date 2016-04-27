import THREE from "three";
import { assert } from "chai";

import LawsOfMotion from "../../src/traits/lawsOfMotion";
import Renderable from "../../src/traits/renderable";
import Entity from "../../src/entity";

describe("LawsOfMotion", () => {
  describe("#update", () => {
    it("updates the position and rotation based on velocity and delta", () => {
      const entity = new Entity();
      const renderable = new Renderable(new THREE.Object3D());
      entity.addTrait(renderable);
      const lawsOfMotion = new LawsOfMotion();
      entity.addTrait(lawsOfMotion);

      renderable.object.position.set(1, 1, 0);
      renderable.object.rotation.set(0, 0, 1);
      lawsOfMotion.velocity.set(1, 2, 0);
      lawsOfMotion.angularVelocity = 2;

      entity.update({ delta: 1 });

      assert.deepEqual(renderable.object.position.toArray(), [2, 3, 0]);
      assert.deepEqual(renderable.object.rotation.toArray(), [0, 0, 3, "XYZ"]);

      lawsOfMotion.velocity.set(-2, 1, 0);
      lawsOfMotion.angularVelocity = -2;
      entity.update({ delta: 2 });

      assert.deepEqual(renderable.object.position.toArray(), [-2, 5, 0]);
      assert.deepEqual(renderable.object.rotation.toArray(), [0, 0, -1, "XYZ"]);
    });
  });
});
