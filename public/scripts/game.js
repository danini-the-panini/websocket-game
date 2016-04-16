$(function() {
  var name = prompt("Please enter your name");
  const players = {};

  var WIDTH = 800;
  var HEIGHT = 600;
  var widthHalf = WIDTH/2;
  var heightHalf = HEIGHT/2;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild( renderer.domElement );

  var geometry = new THREE.BoxGeometry( 100, 100, 1 );
  var material = new THREE.MeshPhongMaterial({ color: 0x999999 });
  var floor = new THREE.Mesh( geometry, material );
  floor.position.z = 0.5;
  scene.add( floor );

  var amLight = new THREE.AmbientLight( 0x404040 );
  scene.add( amLight );

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set(10, 5, -50);
  light.lookAt(floor);
  scene.add( light );

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = -10;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

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

  function startGame() {
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
        cube.rotation.z += 0.1;
      } else if (keystates[RIGHT]) {
        cube.rotation.z -= 0.1;
      }
      if(keystates[SPACE]) {
        fireGun();
      }

      bullets.forEach(function(bullet) {
        if (bullet.object.visible) {
          bullet.object.position
            .add(new THREE.Vector3(0, 1, 0)
              .applyQuaternion(bullet.object.quaternion)
              .normalize()
              .multiplyScalar(BULLET_SPEED));
          if (now - bullet.firedAt > BULLET_LIFE) {
            bullet.object.visible = false;
          }
        }
      });

      websocket.send('p,' + cube.position.x + ',' + cube.position.y + ',' + cube.rotation.z +
        ',' + cube.material.color.getHexString());

      renderer.render(scene, camera);
    };

    render();
  }

  function findOrCreatePlayer(playerName, playerColor) {
    if (!players[playerName]) {
      console.log("player connected:", playerName);
      var playerCube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
      scene.add( playerCube );
      var label = document.createElement('span');
      label.classList.add('player-label');
      label.innerText = playerName;
      document.body.appendChild(label);
      players[playerName] = { object: playerCube, label: label };
    }
    return players[playerName];
  }

  var websocket = new WebSocket('ws://' + window.location.host + '/echo');
  websocket.onopen = function(evt) {
    websocket.send(name)
    startGame();
  };
  websocket.onclose = function(evt) {

  };
  websocket.onmessage = function(evt) {
    var parts = evt.data.split(',');
    var playerName = parts[0];
    var messageType = parts[1];
    var player = findOrCreatePlayer(playerName);
    if (messageType === 'd') {
      console.log("player disconnected:". playerName);
      scene.remove(player.object);
      document.body.removeChild(player.label);
      delete players[playerName];
    } else if (messageType === 'p') {
      player.object.position.x = parseFloat(parts[2]);
      player.object.position.y = parseFloat(parts[3]);
      player.object.rotation.z = parseFloat(parts[4]);

      player.object.material.color.set('#' + parts[5]);

      var vector = new THREE.Vector3();
      vector.setFromMatrixPosition( player.object.matrixWorld ).project(camera );

      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;

      player.label.style.left = '' + vector.x + 'px';
      player.label.style.top = '' + vector.y + 'px';
    } else if (messageType === 'f') {
      playerFired(player, parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]))
    }
  };
  websocket.onerror = function(evt) {

  };
});
