var Promise = require('bluebird');
var _ = require('lodash');
var db = require('..');

var create = function(data) {
  return db.models.Entry.create(data);
};

var get_where = function(id) {
  if (typeof id === 'string' && db.models.Entry.DATE_REGEX.test(id)) {
    return {'where': {'date': id}};
  } else {
    return {'where': {'id': parseInt(id)}};
  }
};

var get_id = function(id) {
  if (typeof id === 'string' && db.models.Entry.DATE_REGEX.test(id)) {
    return db.models.Entry.findOne({'where': {'date': id}, 'attributes': ['id']}).then(function(row) {
      return row.id;
    });
  } else {
    return Promise.resolve(id);
  }
};

var get_last_25 = function() {
  var query = {
    'limit': 25,
    'order': [['date', 'DESC']],
    'include': [
      {
        'model': db.models.Photo,
        'attributes': ['id', 'name', 'gid']
      }
    ]
  };

  return db.models.Entry.findAll(query);
};

var get_by_id = function(id) {
  var query = {
    'include': [
      {
        'model': db.models.Photo,
        'attributes': ['id', 'name', 'gid']
      }
    ]
  };

  return db.models.Entry.findOne(_.extend(query, get_where(id)));
};

var update = function(id, data) {
  return db.models.Entry.findOne(get_where(id)).then(function(entry) {
    if (data.content !== undefined) entry.update_content(data.content);

    entry.set(_.omit(data, 'content'));

    return entry.save();
  });
};

var photos = function(id) {
  return get_id(id).then(function(id) {
    var query = {
      'where': {
        'EntryId': id
      },
      'attributes': ['id', 'name']
    };
    return db.models.Photo.findAll(query);
  });
};

module.exports = {
  'create': create,
  '_get_id': get_id,
  'get_by_id': get_by_id,
  'get_last_25': get_last_25,
  'update': update,
  'photos': photos
};
