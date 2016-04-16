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

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = -10;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  function startGame() {
    var isDragging = false;
    var previousMousePosition = new THREE.Vector2(0, 0);
    var deltaMove = new THREE.Vector2(0, 0);
    var cameraMousePosition = new THREE.Vector3();

    var RIGHT = 37;
    var UP = 38;
    var LEFT = 39;
    var DOWN = 40;

    var keystates = {};

    $(document).on('keydown', function(e) {
      keystates[e.keyCode] = true;
    }).on('keyup', function(e) {
      keystates[e.keyCode] = false;
    });

    $(document).on('mouseup', function(e) {
        isDragging = false;
    });

    var render = function () {
      requestAnimationFrame( render );

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

      websocket.send('' + cube.position.x + ',' + cube.position.y + ',' + cube.rotation.z +
        ',' + cube.material.color.getHexString());

      renderer.render(scene, camera);
    };

    render();
  }

  function findOrCreatePlayer(playerName, playerColor) {
    if (!players[playerName]) {
      console.log("player connected:", playerName);
      var playerCube = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
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
    var player = findOrCreatePlayer(playerName);
    if (parts[1] === 'disconnected') {
      scene.remove(player.object);
      document.body.removeChild(player.label);
      delete players[playerName];
      console.log("player disconnected:". playerName);
    } else {
      player.object.position.x = parseFloat(parts[1]);
      player.object.position.y = parseFloat(parts[2]);
      player.object.rotation.z = parseFloat(parts[3]);

      player.object.material.color.set('#' + parts[4]);

      var vector = new THREE.Vector3();
      vector.setFromMatrixPosition( player.object.matrixWorld ).project(camera );

      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;

      player.label.style.left = '' + vector.x + 'px';
      player.label.style.top = '' + vector.y + 'px';
    }
  };
  websocket.onerror = function(evt) {

  };
});
