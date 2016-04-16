'use strict';

const express = require('express');
const app = express();

app.use(express.static('public'));
var expressWs = require('express-ws')(app);

var clients = [];

app.ws('/echo', function(ws, req) {
  var client = { ws: ws };
  clients.push(client);
  ws.on('message', function(msg) {
    if (!client.name) {
      client.name = msg || ('Player ' + clients.length);
      console.log('Client Connected: ' + client.name);
    } else {
      clients.forEach(function(c) {
        if (c !== client) {
          try { c.ws.send('' + client.name + ',' + msg); }
          catch (e) {console.error(e);}
        }
      });
    }
  });
  ws.on('close', function() {
    console.log('' + client.name + ' disconnected.');
    for(var i = clients.length - 1; i >= 0; i--) {
      if(clients[i] === client) {
         clients.splice(i, 1);
      } else {
        clients[i].ws.send('' + client.name + ',disconnected');
      }
    }
  });
});

app.listen(3000);
