var Firebase = require('firebase');
var helpers = require('./helpers');

var fastenRef = new Firebase(process.env.FIREBASE_URL);

module.exports = function (endpoint, host, callback) {
  var endpoint = helpers.encodePath(endpoint);
  fastenRef
    .child('hooks')
    .child(endpoint)
    .once('value', function (snapshot) {
      var hook = snapshot.val();
      
      if (!hook || hook.domains.indexOf(host) < 0) {
        return callback(true);
      }
      
      callback(null, hook);
    });
};