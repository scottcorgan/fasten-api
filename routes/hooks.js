var hooks = require('../server').hooks;
var socket = require('../socket');

hooks.post(/^\/([a-z0-9_-]+)\/?([\w+\/?]+)?$/, function (req, res) {
  var hook = req.params.join('/');
  
  socket.sockets.in(hook).emit('hooked', req.body);
  res.send();
});