/* eslint-env browser */

const $ = require("jquery");

const ClientGame = require("./clientGame");

$(() => {
  const game = new ClientGame();
  game.start();
});
