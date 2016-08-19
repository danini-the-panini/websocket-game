/* eslint-env node */

import express from 'express';
import expressWs from 'express-ws';

const app = express();

expressWs(app);

app.use(express.static('public'));

const clients = [];
const nameCounts = {};

const clientForName = name => {
  for (let i = 0; i < clients.length; i++) {
    if (clients[i].name === name) {
      return clients[i];
    }
  }

  return null;
};

const normalizeName = name => {
  if (/[,<>\\\/]/.test(name)) {
    return 'Dumbass!';
  }

  return name.substring(0, 10);
};

const getUniqueName = name => {
  if (nameCounts[name]) {
    nameCounts[name]++;

    return `${name} (${nameCounts[name]})`;
  }
  nameCounts[name] = 1;

  return name;
};

const SPAWN_TIME = 2000;

app.ws('/game', ws => {
  const client = { ws, kills: 0, deaths: 0 };

  clients.push(client);
  ws.on('message', msg => {
    const now = new Date().getTime();

    if (client.disconnected) {
      return;
    }
    const parts = msg.split(',');
    const messageType = parts[0];

    if (messageType === 'c') {
      client.givenName = normalizeName(msg.substring(2) || 'New Folder');
      client.name = getUniqueName(client.givenName);
      client.color = `#${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`;
      console.log(`Client Connected: ${client.name}`);
      client.ws.send(`${client.name},n,${client.color.toString(16)}`);
      clients.forEach(c => {
        if (c !== client && !c.disconnected) {
          try {
            c.ws.send(`${client.name},c,${client.color}`);
            client.ws.send(`${c.name},c,${c.color}`);
          } catch (e) {
            console.error(e);
          }
        }
      });
    } else {
      if (messageType === 'k') {
        client.kills++;
        const deadClient = clientForName(parts[1]);

        if (deadClient) {
          deadClient.deaths++;
          deadClient.dead = true;
        }
      } else if (messageType === 'p') {
        if (client.dead) {
          if (now - client.diedAt < SPAWN_TIME) {
            return;
          }
          client.dead = false;
        }
      }
      clients.forEach(c => {
        if (c !== client && !c.disconnected) {
          try {
            c.ws.send(`${client.name},${msg}`);
          } catch (e) {
            console.error(e);
          }
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`${client.name} disconnected.`);
    client.disconnected = true;
    nameCounts[client.givenName]--;
    clients.forEach(c => {
      if (c !== client && !c.disconnected) {
        try {
          c.ws.send(`${client.name},d`);
        } catch (e) {
          console.error(e);
        }
      }
    });
    for (let i = clients.length - 1; i >= 0; i--) {
      if (clients[i] === client) {
        clients.splice(i, 1);

        return;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
