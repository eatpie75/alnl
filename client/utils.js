var each = function(collection, iter) {
  var keys = (typeof collection.length === 'number' && collection.length > 0) ? null : Object.keys(collection);
  var length = (keys) ? keys.length : collection.length;

  for (var i = 0; i < length; i++) {
    var key = (keys) ? keys[i] : i;
    iter(collection[key], key, collection);
  }
};

var map = function(collection, iter) {
  var results = [];

  each(collection, function(item, key) {
    results.push(iter(item, key, collection));
  });

  return results;
};

var filter = function(collection, predicate) {
  var results = [];

  each(collection, function(item, key) {
    if (predicate(item, key, collection)) results.push(item);
  });

  return results;
};

module.exports = {
  'each': each,
  'map': map,
  'filter': filter
};
