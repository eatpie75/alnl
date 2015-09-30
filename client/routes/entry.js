var m = require('mithril');
var Entry = require('../models/entry');

var entry = {
  'controller': function() {
    this.date = m.route.param('date');
    this.entry = Entry.get(this.date);
  },
  'view': function(controller) {
    return m('div.row', [
      m('div.col-md-12', [
        m('div.entry', controller.entry().render_header()),
        m('div.row', [
          m('div.col-md-6', controller.entry().render_body()),
          m('div.col-md-6', controller.entry().render_timeline())
        ])
      ])
    ]);
  }
};

module.exports = entry;
