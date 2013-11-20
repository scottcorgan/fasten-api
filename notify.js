var Pusher = require('pusher');
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key:  process.env.PUSHER_APP_KEY,
  secret:  process.env.PUSHER_APP_SECRET
});

var notify = function (hook, channel, body) {
  pusher.trigger(hook, channel, body);
};

module.exports = notify;