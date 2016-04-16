'use strict';

const express = require('express');
const app = express();

app.use(express.static('public'));
const expressWs = require('express-ws')(app);

const clients = [];

app.ws('/echo', function(ws, req) {
  const client = { ws: ws };
  clients.push(client);
  ws.on('message', function(msg) {
    if (client.disconnected) {
      return;
    }
    const parts = msg.split(',');
    const messageType = parts[0];
    if (messageType === 'c') {
      client.name = parts[1];
      client.color = parts[2];
      console.log('Client Connected: ' + client.name);
      clients.forEach(function(c) {
        if (c !== client && !c.disconnected) {
          try {
            c.ws.send(client.name+',c,'+client.color);
            client.ws.send(c.name+',c,'+c.color);
          } catch (e) {console.error(e);}
        }
      });
    } else {
      clients.forEach(function(c) {
        if (c !== client && !c.disconnected) {
          try { c.ws.send('' + client.name + ',' + msg); }
          catch (e) {console.error(e);}
        }
      });
    }
  });
  ws.on('close', function() {
    console.log('' + client.name + ' disconnected.');
    client.disconnected = true;
    clients.forEach(function(c) {
      if (c !== client && !c.disconnected) {
        try { c.ws.send('' + client.name + ',d'); }
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

app.listen(3000);
