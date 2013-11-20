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

var server = express();
server.use(express.vhost(process.env.API_HOST, api));
server.use(express.vhost(process.env.HOOKS_HOST, hooks));

module.exports = {
  api: api,
  hooks: hooks,
  server: server
};