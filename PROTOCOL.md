# Game Protocol

## Client Messages

 - Connect `c`

   Reports player details to server. This is the first message a client should send to the server.

   `c,<PLAYER_NAME>`

 - Position `p`

   Reports player position and rotation to the server.

   `p,<X>,<Y>,<ROTATION>`

 - Fire `f`

   Reports player firing a projectile at the specified position and direction.

   `f,<X>,<Y>,<ROTATION>`

 - Kill `k`

   Reports player killing another player.

   `k,<PLAYER_NAME>`

Server Messages

 - Connection Response `n`

   Gives a connected client their normalized name and color. This is the first message the server sends to a new client.

   `<PLAYER_NAME>,n,<CSS_COLOR>`

 - Client connected `c`

   Used to tell other clients about the existence of each other. It is broadcast to all other clients when a client connects. It is also sent to a new client for every other already-connected client.

   `<PLAYER_NAME>,c,<CSS_COLOR>`

 - Position `p`

   Broadcast a player's position to all other players.

   `<PLAYER_NAME>,p,<X>,<Y>,<ROTATION>`

 - Fire `f`

   Broadcast a player firing a projectile.

   `<PLAYER_NAME>,f,<X>,<Y>,<ROTATION>`

 - Kill `k`

   Broadcast a player killing another player.

   `<PLAYER_NAME>,k,<KILLED_PLAYER>`

## Example

client1 -> server: `c,Alice`

server -> client1: `Alice,n,#ff00ff`

client2 -> server: `c,Bob`

server -> client2: `Bob,n,#00ff00`

server -> client1: `Bob,c,#00ff00`

server -> client2: `Alice,c,#ff00ff`

client1 -> server: `p,5.2364,7.57366,0.34554`

server -> client2: `p,5.2364,7.57366,0.34554`
