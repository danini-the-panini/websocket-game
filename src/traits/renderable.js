const Trait = require("../trait");

module.exports = class Renderable extends Trait {
  constructor(object) {
    super();
    this.object = object;
  }

  attachTo(entity) {
    super.attachTo(entity);
    if (entity.game.graphicsEngine) {
      entity.game.graphicsEngine.scene.add(this.object);
    }
  }

  detachFrom(entity) {
    super.detachFrom(entity);
    this.cleanUp();
  }

  cleanUp() {
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }
};
