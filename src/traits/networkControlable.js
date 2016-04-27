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
      const renderable = this.entity.traits.Renderable;
      renderable.object.position.x = message.d.x;
      renderable.object.position.y = message.d.y;
      renderable.object.rotation.z = message.d.r;
    }
  }

  cleanUp() {
    super.cleanUp();
    this.socket.unsubscribe(this);
  }
}
