import './assets/stylesheets/index.scss';

import $ from 'jquery';
import THREE from 'three';
import floorImage from './assets/images/floor.png';

$(function () {
  let name = prompt('Please enter your name') || 'New Folder';
  const websocket = new WebSocket(`ws://${window.location.host}/game`);

  const players = {};

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  let widthHalf = windowWidth / 2;
  let heightHalf = windowHeight / 2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);

  const webGLCanvas = document.getElementById('webgl_canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: webGLCanvas });

  renderer.setSize(windowWidth, windowHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  let geometry = new THREE.BoxGeometry(100, 100, 1);
  const texture = new THREE.TextureLoader().load(floorImage);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  let material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
  const floor = new THREE.Mesh(geometry, material);

  floor.receiveShadow = true;
  floor.position.z = -0.5;
  scene.add(floor);

  geometry = new THREE.BoxGeometry(1, 1, 1);
  material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });

  const cube = new THREE.Mesh(geometry, material);
  const cube2 = new THREE.Mesh(geometry, material);

  cube.receiveShadow = true;
  cube.castShadow = true;
  cube2.receiveShadow = true;
  cube2.castShadow = true;
  cube2.scale.set(0.5, 0.5, 0.5);
  cube2.position.set(0, 0.5, 0);
  cube.add(cube2);
  scene.add(cube);

  const MAX_SPEED = 0.2;
  const ACCELERATION = 0.005;
  const DAMPENING = 0.99;
  const velocity = new THREE.Vector3(0, 0, 0);

  const spawn = () => {
    cube.position.set(-40 + Math.random() * 80, -40 + Math.random() * 80, 0);
    cube.rotation.set(0, 0, Math.random() * 2 * Math.PI);
  };

  const thisPlayer = { object: cube, name, kills: 0, deaths: 0 };

  const amLight = new THREE.AmbientLight(0x404040);

  scene.add(amLight);

  const light = new THREE.DirectionalLight(0xffffff);

  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.near = 5;
  light.shadow.camera.far = 50;
  light.shadow.camera.right = 10;
  light.shadow.camera.left = -10;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
  light.position.set(10, 5, 30);
  light.lookAt(cube.position);
  light.target = cube;
  scene.add(light);
  // scene.add(new THREE.CameraHelper( light.shadow.camera ));

  camera.position.z = 10;
  camera.lookAt(cube.position);
  camera.target = cube;

  window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    widthHalf = windowWidth / 2;
    heightHalf = windowHeight / 2;
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(windowWidth, windowHeight);
  }, false);

  const overlay = document.getElementById('overlay');
  const scoreboard = document.getElementById('scoreboard');
  const scoreboardBody = scoreboard.getElementsByTagName('tbody')[0];
  const deathscreen = document.getElementById('deathscreen');
  const deathtimer = document.getElementById('deathtimer');
  const deathmessage = document.getElementById('deathmessage');

  const updateScoreCardColor = player => {
    const icon = player.scorecard.getElementsByClassName('icon')[0];

    icon.style.backgroundColor = `#${player.object.material.color.getHexString()}`;
  };

  const updateScoreCard = player => {
    player.scorecard.innerHTML = `
      <td><span class="icon"></span><span>${player.name}</span></td>
      <td>${player.kills}</td>
      <td>${player.deaths}</td>
    `;
    updateScoreCardColor(player);
  };

  const createScoreCard = player => {
    player.scorecard = document.createElement('tr');
    scoreboardBody.appendChild(player.scorecard);
    updateScoreCard(player);
  };

  createScoreCard(thisPlayer);
  updateScoreCardColor(thisPlayer);

  const cameraOffset = new THREE.Vector3(0, 0, 10);
  const lightOffset = new THREE.Vector3(10, 5, 30);

  const sendPosition = () => {
    camera.position.copy(cube.position).add(cameraOffset);
    light.position.copy(cube.position).add(lightOffset);

    light.updateMatrix();
    light.updateMatrixWorld();
    websocket.send(`p,${cube.position.x},${cube.position.y},${cube.rotation.z}`);
  };

  const bullets = [];

  const FIRE_TIME = 150;
  const BULLET_LIFE = 10000;
  const BULLET_SPEED = 0.5;

  const bulletGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
  const bulletMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  let lastFire = 0;

  const getBullet = () => {
    for (let i = 0; i < bullets.length; i++) {
      if (!bullets[i].object.visible) {
        bullets[i].object.visible = true;

        return bullets[i];
      }
    }
    const bullet = {
      object: new THREE.Mesh(bulletGeometry, bulletMaterial)
    };

    bullet.object.receiveShadow = true;
    bullet.object.castShadow = true;
    scene.add(bullet.object);
    bullets.push(bullet);

    return bullet;
  };

  const fireGun = () => {
    const now = new Date().getTime();

    if (now - lastFire > FIRE_TIME) {
      const bullet = getBullet();

      bullet.object.position.copy(cube.position);
      bullet.object.rotation.copy(cube.rotation);
      bullet.player = null;
      bullet.firedAt = now;
      lastFire = now;

      websocket.send(`f,${bullet.object.position.x},${bullet.object.position.y},${bullet.object.rotation.z}`);
    }
  };

  const playerFired = (player, x, y, rot) => {
    const bullet = getBullet();

    bullet.object.position.set(x, y, 0);
    bullet.object.rotation.set(0, 0, rot);
    bullet.player = player;
    bullet.firedAt = new Date().getTime();
  };

  const vectorA = new THREE.Vector3();

  const lineIntersects = (a, b, object) => {
    const aToB = vectorA.copy(b).sub(a);
    const ray1 = new THREE.Ray(a, aToB);
    const sphere = new THREE.Sphere(object.position, object.geometry.boundingSphere.radius);
    const intersects1 = ray1.intersectsSphere(sphere);
    const ray2 = new THREE.Ray(b, aToB.negate());

    return intersects1 && ray2.intersectsSphere(sphere);
  };

  const particles = [];
  const particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

  const getParticle = particleMaterial => {
    for (let i = 0; i < particles.length; i++) {
      if (!particles[i].object.visible) {
        particles[i].object.visible = true;
        particles[i].object.material = particleMaterial;

        return particles[i];
      }
    }
    const particle = {
      object: new THREE.Mesh(particleGeometry, material),
      velocity: new THREE.Vector3()
    };

    particle.object.receiveShadow = true;
    particle.object.castShadow = true;
    scene.add(particle.object);
    particles.push(particle);

    return particle;
  };

  const explode = player => {
    for (let i = 0; i < 500; i++) {
      const particle = getParticle(player.object.material);
      const speed = 0.1 + Math.random() * 0.2;

      particle.object.position.copy(player.object.position);
      particle.velocity.set(
        -1.0 + Math.random() * 2.0,
        -1.0 + Math.random() * 2.0,
        Math.random()
      )
        .normalize()
        .multiplyScalar(speed);
    }
  };

  const killPlayer = (victim, killer) => {
    if (!victim || victim.dead) {
      return;
    }
    killer.kills += 1;
    updateScoreCard(killer);
    victim.deaths += 1;
    updateScoreCard(victim);
    explode(victim);
    if (victim !== thisPlayer) {
      victim.label.style.display = 'none';
      victim.indicator.visible = false;
    }
    victim.diedAt = new Date().getTime();
    victim.dead = true;
    victim.object.visible = false;
  };

  const checkBulletCollision = (bullet, oldPosition) => {
    for (const playerName in players) {
      if (players.hasOwnProperty(playerName)) {
        const player = players[playerName];

        if (player !== bullet.player && !player.dead) {
          if (lineIntersects(bullet.object.position, oldPosition, player.object)) {
            if (!bullet.player) {
              websocket.send(`k,${playerName}`);
              killPlayer(player, thisPlayer);
            }

            return true;
          }
        }
      }
    }
    if (!thisPlayer.dead && bullet.player && lineIntersects(bullet.object.position, oldPosition, thisPlayer.object)) {
      return true;
    }

    return false;
  };

  const SPAWN_TIME = 2000;

  const updatePlayerLabel = player => {
    const vector = new THREE.Vector3();

    vector.setFromMatrixPosition(player.object.matrixWorld).project(camera);

    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -vector.y * heightHalf + heightHalf;

    player.label.style.left = `${vector.x}px`;
    player.label.style.top = `${vector.y}px`;
  };

  const indVector = new THREE.Vector3();

  const updatePlayerIndicator = player => {
    indVector.copy(player.object.position).sub(thisPlayer.object.position);
    const distanceSq = indVector.lengthSq();

    indVector.normalize();
    player.indicator.visible = distanceSq > 100;
    player.indicator.position.copy(indVector.multiplyScalar(5).add(thisPlayer.object.position));
    player.indicator.lookAt(player.object.position);
  };

  const respawn = () => {
    thisPlayer.dead = false;
    thisPlayer.object.visible = true;
    deathscreen.style.display = 'none';
    overlay.style.background = 'rgba(0, 0, 0, 0)';
    spawn();
    sendPosition();
    for (const playerName in players) {
      if (players.hasOwnProperty(playerName)) {
        const player = players[playerName];

        updatePlayerIndicator(player);
        updatePlayerLabel(player);
      }
    }
  };

  const findOrCreatePlayer = (playerName, playerColor) => {
    if (!players[playerName]) {
      const playerCube = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
      const playerCube2 = new THREE.Mesh(geometry, playerCube.material);

      playerCube2.receiveShadow = true;
      playerCube2.castShadow = true;
      playerCube2.scale.set(0.5, 0.5, 0.5);
      playerCube2.position.set(0, 0.5, 0);
      playerCube.add(playerCube2);
      playerCube.receiveShadow = true;
      playerCube.castShadow = true;
      scene.add(playerCube);

      const label = document.createElement('span');

      label.classList.add('player-label');
      label.innerText = playerName;
      overlay.appendChild(label);

      const playerIndicator = new THREE.Mesh(geometry, playerCube.material);

      scene.add(playerIndicator);
      playerIndicator.scale.set(0.2, 0.2, 0.2);
      players[playerName] = {
        object: playerCube,
        indicator: playerIndicator,
        label,
        name: playerName,
        kills: 0, deaths: 0 };
      updatePlayerIndicator(players[playerName]);
      createScoreCard(players[playerName]);
    }

    return players[playerName];
  };

  const formatSpawnTime = time => String(time);

  const startGame = () => {
    spawn();

    const RIGHT = 37;
    const UP = 38;
    const LEFT = 39;
    const DOWN = 40;
    const SPACE = 32;

    const keystates = {};

    $(document)
      .on('keydown', e => {
        keystates[e.keyCode] = true;
        e.preventDefault();
      })
      .on('keyup', e => {
        keystates[e.keyCode] = false;
        e.preventDefault();
      });

    $(document).on('mouseup', e => {
      e.preventDefault();
    });

    const render = () => {
      requestAnimationFrame(render);

      const now = new Date().getTime();

      if (thisPlayer.dead) {
        const timeSinceDeath = now - thisPlayer.diedAt;

        deathtimer.innerText = formatSpawnTime(SPAWN_TIME - timeSinceDeath);
        if (timeSinceDeath > SPAWN_TIME) {
          respawn();
        }
      } else {
        if (keystates[UP]) {
          velocity
            .add(new THREE.Vector3(0, 1, 0)
            .applyQuaternion(cube.quaternion)
            .normalize()
            .multiplyScalar(ACCELERATION));
        } else if (keystates[DOWN]) {
          velocity
            .add(new THREE.Vector3(0, 1, 0)
            .applyQuaternion(cube.quaternion)
            .normalize()
            .multiplyScalar(-ACCELERATION));
        } else {
          velocity.multiplyScalar(DAMPENING);
        }
        if (velocity.lengthSq() > MAX_SPEED * MAX_SPEED) {
          velocity.setLength(MAX_SPEED);
        }
        if (keystates[LEFT]) {
          cube.rotation.z -= 0.1;
        } else if (keystates[RIGHT]) {
          cube.rotation.z += 0.1;
        }
        if (keystates[SPACE]) {
          fireGun();
        }

        cube.position.add(velocity);

        sendPosition();
      }

      bullets.forEach(bullet => {
        if (bullet.object.visible) {
          const oldPosition = bullet.object.position.clone();

          bullet.object.position
            .add(new THREE.Vector3(0, 1, 0)
              .applyQuaternion(bullet.object.quaternion)
              .normalize()
              .multiplyScalar(BULLET_SPEED));
          if (now - bullet.firedAt > BULLET_LIFE || checkBulletCollision(bullet, oldPosition)) {
            bullet.object.visible = false;
          }
        }
      });

      particles.forEach(particle => {
        if (particle.object.visible) {
          particle.object.position.add(particle.velocity);
          particle.velocity.z -= 0.02;
          if (particle.object.position.z < 0) {
            particle.object.visible = false;
          }
        }
      });

      for (const playerName in players) {
        if (players.hasOwnProperty(playerName)) {
          const player = players[playerName];

          if (!player.dead) {
            updatePlayerIndicator(player);
            updatePlayerLabel(player);
          }
        }
      }

      renderer.render(scene, camera);
    };

    render();
  };

  const playerForName = playerName => {
    if (playerName === name) {
      return thisPlayer;
    }

    return players[playerName];
  };

  websocket.onopen = () => {
    websocket.send(`c,${name}`);
    startGame();
  };

  websocket.onmessage = evt => {
    const parts = evt.data.split(',');
    const playerName = parts[0];
    const messageType = parts[1];

    if (messageType === 'n') {
      thisPlayer.name = name = playerName;
      thisPlayer.object.material.color = new THREE.Color(parts[2]);
      updateScoreCard(thisPlayer);

      return;
    }

    const player = findOrCreatePlayer(playerName);
    const now = new Date().getTime();

    if (messageType === 'c') {
      player.object.material.color.set(parts[2]);
      updateScoreCardColor(player);
    } else if (messageType === 'd') {
      scene.remove(player.object);
      scene.remove(player.indicator);
      overlay.removeChild(player.label);
      scoreboardBody.removeChild(player.scorecard);
      Reflect.deleteProperty(players, playerName);
    } else if (messageType === 'p') {
      player.object.position.x = parseFloat(parts[2]);
      player.object.position.y = parseFloat(parts[3]);
      player.object.rotation.z = parseFloat(parts[4]);

      if (player.dead && now - player.diedAt > SPAWN_TIME) {
        player.object.visible = true;
        player.dead = false;
        player.label.style.display = 'inline-block';
        player.indicator.visible = true;
      }

      updatePlayerLabel(player);
      updatePlayerIndicator(player);
    } else if (messageType === 'f') {
      playerFired(player, parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
    } else if (messageType === 'k') {
      const killer = playerForName(playerName);
      const victim = playerForName(parts[2]);

      killPlayer(victim, killer);
      if (victim === thisPlayer) {
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        deathscreen.style.display = 'block';
        deathtimer.innerText = formatSpawnTime(SPAWN_TIME);
        deathmessage.innerText = `${killer.name} killed you, bro!`;
      }
    }
  };
});
