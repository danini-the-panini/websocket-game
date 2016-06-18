const Trait = require("../trait");

module.exports = class SendsPositionToServer extends Trait {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  update() {
    super.update();
    const renderable = this.entity.traits.Renderable;
    const lawsOfMotion = this.entity.traits.LawsOfMotion;
    this.socket.send({
      t: "p",
      d: {
        x: renderable.object.position.x,
        y: renderable.object.position.y,
        r: renderable.object.rotation.z
      },
      v: {
        x: lawsOfMotion.velocity.x,
        y: lawsOfMotion.velocity.y,
        r: lawsOfMotion.angularVelocity
      }
    });
  }

  cleanUp() {
    super.cleanUp();
    this.socket.unsubscribe(this);
  }
};
