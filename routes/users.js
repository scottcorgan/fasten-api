var api = require('../server').api;
var async = require('async');
var _ = require('lodash');
var hat = require('hat');

api.post('/users/login', function (req, res) {
  async.waterfall([
    function (cb) {
      UserApp.User.login({
        login: req.body.email,
        password: req.body.password
      }, cb);
    },
    function (login, cb) {
      UserApp.setToken(login.token);
      getAuthenticatedUser(login.user_id, function (err, user) {
        var fullUser = _.extend(_.clone(user), login);
        cb(err, fullUser);
      });
    }
  ], function (err, user) {
    req.session.userToken = user.token;
    res.json(user);
  });
});

api.post('/users/logout', function (req, res) {
  var token = re;q.headers.authorization
  UserApp.setToken(token);
  UserApp.User.logout(function (err, result) {
    res.send();
  });
});

// api.get('/users/generate_token ', function (req, res) {
//   res.send(hat(256));
// });

function getAuthenticatedUser (id, callback) {
  UserApp.User.get({user_id: 'self'}, function (err, user) {
    callback(err, user[0]);
  });
}