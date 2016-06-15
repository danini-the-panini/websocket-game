const THREE = require("three")

const Game = require("../../src/game")
const Renderable = require("../../src/traits/renderable")
const Follower = require("../../src/traits/follower")

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

      expect(follower.traits.Renderable.object.position).to.be.vector3(5, 7, 9);

      followee.traits.Renderable.object.position.set(7, 8, 9);
      follower.update({ delta: 1 });

      expect(follower.traits.Renderable.object.position).to.be.vector3(11, 13, 15);
    });
  });
});
