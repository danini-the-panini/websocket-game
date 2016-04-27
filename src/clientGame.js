/* eslint-env browser */

import $ from "jquery";
import THREE from "three";
import _ from "lodash";

import Game from "./game";
import GraphicsEngine from "./graphicsEngine";
import ClientSocket from "./clientSocket";
import LawsOfMotion from "./traits/lawsOfMotion";
import Renderable from "./traits/renderable";
import KeyboardControlable from "./traits/keyboardControlable";
import Player from "./traits/player";
import SendsPositionToServer from "./traits/sendsPositionToServer";
import NetworkControlable from "./traits/networkControlable";
import Follower from "./traits/follower";
import Entity from "./entity";

export default class ClientGame extends Game {
  constructor() {
    super();
    this.graphicsEngine = new GraphicsEngine();
  }

  start() {
    super.start();

    const websocket = new WebSocket(`ws://${window.location.host}/game`);

    this.socket = new ClientSocket(websocket);

    websocket.onopen = () => {
      websocket.send(JSON.stringify(this.createConnectMessage()));
    };
    websocket.onclose = () => {
      alert("Lost connection to server.");
      window.location.reload();
    };
    websocket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.t === "cr") {
        this.handleConnectResponse(message.d);
      } else if (message.t === "c") {
        this.handleNewConnection(message.d);
      } else if (message.t === "d") {
        this.handleDisconnection(message.d);
      }
    });

    this.updateDetails.keys = {};
    $(document).on("keydown", (event) => {
      this.updateDetails.keys[event.keyCode] = true;
      event.preventDefault();
    }).on("keyup", (event) => {
      this.updateDetails.keys[event.keyCode] = false;
      event.preventDefault();
    });

    const updateLoop = () => {
      requestAnimationFrame(updateLoop);
      this.update();

      this.graphicsEngine.render();
    };
    updateLoop();
  }

  createPlayerMesh() {
    const material = new THREE.MeshPhongMaterial();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const object = new THREE.Mesh(geometry, material);
    const cube2 = new THREE.Mesh(geometry, material);
    object.receiveShadow = true;
    object.castShadow = true;
    cube2.receiveShadow = true;
    cube2.castShadow = true;
    cube2.scale.set(0.5, 0.5, 0.5);
    cube2.position.set(0, 0.5, 0);
    object.add(cube2);
    return object;
  }

  handleConnectResponse(message) {
    const player = this.createPlayer(message);
    player.addTrait(new KeyboardControlable());
    player.addTrait(new SendsPositionToServer(this.socket));

    const cameraEntity = new Entity();
    cameraEntity.addTrait(new Renderable(this.graphicsEngine.camera));
    cameraEntity.addTrait(new Follower(player, new THREE.Vector3(0, 0, 10)));
    this.addEntity(cameraEntity);

    const lightEntity = new Entity();
    lightEntity.addTrait(new Renderable(this.createLight()));
    lightEntity.addTrait(new Follower(player, new THREE.Vector3(10, 5, 30)));
    this.addEntity(lightEntity);

    message.ps.forEach(p => this.createOpponentPlayer(p));
  }

  handleNewConnection(message) {
    this.createOpponentPlayer(message);
  }

  handleDisconnection(message) {
    _.remove(this.entities, e => {
      return e.traits.Player && e.traits.Player.id === message.id;
    }).forEach(e => e.cleanUp());
  }

  createPlayer(message) {
    const player = new Entity();

    const object = this.createPlayerMesh();
    this.graphicsEngine.scene.add(object);
    player.addTrait(new Renderable(object));

    const lawsOfMotion = new LawsOfMotion();
    player.addTrait(lawsOfMotion);

    const playerTrait = new Player(
      message.id, message.n, new THREE.Color().copy(message.c)
    );
    player.addTrait(playerTrait);

    object.material.color.copy(playerTrait.color);

    this.addEntity(player);

    return player;
  }

  createOpponentPlayer(message) {
    const newPlayer =  this.createPlayer(message);
    newPlayer.addTrait(new NetworkControlable(this.socket));
  }

  createConnectMessage() {
    const name = prompt("Enter your name");
    const color = new THREE.Color(Math.random() * 0xffffff);
    return {
      t: "c", d: {
        n: name, c: color
      }
    };
  }

  createLight() {
    const light = new THREE.DirectionalLight( 0xffffff );
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.near = 5;
    light.shadow.camera.far = 50;
    light.shadow.camera.right = 10;
    light.shadow.camera.left = -10;
    light.shadow.camera.top = 10;
    light.shadow.camera.bottom = -10;
    this.graphicsEngine.scene.add(light);
    return light;
  }
}
