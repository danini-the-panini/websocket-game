/* eslint-env node */
/* eslint-disable no-console */

import Player from "./player";

const express = require("express");
const expressWs = require("express-ws");
const compression = require("compression");

const app = express();

app.use(compression());
app.use(express.static("public"));

const clients = [];
const nameCounts = {};

function clientForName(name) {
  for(let i = 0; i < clients.length; i++) {
    if (clients[i].name === name) return clients[i];
  }
}

function normalizeName(name) {
  console.log(`Normalizing: [${name}]`);
  if (/[\,\<\>\\\/]/.test(name)) {
    return "Dumbass!";
  }
  return name.substring(0, 10);
}

function getUniqueName(name) {
  if (!nameCounts[name]) {
    nameCounts[name] = 1;
    return name;
  } else {
    nameCounts[name] ++;
    return `${name} (${nameCounts[name]})`;
  }
}

const SPAWN_TIME = 2000;

expressWs(app);
app.ws("/game", function(ws) {
  const client = new Player();
  client.ws = ws;
  clients.push(client);
  ws.on("message", function(msg) {
    const now = new Date().getTime();
    if (client.disconnected) {
      return;
    }
    const parts = msg.split(",");
    const messageType = parts[0];
    if (messageType === "c") {
      client.givenName = normalizeName(msg.substring(2) || "New Folder");
      client.name = getUniqueName(client.givenName);
      console.log(`Client Connected: ${client.name}`);
      client.ws.send(`${client.name},n,#${client.color.getHexString()}`);
      clients.forEach(function(c) {
        if (c !== client && !c.disconnected) {
          try {
            c.ws.send(`${client.name},c,#${client.color.getHexString()}`);
            client.ws.send(`${c.name},c,#${c.color.getHexString()}`);
          } catch (e) {console.error(e);}
        }
      });
    } else {
      if (messageType === "k") {
        client.kills++;
        const deadClient = clientForName(parts[1]);
        if (deadClient) {
          deadClient.deaths++;
          deadClient.dead = true;
        }
      } else if (messageType === "p") {
        if (client.dead) {
          if (now - client.diedAt < SPAWN_TIME) return;
          client.dead = false;
        }
      }
      clients.forEach(function(c) {
        if (c !== client && !c.disconnected) {
          try { c.ws.send(`${client.name},${msg}`); }
          catch (e) {console.error(e);}
        }
      });
    }
  });
  ws.on("close", function() {
    console.log(`${client.name} disconnected.`);
    client.disconnected = true;
    nameCounts[client.givenName]--;
    clients.forEach(function(c) {
      if (c !== client && !c.disconnected) {
        try { c.ws.send(`${client.name},d`); }
        catch (e) {console.error(e);}
      }
    });
    for(let i = clients.length - 1; i >= 0; i--) {
      if(clients[i] === client) {
        clients.splice(i, 1);
        return;
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Server started.");
});
