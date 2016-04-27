import Trait from "../trait";

export default class Renderable extends Trait {
  constructor(object) {
    super();
    this.object = object;
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
