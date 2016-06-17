const THREE = require("three");

const Trait = require("../trait");

class Player extends Trait {
  constructor(id, name, color) {
    super();
    this.id = id || (Player.LAST_ID++);
    this.name = name;
    this.color = color || new THREE.Color(Math.random() * 0xffffff);
  }
}

Player.LAST_ID = 1;

module.exports = Player;
