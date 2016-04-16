$(function() {
  var name = prompt("Please enter your name");
  const players = {};

  var WIDTH = 800;
  var HEIGHT = 600;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild( renderer.domElement );

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
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

      websocket.send('' + cube.position.x + ',' + cube.position.y + ',' + cube.rotation.z);

      renderer.render(scene, camera);
    };

    render();
  }

  function findOrCreatePlayer(playerName) {
    if (!players[playerName]) {
      console.log("player connected:", playerName);
      var playerCube = new THREE.Mesh( geometry, material );
      scene.add( playerCube );
      players[playerName] = { object: playerCube };
      console.log(players);
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
      delete players[playerName];
      console.log("player disconnected:". playerName);
      console.log(players);
    } else {
      player.object.position.x = parseFloat(parts[1]);
      player.object.position.y = parseFloat(parts[2]);
      player.object.rotation.z = parseFloat(parts[3]);
    }
  };
  websocket.onerror = function(evt) {

  };
});
