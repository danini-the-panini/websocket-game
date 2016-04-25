import Trait from "../trait";

export default class NetworkControllable extends Trait {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  attachTo(entity) {
    super.attachTo(entity);
    this.socket.subscribe(this);
  }

  onMessage(message) {
    if (message.t === "p" && message.s === this.entity.traits.Player.id) {
      const positionTrait = this.entity.traits.Position;
      positionTrait.object.position.x = message.d.x;
      positionTrait.object.position.y = message.d.y;
      positionTrait.object.rotation.z = message.d.r;
    }
  }

  cleanUp() {
    super.cleanUp();
    this.socket.unsubscribe(this);
  }
}
