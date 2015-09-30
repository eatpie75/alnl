var m = require('mithril');
var Thing = require('../models/Thing');
var Information = require('../models/information');

var entry = {
  'controller': function() {
    this.id = m.route.param('thing');
    this.thing = Thing.get(this.id);
    this.information = Information.get_by_thing(this.id);
  },
  'view': function(controller) {
    var thing = controller.thing();
    var information = controller.information();

    return m('div.row', [
      m('div.col-md-3', [
        m('h2', thing.name()),
        m('div.thing-content', m.trust(thing.parse_content()))
      ]),
      m('div.col-md-6', information.map(function(info) {
        return m('section.info', [
          m('h4', [
            m('a[href=' + '/entry/' + info.date() + ']', {'config': m.route}, info.date())
          ]),
          m('div.info-content', m.trust(info.parse_content()))
        ]);
      }))
    ]);
  }
};

module.exports = entry;
