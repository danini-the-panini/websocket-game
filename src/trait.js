module.exports = class Trait {
  constructor() {

  }

  update() {}

  attachTo(entity) {
    this.entity = entity;
  }

  detachFrom(entity) {
    if (this.entity === entity) this.entity = undefined;
  }

  cleanUp() { }
}
