const Trait = require("../trait");

module.exports = class Follower extends Trait {
  constructor(followee, offset) {
    super();
    this.followee = followee;
    this.offset = offset;
  }

  attachTo(entity) {
    super.attachTo(entity);
    this.entity.traits.Renderable.object.target = this.followee.traits.Renderable.object;
    this.updatePosition();
  }

  update(details) {
    super.update(details);
    this.updatePosition();
  }

  updatePosition() {
    this.entity.traits.Renderable.object.position.copy(this.followee.traits.Renderable.object.position).add(this.offset);
  }
};
