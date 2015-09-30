var m = require('mithril');
var Entry = require('../models/entry');

var index = {
  'controller': function() {
    this.entries = Entry.list();
  },
  'view': function(controller) {
    return m('div.row', [
      m('div.col-md-6.col-md-offset-3', [
        controller.entries().map(function(entry) {
          return m('section.entry', [
            entry.render_header(),
            entry.render_photo_carousel(),
            entry.render_body()
          ]);
        })
      ])
    ]);
  }
};

module.exports = index;
