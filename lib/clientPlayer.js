import THREE from "three";

import Player from "./player";

export default class ClientPlayer extends Player {
  constructor() {
    super();
    let material = new THREE.MeshPhongMaterial();
    this.object = new THREE.Mesh(ClientPlayer.geometry, material);
    let cube2 = new THREE.Mesh(ClientPlayer.geometry, material);
    this.object.receiveShadow = true;
    this.object.castShadow = true;
    cube2.receiveShadow = true;
    cube2.castShadow = true;
    cube2.scale.set(0.5, 0.5, 0.5);
    cube2.position.set(0, 0.5, 0);
    this.object.add(cube2);
  }
}

ClientPlayer.geometry = new THREE.BoxGeometry( 1, 1, 1 );
