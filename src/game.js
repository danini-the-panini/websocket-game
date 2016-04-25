import _ from "lodash";

export default class Game {
  constructor() {
    this.updateDetails = {};
    this.entities = [];
  }

  start() {
    this.lastUpdate = this.now();
  }

  update() {
    this.calculateUpdateDetails();
    this.entities.forEach((entity) => {
      entity.update(this.updateDetails);
    });
  }

  addEntity(entity) {
    entity.game = this;
    this.entities.push(entity);
  }

  removeEntity(entity) {
    _.remove(this.entities, e => e === entity).forEach(e => e.cleanUp());
  }

  getAll(trait) {
    return this.entities.filter(entity => entity.traits[trait]);
  }

  now() {
    return new Date().getTime();
  }

  calculateUpdateDetails() {
    this.updateDetails.now = this.now();
    this.updateDetails.delta = this.updateDetails.now - this.lastUpdate;
    this.lastUpdate = this.updateDetails.now;
  }
}
