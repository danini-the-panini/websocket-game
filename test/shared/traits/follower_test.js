import THREE from "three";

import Game from "../../../src/game";
import Renderable from "../../../src/traits/renderable";
import Follower from "../../../src/traits/follower";

describe("Follower", () => {
  describe("#update", () => {
    it("sets the follower's position based on the followee and offset", () => {
      const game = new Game();
      const followee = game.createEntity();
      followee.addTrait(new Renderable(new THREE.Object3D()));
      followee.traits.Renderable.object.position.set(1, 2, 3);

      const follower = game.createEntity();
      follower.addTrait(new Renderable(new THREE.Object3D()));
      follower.addTrait(new Follower(followee, new THREE.Vector3(4, 5, 6)));

      assert.deepEqual(follower.traits.Renderable.object.position.toArray(), [5, 7, 9]);

      followee.traits.Renderable.object.position.set(7, 8, 9);

      follower.update({ delta: 1 });

      assert.deepEqual(follower.traits.Renderable.object.position.toArray(), [11, 13, 15]);
    });
  });
});
