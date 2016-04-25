import Trait from "../trait";

export default class SendsPositionToServer extends Trait {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  update() {
    super.update();
    const positionTrait = this.entity.traits.Position;
    this.socket.send({
      t: "p",
      d: {
        x: positionTrait.object.position.x,
        y: positionTrait.object.position.y,
        r: positionTrait.object.rotation.z
      }
    });
  }

  cleanUp() {
    super.cleanUp();
    this.socket.unsubscribe(this);
  }
}
