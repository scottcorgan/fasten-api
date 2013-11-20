if (process.env.NODE_ENV !== 'production') {
  console.log('\nDev mode: setting values.\n');
  
  process.env.API_HOST = 'api.fasten.dev';
  process.env.HOOKS_HOST = 'hooks.fasten.dev';
  process.env.PUSHER_APP_ID = '59872';
  process.env.PUSHER_APP_KEY = 'c9e8f9099ff0d687f7b8';
  process.env.PUSHER_APP_SECRET = '4db38aae19dee8ff6614';
  process.env.USERBIN_APP_ID = '992169816415538';
  process.env.USERBIN_APP_SECRET = '9ZtcCpSrkBpqovb8BiHGayJS63es3qrn';
  process.env.FIREBASE_URL = 'https://fasten.firebaseio.com';
}

var feedback = require('feedback');
var server = require('./server').server;
var requireDir = require('require-dir');
var PORT = process.env.PORT || 4000;

requireDir('./routes');

server.listen(PORT, function () {
  feedback.success('Server started on port: ' + PORT);
});

