import Entity from "../src/entity";
import Trait from "../src/trait";

class Testable extends Trait {
  constructor() {
    super();
    this.updateCalls = [];
    this.attachToCalls = [];
    this.detachFromCalls = [];
  }
  update(...args) {
    this.updateCalls.push(args);
  }
  attachTo(...args) {
    super.attachTo(...args);
    this.attachToCalls.push(args);
  }
  detachFrom(...args) {
    super.detachFrom(...args);
    this.detachFromCalls.push(args);
  }
}

describe("Entity", () => {
  describe("#addTrait", () => {
    it("adds a trait to the entity", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.addTrait(trait);

      assert.equal(entity.traits.Testable, trait);
    });

    it("sets the added trait's entity to the entity", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.addTrait(trait);

      assert.equal(trait.entity, entity);
    });

    it("removes the trait from an entity if it was attached to one", () => {
      const oldEntity = new Entity();
      const newEntity = new Entity();
      const trait = new Testable();
      oldEntity.addTrait(trait);

      newEntity.addTrait(trait);

      assert.isUndefined(oldEntity.traits.Testable);
      assert.notEqual(trait.entity, oldEntity);
    });

    it("calls attachTo on the trait", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.addTrait(trait);

      assert.lengthOf(trait.attachToCalls, 1);
      assert.equal(trait.attachToCalls[0][0], entity);
    });
  });

  describe("#removeTrait", () => {
    it("removes the trait from the entity", () => {
      const entity = new Entity();
      const trait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(trait);

      assert.isUndefined(entity.traits.Testable);
    });

    it("unsets the entity on the trait", () => {
      const entity = new Entity();
      const trait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(trait);

      assert.isUndefined(trait.entiyt);
    });

    it("ignores traits that are not attached to the entity", () => {
      const entity = new Entity();
      const trait = new Testable();
      const otherTrait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(otherTrait);

      assert.equal(entity.traits.Testable, trait);
      assert.equal(trait.entity, entity);
    });

    it("calls detachFrom on the trait", () => {
      const entity = new Entity();
      const trait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(trait);

      assert.lengthOf(trait.detachFromCalls, 1);
      assert.equal(trait.detachFromCalls[0][0], entity);
    });
  });

  describe("#update", () => {
    it("updates the attached traits", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.update(42);

      entity.addTrait(trait);

      entity.update(1234);
      assert.deepEqual(trait.updateCalls, [[1234]]);
      entity.update(2345);
      assert.deepEqual(trait.updateCalls, [[1234], [2345]]);

      entity.removeTrait(trait);

      entity.update(3456);
      assert.deepEqual(trait.updateCalls, [[1234], [2345]]);
    });
  });
});
