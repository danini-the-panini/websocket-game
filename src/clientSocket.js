/* eslint-env browser */

const _ = require("lodash");

module.exports = class ClientSocket {
  constructor(websocket) {
    this.websocket = websocket;
    this.listeners = [];

    this.websocket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      this.listeners.forEach((listener) => {
        listener.onMessage(message);
      });
    });
  }

  send(message) {
    this.websocket.send(JSON.stringify(message));
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  unsubscribe(listener) {
    _.remove(this.listeners, l => l === listener);
  }
};
