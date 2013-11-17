var feedback = require('feedback');
var server = require('./server');
var socket = require('./socket');
var requireDir = require('require-dir');
var PORT = process.env.PORT || 4000;

requireDir('./routes');

server.listen(PORT, function () {
  feedback.success('Server started on port: ' + PORT);
});

