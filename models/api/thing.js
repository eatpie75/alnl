var Promise = require('bluebird');
var db = require('..');

var get_where = function(id) {
  if (isFinite(id)) {
    return {'where': {'id': id}};
  } else {
    return {'where': {'name': id}};
  }
};

var get_id = function(id) {
  if (!isFinite(id)) {
    return db.models.Thing.findOne({'where': {'name': id}, 'attributes': ['id']}).then(function(row) {
      return row.id;
    });
  } else {
    return Promise.resolve(id);
  }
};

var all = function() {
  return db.models.Thing.findAll();
};

var get = function(id) {
  return db.models.Thing.findOne(get_where(id));
};

module.exports = {
  '_get_id': get_id,
  'all': all,
  'get': get
};
