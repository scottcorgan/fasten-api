var express = require('express');
var cors = require('cors');

var api = express();
api.use(cors());
api.use(express.compress());
api.use(express.cookieParser());
api.use(express.bodyParser());
api.use(express.static(__dirname + '/public'));

var hooks = express();
hooks.use(cors());
hooks.use(express.bodyParser());

var stream = express();
stream.use(cors());
stream.use(express.cookieParser());
stream.use(express.bodyParser());

var server = express();
server.use(express.vhost('api.fasten.dev', api));
server.use(express.vhost('hooks.fasten.dev', hooks));
server.use(express.vhost('stream.fasten.dev', stream));

module.exports = {
  api: api,
  hooks: hooks,
  stream: stream,
  server: server
};