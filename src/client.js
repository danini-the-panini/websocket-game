/* eslint-env browser */

import $ from "jquery";

import ClientGame from "./clientGame";

$(() => {
  const game = new ClientGame();
  game.start();
});
