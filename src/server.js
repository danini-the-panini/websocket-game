/* eslint-env node */
/* eslint-disable no-console */

import ServerGame from "./serverGame";

const express = require("express");
const expressWs = require("express-ws");
const compression = require("compression");

const app = express();

app.use(compression());
app.use(express.static("public"));

const game = new ServerGame();

expressWs(app);
app.ws("/game", (websocket) => {
  game.playerConnected(websocket);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
