import THREE from "three";

import Trait from "../trait";
import Renderable from "./renderable";
import LawsOfMotion from "./lawsOfMotion";

const FIRE_TIME = 150;
const BULLET_LIFE = 10000;
const BULLET_SPEED = 0.03;

export default class Weaponized extends Trait {
  constructor() {
    super();
    this.lastFiredAt = 0;
    this.bulletPool = [];
  }

  fire(details) {
    if (details.now - this.lastFiredAt > FIRE_TIME) {
      var bullet = this.getBullet();
      bullet.traits.Renderable.object.position.copy(this.entity.traits.Renderable.object.position);
      bullet.traits.Renderable.object.rotation.copy(this.entity.traits.Renderable.object.rotation);
      bullet.traits.LawsOfMotion.velocity.copy(new THREE.Vector3(0, 1, 0)
        .applyQuaternion(bullet.traits.Renderable.object.quaternion)
        .normalize()
        .multiplyScalar(BULLET_SPEED));
      // bullet.player = null;
      // bullet.firedAt = now;
      this.lastFiredAt = details.now;
      //
      // websocket.send(`f,${bullet.object.position.x},${bullet.object.position.y},${bullet.object.rotation.z}`);
    }
  }

  getBullet() {
    for (let i = 0; i < this.bulletPool.length; i++) {
      if (!this.bulletPool[i].traits.Renderable.object.visible) {
        this.bulletPool[i].traits.Renderable.object.visible = true;
        return this.bulletPool[i];
      }
    }
    const bullet = this.entity.game.createEntity();
    const object = new THREE.Mesh(Weaponized.bulletGeometry, Weaponized.bulletMaterial);
    object.receiveShadow = true;
    object.castShadow = true;
    bullet.addTrait(new Renderable(object));
    bullet.addTrait(new LawsOfMotion());
    this.bulletPool.push(bullet);
    return bullet;
  }
}

Weaponized.bulletGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
Weaponized.bulletMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
