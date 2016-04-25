import { assert } from "chai";

import KeyboardControlable from "../../src/traits/keyboardControlable";
import Position from "../../src/traits/position";
import Entity from "../../src/entity";

describe("KeyboardControlable", () => {
  describe("#attachTo", () => {
    it("throws if there is no position trait", () => {
      const entity = new Entity();
      const renderable = new KeyboardControlable();

      assert.throws(() => entity.addTrait(renderable), "Entity has no Position trait");
    });

    it("doesn't throw if there is a position trait", () => {
      const entity = new Entity();
      const positionTrait = new Position();
      const renderable = new KeyboardControlable();
      entity.addTrait(positionTrait);

      assert.doesNotThrow(() => entity.addTrait(renderable));
    });
  });

  describe("#update", () => {
    // TODO
  });
});
