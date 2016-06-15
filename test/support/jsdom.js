const jsdom = require("jsdom");

global.document = jsdom.jsdom("<!doctype html><html><body></body></html>");
global.window = global.document.parentWindow;
