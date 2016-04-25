import Trait from "../trait";

export default class Renderable extends Trait {
  constructor(object) {
    super();
    this.object = object;
  }

  attachTo(entity) {
    if (entity.traits.Position) {
      entity.traits.Position.object.add(this.object);
    } else {
      throw new Error("Entity has no Position Trait");
    }
    super.attachTo(entity);
  }

  detachFrom(entity) {
    super.detachFrom(entity);
    this.object.parent.remove(this.object);
  }

  cleanUp() {
    if (this.object.parent) {
      this.object.parent.remove(this.object);
    }
  }
}
