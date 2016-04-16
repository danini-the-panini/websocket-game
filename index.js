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
    if (client.disconnected) {
      return;
    }
    if (!client.name) {
      client.name = msg || ('Player ' + clients.length);
      console.log('Client Connected: ' + client.name);
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
    for(var i = clients.length - 1; i >= 0; i--) {
      if(clients[i] === client) {
         clients.splice(i, 1);
         return;
      }
    }
  });
});

app.listen(3000);
