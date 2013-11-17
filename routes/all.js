var app = require('../server').app;
var hat = require('hat');
var socket = require('../socket');
var helpers = require('../helpers');
var _ = require('lodash');
var async = require('async');
var Firebase = require('firebase');
var fastenRef = new Firebase('https://fasten.firebaseio.com');


app.get('/hooks', authenticateRequest, function (req, res) {
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

app.post('/hooks', authenticateRequest, function (req, res) {
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

app.del(/^\/hooks\/(([a-z0-9_-]+\/?)*)$/, authenticateRequest, function (req, res) {
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


// TODO: rename this base url
app.post(/^\/hooks\/([a-z0-9_-]+)\/?([\w+\/?]+)?$/, function (req, res) {
  var hook = req.params.join('/');
  
  socket.sockets.in(hook).emit('hooked', req.body);
  res.send();
});


function authenticateRequest (req, res, next) {
  if (!req.headers.authorization) return res.send(403);
  fastenRef.auth(req.headers.authorization, function (err, user) {
    if (err) return res.send(403);
    
    req.user = user;
    next();
  });
}

function userHooksRef (user) {
  var email = helpers.encodeEmail(user.auth.email);
  
  return fastenRef
    .child('users')
    .child(email)
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

