var hooks = require('../server').hooks;
var notify = require('../notify');
var _ = require('lodash');

hooks.post('*', forceEndpoint, function (req, res) {
  var pathname = req.params[0];
  var hook = _.rest(pathname.split('/')).join('_');
  var data = req.body || {};
  
  notify(hook, 'hooked', data);
  
  res.send();
});

function forceEndpoint (req, res, next) {
  var pathname = req.params[0];
  
  if (!pathname || pathname === '/') return res.send(404);
  next();
}