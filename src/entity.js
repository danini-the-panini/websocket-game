const _ = require("lodash");

class Entity {
  constructor() {
    this.id = Entity.LAST_ID++;
    this.traits = {};
  }

  addTrait(trait) {
    if (trait.entity) {
      trait.entity.removeTrait(trait);
    }
    this.traits[trait.constructor.name] = trait;
    trait.attachTo(this);
  }

  removeTrait(trait) {
    const traitToDelete = this.traits[trait.constructor.name];
    if (traitToDelete === trait) {
      traitToDelete.detachFrom(this);
      delete this.traits[trait.constructor.name];
    }
  }

  update(details) {
    _.each(this.traits, trait => trait.update(details));
  }

  cleanUp() {
    _.each(this.traits, trait => trait.cleanUp());
  }
}

Entity.LAST_ID = 1;

module.exports = Entity;
