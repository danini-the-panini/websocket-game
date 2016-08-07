import { jsdom } from 'jsdom';

global.document = jsdom('<body></body>');
global.window = document.defaultView;
global.navigator = window.navigator;

global.$ = require('jquery');

global.Trello = {
  authorize() {},
  setToken(token) { this._token = token; },
  token() { return this._token; },
  get(path, cb) { cb({}); }
};
