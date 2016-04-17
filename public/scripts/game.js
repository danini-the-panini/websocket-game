$(function() {
  var name = prompt("Please enter your name");
  const players = {};

  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var widthHalf = windowWidth/2;
  var heightHalf = windowHeight/2;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, windowWidth/windowHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(windowWidth, windowHeight);
  document.body.appendChild( renderer.domElement );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var geometry = new THREE.BoxGeometry( 100, 100, 1 );
  var texture = new THREE.TextureLoader().load( "images/floor.png" );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 20, 20 );
  var material = new THREE.MeshPhongMaterial({ color: 0x999999, map: texture });
  var floor = new THREE.Mesh( geometry, material );
  floor.receiveShadow = true;
  floor.position.z = -0.5;
  scene.add( floor );

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
  var cube = new THREE.Mesh( geometry, material );
  cube.receiveShadow = true;
  cube.castShadow = true;
  scene.add( cube );

  function spawn() {
    cube.position.set(-10 + Math.random() * 20, -5 + Math.random() * 10, 0);
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

  var scoreboard = document.createElement('table');
  scoreboard.innerHTML += '<thead><tr><th>Name</th><th>K</th><th>D</th></tr></thead>';
  scoreboard.classList.add('scoreboard');
  document.body.appendChild(scoreboard);

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
    scoreboard.appendChild(player.scorecard);
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
        if (player === bullet.player) continue;
        if (lineIntersects(bullet.object.position, oldPosition, player.object)) {
          if (!bullet.player) {
            websocket.send('k,'+name);
            thisPlayer.kills++;
            player.deaths++;
            updateScoreCard(thisPlayer);
            updateScoreCard(player);
            explode(player);
          }
          return true;
        }
      }
    }
    if (bullet.player && lineIntersects(bullet.object.position, oldPosition, thisPlayer.object)) {
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

      if(keystates[UP]) {
        cube.position.add(new THREE.Vector3(0, 1, 0).applyQuaternion(cube.quaternion).normalize().multiplyScalar(0.1));
      } else if (keystates[DOWN]) {
        cube.position.add(new THREE.Vector3(0, 1, 0).applyQuaternion(cube.quaternion).normalize().multiplyScalar(-0.1));
      }
      if(keystates[LEFT]) {
        cube.rotation.z -= 0.1;
      } else if (keystates[RIGHT]) {
        cube.rotation.z += 0.1;
      }
      if(keystates[SPACE]) {
        fireGun();
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

      sendPosition();

      renderer.render(scene, camera);
    };

    render();
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
      console.log("player connected:", playerName);
      var playerCube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
      playerCube.receiveShadow = true;
      playerCube.castShadow = true;
      scene.add( playerCube );
      var label = document.createElement('span');
      label.classList.add('player-label');
      label.innerText = playerName;
      document.body.appendChild(label);
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

  function playerForName(playerName) {
    if (playerName === name) return thisPlayer;
    return players[playerName];
  }

  var websocket = new WebSocket('ws://' + window.location.host + '/game');
  websocket.onopen = function(evt) {
    websocket.send('c,'+name+','+cube.material.color.getHexString())
    startGame();
  };
  websocket.onclose = function(evt) {

  };
  websocket.onmessage = function(evt) {
    var parts = evt.data.split(',');
    var playerName = parts[0];
    var messageType = parts[1];
    var player = findOrCreatePlayer(playerName);
    if (messageType === 'c') {
      player.object.material.color.set('#' + parts[2]);
      updateScoreCardColor(player);
    } else if (messageType === 'd') {
      console.log("player disconnected:", playerName);
      scene.remove(player.object);
      scene.remove(player.indicator);
      document.body.removeChild(player.label);
      scoreboard.removeChild(player.scorecard);
      delete players[playerName];
    } else if (messageType === 'p') {
      player.object.position.x = parseFloat(parts[2]);
      player.object.position.y = parseFloat(parts[3]);
      player.object.rotation.z = parseFloat(parts[4]);

      var vector = new THREE.Vector3();
      vector.setFromMatrixPosition( player.object.matrixWorld ).project(camera );

      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;

      player.label.style.left = '' + vector.x + 'px';
      player.label.style.top = '' + vector.y + 'px';
      updatePlayerIndicator(player);
    } else if (messageType === 'f') {
      playerFired(player, parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]))
    } else if (messageType === 'k') {
      console.log(playerName + ' killed ' + parts[2]);
      console.log(players);
      var killer = playerForName(playerName);
      var victim = playerForName(parts[2]);
      killer.kills += 1;
      victim.deaths += 1;
      updateScoreCard(killer);
      updateScoreCard(victim);
      if (victim) explode(victim);
      if (victim === thisPlayer) {
        spawn()
        sendPosition();
        for (var name in players) {
          if (players.hasOwnProperty(name)) {
            var player = players[name];
            updatePlayerIndicator(player);
          }
        }
      }
    }
  };
  websocket.onerror = function(evt) {

  };
});
