var helpers = {
  encodePath: function (path) {
    path = path || '';
    return path.replace(/\//gi, '-_-');
  },
  
  encodeEmail: function (email) {
    email = email || '';
    return email.replace(/\./gi, 'dot');
  }
};

module.exports = helpers;