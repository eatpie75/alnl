var m = require('mithril');
var md = require('../md');

var parse_content;

var Information = function(information) {
  information = information || {};
  information.data = information.data || '{}';

  this.id = m.prop(information.id);
  this.date = m.prop(information.date);
  this.EntryId = m.prop(information.EntryId);
  this.ThingId = m.prop(information.ThingId);
  this.data = m.prop(JSON.parse(information.data));

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

parse_content = function() {
  return (this.data().content) ? md.render(this.data().content) : '';
};

Information.get_by_thing = function(thing) {
  return m.request({'url': '/api/information/thing/' + thing, 'type': Information});
};

module.exports = Information;
