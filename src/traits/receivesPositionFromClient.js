const Trait = require("../trait");

module.exports = class ReceivesPositionFromClient extends Trait {
  constructor(websocket) {
    super();
    this.websocket = websocket;
  }

  send(message) {
    try {
      this.websocket.send(JSON.stringify(message));
    } catch (error) {
      console.error(error.stack); // eslint-disable-line no-console
    }
  }

  onMessage(message) {
    if (message.t === "p") {
      const renderableTrait = this.entity.traits.Renderable;
      renderableTrait.object.position.x = message.d.x;
      renderableTrait.object.position.y = message.d.y;
      renderableTrait.object.rotation.z = message.d.r;
    }

    message.s = this.entity.traits.Player.id;

    this.entity.game
      .getAll("Player")
      .filter(e => e.traits.Player.id !== this.entity.traits.Player.id)
      .forEach(e => {
        e.traits.ReceivesPositionFromClient.send(message);
      });
  }
};
