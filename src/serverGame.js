import THREE from "three";

import Game from "./game";
import Renderable from "./traits/renderable";
import Player from "./traits/player";
import ReceivesPositionFromClient from "./traits/receivesPositionFromClient";
import Entity from "./entity";

export default class ServerGame extends Game {
  constructor() {
    super();
    this.nameCounts = {};
  }

  normalizeName(name) {
    name = name || "New Folder";
    if (/[\<\>\\\/]/.test(name)) {
      return "Dumbass!";
    }
    return name.substring(0, 10);
  }

  getUniqueName(name) {
    const normalName = this.normalizeName(name);
    if (!this.nameCounts[normalName]) {
      this.nameCounts[normalName] = 1;
      return normalName;
    } else {
      return `${normalName} (${++this.nameCounts[normalName]})`;
    }
  }

  createPlayer(message) {
    const player = this.createEntity();
    
    const positionTrait = new Renderable(new THREE.Object3D());
    player.addTrait(positionTrait);

    const name = this.getUniqueName(message.d.n);
    const playerTrait = new Player(
      null, name, new THREE.Color().copy(message.d.c)
    );
    player.addTrait(playerTrait);

    return player;
  }

  createConnectResponseMessage(newPlayer) {
    return {
      t: "cr",
      d: {
        id: newPlayer.traits.Player.id,
        n: newPlayer.traits.Player.name,
        c: newPlayer.traits.Player.color,
        ps: this
          .getAll("Player")
          .filter(player => player !== newPlayer)
          .map(player => {
            return {
              id: player.traits.Player.id,
              n: player.traits.Player.name,
              c: player.traits.Player.color
            };
          })
      }
    };
  }

  playerConnected(websocket) {
    let newPlayer;
    websocket.on("message", (data) => {
      const message = JSON.parse(data);
      if (message.t === "c") {
        newPlayer = this.createPlayer(message);
        const socketTrait = new ReceivesPositionFromClient(websocket);
        newPlayer.addTrait(socketTrait);
        socketTrait.send(this.createConnectResponseMessage(newPlayer));
        this
          .getAll("Player")
          .filter(player => player !== newPlayer)
          .forEach(player => {
            player.traits.ReceivesPositionFromClient.send({
              t: "c",
              d: {
                id: newPlayer.traits.Player.id,
                n: newPlayer.traits.Player.name,
                c: newPlayer.traits.Player.color
              }
            });
          });
      } else if (newPlayer) {
        newPlayer.traits.ReceivesPositionFromClient.onMessage(message);
      }
    });
    websocket.on("close", () => {
      if (newPlayer) {this
        .getAll("Player")
        .filter(player => player !== newPlayer)
        .forEach(player => {
          player.traits.ReceivesPositionFromClient.send({
            t: "d",
            d: { id: newPlayer.traits.Player.id }
          });
        });
        this.removeEntity(newPlayer);
      }
    });
  }
}
