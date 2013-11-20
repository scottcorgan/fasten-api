var request = require('request');
var hat = require('hat');
var _ = require('lodash');
var async = require('async');
var api = require('../server').api;
var helpers = require('../helpers');
var Firebase = require('firebase');
var authenticateSocket = require('../socket_auth');
var notify = require('../notify');
var fastenRef = new Firebase(process.env.FIREBASE_URL);

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


api.post('/pusher/auth', function (req, res) {
  if (!req.body.socket_id || !req.body.channel_name) return res.send(403);
  
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var host = req.headers.origin;
  var endpoint = channel
    .replace(/^private\-/, '')
    .replace('_', '/');
  
  authenticateSocket(endpoint, host, function (err, hook) {
    if (err) return res.send(403);
    notify.authorize(res, socketId, channel);
  });
});

function authenticateRequest (req, res, next) {
  if (!req.headers.authorization) return res.send(403);
  
  var sessionId = req.headers.authorization;
  
  request.get('https://api.userbin.com/sessions/' + sessionId, {
    auth: {
        'user': process.env.USERBIN_APP_ID,
        'pass': process.env.USERBIN_APP_SECRET,
        'sendImmediately': false
      }
  }, function (err, response, body) {
    var session = JSON.parse(body);
    
    if (!session.user) return res.send(403);
    
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

