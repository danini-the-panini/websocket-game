const Trait = require("../trait")

module.exports = class SendsPositionToServer extends Trait {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  update() {
    super.update();
    const renderableTrait = this.entity.traits.Renderable;
    this.socket.send({
      t: "p",
      d: {
        x: renderableTrait.object.position.x,
        y: renderableTrait.object.position.y,
        r: renderableTrait.object.rotation.z
      }
    });
  }

  cleanUp() {
    super.cleanUp();
    this.socket.unsubscribe(this);
  }
}
