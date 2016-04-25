import THREE from "three";
import { assert } from "chai";

import Renderable from "../../src/traits/renderable";
import Position from "../../src/traits/position";
import Entity from "../../src/entity";

describe("Renderable", () => {
  describe("#attachTo", () => {
    it("attaches the renderable object to the entity's position trait", () => {
      const entity = new Entity();
      const positionTrait = new Position();
      const renderableObject = new THREE.Object3D();
      const renderable = new Renderable(renderableObject);
      entity.addTrait(positionTrait);

      entity.addTrait(renderable);

      assert.include(positionTrait.object.children, renderableObject);
    });

    it("throws if the entity has no position trait", () => {
      const entity = new Entity();
      const renderableObject = new THREE.Object3D();
      const renderable = new Renderable(renderableObject);

      assert.throws(() => entity.addTrait(renderable), "Entity has no Position");
    });
  });

  describe("#detachFrom", () => {
    it("removes the renderable object from the entity's position trait", () => {
      const entity = new Entity();
      const positionTrait = new Position();
      const renderableObject = new THREE.Object3D();
      const renderable = new Renderable(renderableObject);
      entity.addTrait(positionTrait);
      entity.addTrait(renderable);

      entity.removeTrait(renderable);

      assert.notInclude(positionTrait.object.children, renderableObject);
    });
  });
});
