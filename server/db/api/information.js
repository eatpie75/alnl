var db = require('../models');
var get_id = require('./thing')._get_id;

var all = function() {
  return db.models.Information.findAll();
};

var get_by_thing = function(thing) {
  return get_id(thing).then(function(id) {
    return db.models.Information.findAll({'where': {'ThingId': id}, 'order': [['date', 'desc']]});
  });
};

module.exports = {
  'all': all,
  'get_by_thing': get_by_thing
};
