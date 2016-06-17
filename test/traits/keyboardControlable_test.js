const THREE = require("three");

require("../support/chai_three");

const Game = require("../../src/game");
const KeyboardControlable = require("../../src/traits/keyboardControlable");
const Renderable = require("../../src/traits/renderable");
const LawsOfMotion = require("../../src/traits/lawsOfMotion");

const UP = 38;

describe("KeyboardControlable", () => {
  describe("#update", () => {
    it("moves the entity based on keyboard input", () => {
      const game = new Game();
      const entity = game.createEntity();
      entity.addTrait(new Renderable(new THREE.Object3D()));
      entity.addTrait(new LawsOfMotion());
      entity.addTrait(new KeyboardControlable());

      const keys = {};
      keys[UP] = true;

      entity.update({ delta: 1, keys: keys });

      expect(entity.traits.LawsOfMotion.velocity).to.be.vector3(0, 0.0003, 0);
    });
  });
});
