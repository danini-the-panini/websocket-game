import THREE from "three";

export default class Player {
  constructor() {
    this.kills = 0;
    this.deaths = 0;
    this.color = new THREE.Color(Math.random() * 0xffffff);
    this.disconnected = false;
    this.dead = false;
  }
}
