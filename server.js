var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

server.app = app;

module.exports = server;