var url = require('url');
var server = require('./server');
var io = require('socket.io').listen(server);
var authenticate = require('./auth');
var feedback = require('feedback');

io.set('origins', '*:*');
io.set('transports', [
  'websocket'
]);

io.sockets.on('connection', function (socket) {
  socket.on('join', function (fastener) {
    var origin = socket.handshake.headers.origin || '';
    var host = url.parse(origin).host;
    
    authenticate(fastener, host, function (err, hook) {
      if (err) {
        feedback.error('Unauthorized to use this endpoint from', host, fastener);
        return socket.emit('AUTH_ERROR', 401);
      }
      
      socket.join(fastener.endpoint);
      socket.emit('connected', 'Connected. fasten.io');
    });
  });
});

module.exports = io;