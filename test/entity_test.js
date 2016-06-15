const Entity = require("../src/entity")
const Trait = require("../src/trait")

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

      expect(entity.traits.Testable).to.equal(trait);
    });

    it("sets the added trait's entity to the entity", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.addTrait(trait);

      expect(trait.entity).to.equal(entity);
    });

    it("removes the trait from an entity if it was attached to one", () => {
      const oldEntity = new Entity();
      const newEntity = new Entity();
      const trait = new Testable();
      oldEntity.addTrait(trait);

      newEntity.addTrait(trait);

      expect(oldEntity.traits.Testable).to.be.undefined;
      expect(trait.entity).to.not.equal(oldEntity);
    });

    it("calls attachTo on the trait", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.addTrait(trait);

      expect(trait.attachToCalls).to.have.length(1);
      expect(trait.attachToCalls[0][0]).to.equal(entity);
    });
  });

  describe("#removeTrait", () => {
    it("removes the trait from the entity", () => {
      const entity = new Entity();
      const trait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(trait);

      expect(entity.traits.Testable).to.be.undefined;
    });

    it("unsets the entity on the trait", () => {
      const entity = new Entity();
      const trait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(trait);

      expect(trait.entity).to.be.undefined;
    });

    it("ignores traits that are not attached to the entity", () => {
      const entity = new Entity();
      const trait = new Testable();
      const otherTrait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(otherTrait);

      expect(entity.traits.Testable).to.equal(trait);
      expect(trait.entity).to.equal(entity);
    });

    it("calls detachFrom on the trait", () => {
      const entity = new Entity();
      const trait = new Testable();
      entity.addTrait(trait);

      entity.removeTrait(trait);

      expect(trait.detachFromCalls).to.have.length(1);
      expect(trait.detachFromCalls[0][0]).to.equal(entity);
    });
  });

  describe("#update", () => {
    it("updates the attached traits", () => {
      const entity = new Entity();
      const trait = new Testable();

      entity.update(42);

      entity.addTrait(trait);

      entity.update(1234);
      expect(trait.updateCalls).to.deep.equal([[1234]]);
      entity.update(2345);
      expect(trait.updateCalls).to.deep.equal([[1234], [2345]]);

      entity.removeTrait(trait);

      entity.update(3456);
      expect(trait.updateCalls).to.deep.equal([[1234], [2345]]);
    });
  });
});
