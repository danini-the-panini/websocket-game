import THREE from "three";

import Trait from "../trait";

export default class Player extends Trait {
  constructor(id, name, color) {
    super();
    this.id = id || (Player.LAST_ID++);
    this.name = name;
    this.color = color || new THREE.Color(Math.random() * 0xffffff);
  }
}

Player.LAST_ID = 1;
