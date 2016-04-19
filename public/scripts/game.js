$(function() {
  var name = prompt("Please enter your name") || 'New Folder';
  const players = {};

  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var widthHalf = windowWidth/2;
  var heightHalf = windowHeight/2;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, windowWidth/windowHeight, 0.1, 1000 );

  var webGLCanvas = document.getElementById('webgl_canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: webGLCanvas });
  renderer.setSize(windowWidth, windowHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  var geometry = new THREE.BoxGeometry( 100, 100, 1 );
  var texture = new THREE.TextureLoader().load( "images/floor.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 20, 20 );
  var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
  var floor = new THREE.Mesh( geometry, material );
  floor.receiveShadow = true;
  floor.position.z = -0.5;
  scene.add( floor );

  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
  var cube = new THREE.Mesh( geometry, material );
  var cube2 = new THREE.Mesh( geometry, material );
  cube.receiveShadow = true;
  cube.castShadow = true;
  cube2.receiveShadow = true;
  cube2.castShadow = true;
  cube2.scale.set(0.5, 0.5, 0.5);
  cube2.position.set(0, 0.5, 0);
  cube.add(cube2);
  scene.add( cube );

  var MAX_SPEED = 0.2;
  var ACCELERATION = 0.005;
  var DAMPENING = 0.99;
  var velocity = new THREE.Vector3(0, 0, 0);

  function spawn() {
    cube.position.set(-40 + Math.random() * 80, -40 + Math.random() * 80, 0);
    cube.rotation.set(0, 0, Math.random() * 2 * Math.PI);
  }

  var thisPlayer = { object: cube, name: name, kills: 0, deaths: 0 };

  var amLight = new THREE.AmbientLight( 0x404040 );
  scene.add( amLight );

  var light = new THREE.DirectionalLight( 0xffffff );
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
  scene.add( light );
  // scene.add(new THREE.CameraHelper( light.shadow.camera ));

  camera.position.z = 10;
  camera.lookAt(cube.position);
  camera.target = cube;

  window.addEventListener( 'resize', function(){
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    widthHalf = windowWidth/2;
    heightHalf = windowHeight/2;
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( windowWidth, windowHeight );
  }, false );

  var overlay = document.getElementById('overlay');
  var scoreboard = document.getElementById('scoreboard');
  var scoreboardBody = scoreboard.getElementsByTagName('tbody')[0];
  var deathscreen = document.getElementById('deathscreen');
  var deathtimer = document.getElementById('deathtimer');
  var deathmessage = document.getElementById('deathmessage');

  function updateScoreCardColor(player) {
    var icon = player.scorecard.getElementsByClassName('icon')[0];
    icon.style.backgroundColor = '#' + player.object.material.color.getHexString();
  }

  function updateScoreCard(player) {
    player.scorecard.innerHTML = '' +
      '<td><span class="icon"></span><span>' + player.name + '</span></td>' +
      '<td>' + player.kills + '</td>' +
      '<td>' + player.deaths + '</td>';
    updateScoreCardColor(player);
  }

  function createScoreCard(player) {
    player.scorecard = document.createElement('tr');
    scoreboardBody.appendChild(player.scorecard);
    updateScoreCard(player);
  }

  createScoreCard(thisPlayer);
  updateScoreCardColor(thisPlayer);

  var cameraOffset = new THREE.Vector3(0, 0, 10);
  var lightOffset = new THREE.Vector3(10, 5, 30);

  function sendPosition() {
    camera.position.copy(cube.position).add(cameraOffset);
    light.position.copy(cube.position).add(lightOffset);

    light.updateMatrix();
    light.updateMatrixWorld();
    websocket.send('p,' + cube.position.x + ',' + cube.position.y + ',' + cube.rotation.z);
  }

  var bullets = [];

  var FIRE_TIME = 150;
  var BULLET_LIFE = 10000;
  var BULLET_SPEED = 0.5;

  var bulletGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
  var bulletMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  var lastFire = 0;

  function getBullet() {
    for (var i = 0; i < bullets.length; i++) {
      if (!bullets[i].object.visible) {
        bullets[i].object.visible = true;
        return bullets[i];
      }
    }
    var bullet = {
      object: new THREE.Mesh(bulletGeometry, bulletMaterial)
    };
    bullet.object.receiveShadow = true;
    bullet.object.castShadow = true;
    scene.add(bullet.object);
    bullets.push(bullet);
    return bullet;
  }

  function fireGun() {
    var now = new Date().getTime();
    if (now - lastFire > FIRE_TIME) {
      var bullet = getBullet();
      bullet.object.position.copy(cube.position);
      bullet.object.rotation.copy(cube.rotation);
      bullet.player = null;
      bullet.firedAt = now;
      lastFire = now;

      websocket.send('f,' + bullet.object.position.x + ',' + bullet.object.position.y + ',' + bullet.object.rotation.z);
    }
  }

  function playerFired(player, x, y, rot) {
    var bullet = getBullet();

    bullet.object.position.set(x, y, 0)
    bullet.object.rotation.set(0, 0, rot);
    bullet.player = player;
    bullet.firedAt = new Date().getTime();
  }

  var vectorA = new THREE.Vector3();
  var vectorB = new THREE.Vector3();
  function lineIntersects(a, b, object) {
    var aToB = vectorA.copy(b).sub(a);
    var ray1 = new THREE.Ray(a, aToB);
    var sphere = new THREE.Sphere(object.position, object.geometry.boundingSphere.radius);
    var intersects1 = ray1.intersectsSphere(sphere);
    var ray2 = new THREE.Ray(b, aToB.negate());
    return intersects1 && ray2.intersectsSphere(sphere);
  }

  function checkBulletCollision(bullet, oldPosition) {
    for (var name in players) {
      if (players.hasOwnProperty(name)) {
        var player = players[name];
        if (player === bullet.player || player.dead) continue;
        if (lineIntersects(bullet.object.position, oldPosition, player.object)) {
          if (!bullet.player) {
            websocket.send('k,'+name);
            killPlayer(player, thisPlayer);
          }
          return true;
        }
      }
    }
    if (!thisPlayer.dead && bullet.player && lineIntersects(bullet.object.position, oldPosition, thisPlayer.object)) {
      return true;
    }
    return false;
  }

  var particles = [];

  var particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

  function getParticle(material) {
    for (var i = 0; i < particles.length; i++) {
      if (!particles[i].object.visible) {
        particles[i].object.visible = true;
        particles[i].object.material = material;
        return particles[i];
      }
    }
    var particle = {
      object: new THREE.Mesh(particleGeometry, material),
      velocity: new THREE.Vector3()
    };
    particle.object.receiveShadow = true;
    particle.object.castShadow = true;
    scene.add(particle.object);
    particles.push(particle);
    return particle;
  }

  function explode(player) {
    for (var i = 0; i < 500; i ++) {
      var particle = getParticle(player.object.material);
      var speed = 0.1 + (Math.random() * 0.2);
      particle.object.position.copy(player.object.position);
      particle.velocity.set(
        -1.0 + (Math.random() * 2.0),
        -1.0 + (Math.random() * 2.0),
        0.0 + (Math.random() * 1.0)
      ).normalize().multiplyScalar(speed);
    }
  }

  var SPAWN_TIME = 2000;

  function respawn() {
    thisPlayer.dead = false;
    thisPlayer.object.visible = true;
    deathscreen.style.display = 'none';
    overlay.style.background = 'rgba(0, 0, 0, 0)';
    spawn()
    sendPosition();
    for (var name in players) {
      if (players.hasOwnProperty(name)) {
        var player = players[name];
        updatePlayerIndicator(player);
        updatePlayerLabel(player);
      }
    }
  }

  function killPlayer(victim, killer) {
    if (!victim || victim.dead) return;
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
  }

  function updatePlayerLabel(player) {
    var vector = new THREE.Vector3();
    vector.setFromMatrixPosition( player.object.matrixWorld ).project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    player.label.style.left = '' + vector.x + 'px';
    player.label.style.top = '' + vector.y + 'px';
  }

  var indVector = new THREE.Vector3();
  function updatePlayerIndicator(player) {
    indVector.copy(player.object.position).sub(thisPlayer.object.position);
    var distanceSq = indVector.lengthSq();
    indVector.normalize();
    player.indicator.visible = distanceSq > 100;
    player.indicator.position.copy(indVector.multiplyScalar(5).add(thisPlayer.object.position));
    player.indicator.lookAt(player.object.position);
  }

  function findOrCreatePlayer(playerName, playerColor) {
    if (!players[playerName]) {
      var playerCube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
      var cube2 = new THREE.Mesh( geometry, playerCube.material );
      cube2.receiveShadow = true;
      cube2.castShadow = true;
      cube2.scale.set(0.5, 0.5, 0.5);
      cube2.position.set(0, 0.5, 0);
      playerCube.add(cube2);
      playerCube.receiveShadow = true;
      playerCube.castShadow = true;
      scene.add( playerCube );
      var label = document.createElement('span');
      label.classList.add('player-label');
      label.innerText = playerName;
      overlay.appendChild(label);
      var playerIndicator = new THREE.Mesh(geometry, playerCube.material);
      scene.add(playerIndicator);
      playerIndicator.scale.set(0.2, 0.2, 0.2);
      players[playerName] = {
        object: playerCube,
        indicator: playerIndicator,
        label: label,
        name: playerName,
        kills: 0, deaths: 0 };
      updatePlayerIndicator(players[playerName]);
      createScoreCard(players[playerName]);
    }
    return players[playerName];
  }

  function formatSpawnTime(time) {
    return ''+time;
  }

  function startGame() {
    spawn();

    var isDragging = false;
    var previousMousePosition = new THREE.Vector2(0, 0);
    var deltaMove = new THREE.Vector2(0, 0);
    var cameraMousePosition = new THREE.Vector3();

    var RIGHT = 37;
    var UP = 38;
    var LEFT = 39;
    var DOWN = 40;
    var SPACE = 32;

    var keystates = {};

    $(document).on('keydown', function(e) {
      keystates[e.keyCode] = true;
      e.preventDefault();
    }).on('keyup', function(e) {
      keystates[e.keyCode] = false;
      e.preventDefault();
    });

    $(document).on('mouseup', function(e) {
        isDragging = false;
        e.preventDefault();
    });

    var render = function () {
      requestAnimationFrame( render );

      var now = new Date().getTime();

      if (thisPlayer.dead) {
        var timeSinceDeath = now - thisPlayer.diedAt;
        deathtimer.innerText = formatSpawnTime(SPAWN_TIME - timeSinceDeath);
        if (timeSinceDeath > SPAWN_TIME) {
          respawn();
        }
      } else {
        if(keystates[UP]) {
          velocity.add(new THREE.Vector3(0, 1, 0).applyQuaternion(cube.quaternion).normalize().multiplyScalar(ACCELERATION));
        } else if (keystates[DOWN]) {
          velocity.add(new THREE.Vector3(0, 1, 0).applyQuaternion(cube.quaternion).normalize().multiplyScalar(-ACCELERATION));
        } else {
          velocity.multiplyScalar(DAMPENING);
        }
        if (velocity.lengthSq() > MAX_SPEED * MAX_SPEED) {
          velocity.setLength(MAX_SPEED);
        }
        if(keystates[LEFT]) {
          cube.rotation.z -= 0.1;
        } else if (keystates[RIGHT]) {
          cube.rotation.z += 0.1;
        }
        if(keystates[SPACE]) {
          fireGun();
        }

        cube.position.add(velocity);

        sendPosition();
      }

      bullets.forEach(function(bullet) {
        if (bullet.object.visible) {
          var oldPosition = bullet.object.position.clone();
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

      particles.forEach(function(particle) {
        if (particle.object.visible) {
          particle.object.position.add(particle.velocity);
          particle.velocity.z -= 0.02;
          if (particle.object.position.z < 0) {
            particle.object.visible = false;
          }
        }
      });

      for (var name in players) {
        if (players.hasOwnProperty(name)) {
          var player = players[name];
          if (player.dead) continue;
          updatePlayerIndicator(player);
          updatePlayerLabel(player);
        }
      }

      renderer.render(scene, camera);
    };

    render();
  }

  function playerForName(playerName) {
    if (playerName === name) return thisPlayer;
    return players[playerName];
  }

  var websocket = new WebSocket('ws://' + window.location.host + '/game');
  websocket.onopen = function(evt) {
    websocket.send('c,'+name)
    startGame();
  };
  websocket.onclose = function(evt) {

  };
  websocket.onmessage = function(evt) {
    var parts = evt.data.split(',');
    var playerName = parts[0];
    var messageType = parts[1];
    if (messageType === 'n') {
      thisPlayer.name = name = playerName;
      thisPlayer.object.material.color = new THREE.Color(parts[2]);
      updateScoreCard(thisPlayer);
      return;
    }
    var player = findOrCreatePlayer(playerName);
    var now = new Date().getTime();
    if (messageType === 'c') {
      player.object.material.color.set(parts[2]);
      updateScoreCardColor(player);
    } else if (messageType === 'd') {
      scene.remove(player.object);
      scene.remove(player.indicator);
      overlay.removeChild(player.label);
      scoreboardBody.removeChild(player.scorecard);
      delete players[playerName];
    } else if (messageType === 'p') {
      player.object.position.x = parseFloat(parts[2]);
      player.object.position.y = parseFloat(parts[3]);
      player.object.rotation.z = parseFloat(parts[4]);

      if (player.dead && (now - player.diedAt) > SPAWN_TIME) {
        player.object.visible = true;
        player.dead = false;
        player.label.style.display = 'inline-block';
        player.indicator.visible = true;
      }

      updatePlayerLabel(player);
      updatePlayerIndicator(player);
    } else if (messageType === 'f') {
      playerFired(player, parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]))
    } else if (messageType === 'k') {
      var killer = playerForName(playerName);
      var victim = playerForName(parts[2]);
      killPlayer(victim, killer);
      if (victim === thisPlayer) {
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        deathscreen.style.display = 'block';
        deathtimer.innerText = formatSpawnTime(SPAWN_TIME);
        deathmessage.innerText = '' + killer.name + ' killed you, bro!';
      }
    }
  };
  websocket.onerror = function(evt) {

  };
});
