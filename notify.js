var Pusher = require('pusher');
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key:  process.env.PUSHER_APP_KEY,
  secret:  process.env.PUSHER_APP_SECRET
});

var notify = function (hook, channel, body) {
  pusher.trigger('private-' + hook, channel, body);
};

notify.authorize = function (res, socketId, channel) {
  var auth = pusher.auth(socketId, channel);
  res.send(auth);
};

module.exports = notify;