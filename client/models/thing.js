var m = require('mithril');
var md = require('../md');

var parse_content;

var Thing = function(thing) {
  thing = thing || {};
  this.id = m.prop(thing.id);
  this.name = m.prop(thing.name);
  this.slug = m.prop(thing.slug);
  this.content = m.prop(thing.content);

  this.parse_content = parse_content;

  this.get_url = function() {
    return '/thing/' + this.id() + '/' + this.slug();
  }.bind(this);
  this.get_post_url = function() {
    return this.get_url() + '/post';
  }.bind(this);
  this.get_review_url = function() {
    return this.get_url() + '/review';
  }.bind(this);
};

Thing.get = function(id) {
  return m.request({'url': '/api/thing/' + id, 'type': Thing});
};
Thing.list = function() {
  return m.request({'url': '/api/thing', 'type': Thing});
};
Thing.hash = function() {
  return Thing.list().then(function(things) {
    var result = {};
    things.forEach(function(thing) {
      result[thing.id()] = thing;
    });
    return result;
  });
};

parse_content = function() {
  return md.render(this.content());
};

module.exports = Thing;
