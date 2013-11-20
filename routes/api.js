var request = require('request');
var hat = require('hat');
var _ = require('lodash');
var async = require('async');
var api = require('../server').api;
var helpers = require('../helpers');

var Firebase = require('firebase');
var fastenRef = new Firebase('https://fasten.firebaseio.com');

var USERBIN_APP_ID = '992169816415538';
var USERBIN_APP_SECRET = '9ZtcCpSrkBpqovb8BiHGayJS63es3qrn';

api.get('/hooks', authenticateRequest, function (req, res) {
  getUserHooks(req.user, function (hooks) {
    async.map(_.keys(hooks), function (key, cb) {
      hookRef(key).once('value', function (snapshot) {
        var hook = snapshot.val();
        cb(null, hook);
      });
    }, function (err, hooks) {
      res.json(hooks);
    });
  });
});

api.post('/hooks', authenticateRequest, function (req, res) {
  var token = hat();
  var payload = req.body;
  var encodedEndpoint = helpers.encodePath(payload.endpoint);
  
  // TODO: check to see if this hook already exists
  
  var newHook = {
    title: payload.title,
    endpoint: payload.endpoint,
    domains: payload.domains,
    token: token,
    created_at: new Date().getTime()
  };
  
  async.parallel([
    function (cb) {
      userHooksRef(req.user).child(encodedEndpoint).set(true, cb);
    },
    function (cb) {
      fastenRef.child('hooks').child(encodedEndpoint).set(newHook, cb);
    }
  ], function () {
    res.json(newHook);
  });
});

api.del(/^\/hooks\/(([a-z0-9_-]+\/?)*)$/, authenticateRequest, function (req, res) {
  var endpoint = req.params[0];
  var encodedEndpoint = helpers.encodePath(endpoint);
  
  async.parallel([
    function (cb) {
      userHooksRef(req.user).child(encodedEndpoint).remove(cb);
    },
    function (cb) {
      fastenRef.child('hooks').child(encodedEndpoint).remove(cb);
    }
  ], function () {
    res.send();
  });
});


function authenticateRequest (req, res, next) {
  if (!req.headers.authorization) return res.send(403);
  
  var sessionId = req.headers.authorization;
  
  request.get('https://api.userbin.com/sessions/' + sessionId, {
    'auth': {
        'user': USERBIN_APP_ID,
        'pass': USERBIN_APP_SECRET,
        'sendImmediately': false
      }
  }, function (err, response, body) {
    var session = JSON.parse(body);
    req.user = session.user
    next();
  });
}

function userHooksRef (user) {
  return fastenRef
    .child('users')
    .child(user.id)
    .child('hooks');
}

function getUserHooks (user, callback) {
  userHooksRef(user).once('value', function (snapshot) {
    callback(snapshot.val());
  });
}

function hookRef (key) {
  return  fastenRef
    .child('hooks')
    .child(key)
}

