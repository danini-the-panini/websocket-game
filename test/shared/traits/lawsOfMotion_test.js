import THREE from "three";

import "../../support/chai_three";

import Game from "../../../src/game";
import LawsOfMotion from "../../../src/traits/lawsOfMotion";
import Renderable from "../../../src/traits/renderable";

describe("LawsOfMotion", () => {
  describe("#update", () => {
    it("updates the position and rotation based on velocity and delta", () => {
      const game = new Game();

      const entity = game.createEntity();
      const renderable = new Renderable(new THREE.Object3D());
      entity.addTrait(renderable);
      const lawsOfMotion = new LawsOfMotion();
      entity.addTrait(lawsOfMotion);

      renderable.object.position.set(1, 1, 0);
      renderable.object.rotation.set(0, 0, 1);
      lawsOfMotion.velocity.set(1, 2, 0);
      lawsOfMotion.angularVelocity = 2;

      entity.update({ delta: 1 });

      expect(renderable.object.position).to.be.vector3(2, 3, 0);
      expect(renderable.object.rotation.toArray()).to.deep.equal([0, 0, 3, "XYZ"]);

      lawsOfMotion.velocity.set(-2, 1, 0);
      lawsOfMotion.angularVelocity = -2;
      entity.update({ delta: 2 });

      expect(renderable.object.position).to.be.vector3(-2, 5, 0);
      expect(renderable.object.rotation.toArray()).to.deep.equal([0, 0, -1, "XYZ"]);
    });
  });
});
