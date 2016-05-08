import THREE from "three";

import "../../support/chai_three";

import Game from "../../../src/game";
import Entity from "../../../src/entity";
import KeyboardControlable from "../../../src/traits/keyboardControlable";
import Renderable from "../../../src/traits/renderable";
import LawsOfMotion from "../../../src/traits/lawsOfMotion";

const RIGHT = 37;
const UP = 38;
const LEFT = 39;
const DOWN = 40;
const SPACE = 32;

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
