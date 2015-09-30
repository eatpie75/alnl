var m = require('mithril');
var _ = require('../utils');
var Entry = require('../models/entry');
var Thing = require('../models/thing');

var Things = {};
var CurrentThings = {
  'init': function() {
    this.list = {};
    this.selecting = false;
  },
  'add_thing': function(data) {
    if (data.id in CurrentThings.list) return;

    CurrentThings.list[data.id] = {
      'id': data.id,
      'name': data.name,
      'url': data.url,
      'selections': []
    };
  },
  'remove_thing': function(id) {
    if (id in CurrentThings.list) {
      delete CurrentThings.list[id];
    }
  },
  'get_selection': function() {
    var selection = window.getSelection();
    var anchor = selection.anchorNode;
    var focus = selection.focusNode;

    if (!selection.isCollapsed && anchor.parentNode.id === 'review-content' && anchor === focus) {
      return [Math.min(selection.anchorOffset, selection.focusOffset), Math.max(selection.anchorOffset, selection.focusOffset)];
    } else {
      return false;
    }
  },
  'add_selection': function(thing, selection) {
    if (CurrentThings.selecting === false && !selection) return;
    if (CurrentThings.selecting !== false && !selection) thing = CurrentThings.selecting;
    if (selection === undefined) selection = CurrentThings.get_selection();
    CurrentThings.list[thing].selections.push(selection);
    CurrentThings.selecting = false;
  },
  'highlight_selection': function(thing, index) {
    var selector = window.getSelection();
    var range = document.createRange();
    var node = document.getElementById('review-content').childNodes[0];

    range.setStart(node, CurrentThings.list[thing].selections[index][0]);
    range.setEnd(node, CurrentThings.list[thing].selections[index][1]);
    selector.removeAllRanges();
    selector.addRange(range);
  },
  'hightlight_remove': function() {
    window.getSelection().removeAllRanges();
  },
  'remove_selection': function(thing, index) {
    CurrentThings.list[thing].selections.splice(index, 1);
    window.getSelection().removeAllRanges();
  },
  'activate_selector': function(thing) {
    CurrentThings.selecting = thing;
  },
  'save': function() {
    var data = [];

    for (var key in CurrentThings.list) {
      key = Number(key);
      data.push({
        'id': key,
        'selections': CurrentThings.list[key].selections
      });
    }

    return data;
  },
  'render': function() {
    return m('ul.thing-tree', _.map(CurrentThings.list, function(thing) {
      return m('li.thing-tree-item', [
        m('span.glyphicon.glyphicon-minus.thing-remove', {'onclick': CurrentThings.remove_thing.bind(CurrentThings, thing.id)}),
        m('span.thing-tree-item-name', thing.name),
        m('span.glyphicon.glyphicon-plus.thing-add', {'onclick': CurrentThings.activate_selector.bind(CurrentThings, thing.id)}),
        m('ul.selection-tree', _.map(thing.selections, function(selection, index) {
          return m('li.selection-tree-item', {'onmouseenter': CurrentThings.highlight_selection.bind(CurrentThings, thing.id, index), 'onmouseleave': CurrentThings.hightlight_remove}, [
            m('span', selection[1] - selection[0] + ' character(s)'),
            m('span.glyphicon.glyphicon-minus.selection-remove', {'onclick': CurrentThings.remove_selection.bind(CurrentThings, thing.id, index)})
          ]);
        }))
      ]);
    }));
  }
};
var ThingSearch = {
  'init': function() {
    this.options = [];
    this.default_options = [];
    this.value = m.prop('');
  },
  'oninput': function(e) {
    e.preventDefault();

    if (e.keyCode === 13 && ThingSearch.options.length === 1) {
      var thing = ThingSearch.options[0];
      CurrentThings.add_thing({
        'id': thing.id(),
        'name': thing.name(),
        'url': thing.get_url()
      });
      ThingSearch.options = ThingSearch.default_options;
      ThingSearch.value('');
      // focus
      return;
    }

    if (e.target.value === ThingSearch.value()) return;

    ThingSearch.value(e.target.value);

    ThingSearch.options = _.filter(Things, function(option) {
      return option.name().toLowerCase().match(ThingSearch.value());
    });
  },
  'render': function() {
    return m('div.col-md-3.thing-search-container', [
      m('form.thing-search-form.form-inline', {'onsubmit': function(e) {e.preventDefault();}}, [
        m('div.form-group', [
          m('input#thing-search.form-control', {'onkeyup': ThingSearch.oninput, 'type': 'text', 'placeholder': 'Search for things', 'autocomplete': 'off', 'minlength': 3, 'maxlength': 255})
        ]),
        m('ul.list-group.thing-list', _.map(ThingSearch.options, function(option) {
          if (option.id() in CurrentThings.list) return;
          return m('li.list-group-item.thing-list-item', [
            m('a[href=' + option.get_url() + ']', {'config': m.route}, option.name()),
            m('span.glyphicon.glyphicon-plus.text-success', {'onclick': CurrentThings.add_thing.bind(CurrentThings, {'id': option.id(), 'name': option.name(), 'url': option.get_url()})})
          ]);
        }))
      ])
    ]);
  }
};

var review = {
  'controller': function() {
    this.date = m.route.param('date');

    ThingSearch.init();
    CurrentThings.init();

    this.entry = m.sync([
      Thing.hash(),
      Entry.get(this.date)
    ]).then(function(results) {
      Things = results[0];

      var entry = results[1];

      var probable_things = entry.get_parsed_thingtags().map(function(thing) {
        return thing.content;
      });

      ThingSearch.default_options = _.filter(Things, function(thing) {
        return (probable_things.indexOf(thing.name()) !== -1);
      });
      ThingSearch.options = ThingSearch.default_options;

      if (entry.metadata().information) {
        entry.metadata().information.forEach(function(thing) {
          thing.name = Things[thing.id].name();
          CurrentThings.list[thing.id] = thing;
        });
      }

      return entry;
    });

    this.submit = function() {
      var url = '/api/entry/' + this.date + '/review';

      m.request({
        'url': url,
        'method': 'POST',
        'data': CurrentThings.save()
      });
    }.bind(this);
  },
  'view': function(controller) {
    return [
      m('div.row', [
        m('div.col-md-12.review-header', [
          m('button.btn.btn-default', {'type': 'button', 'onclick': controller.submit}, 'Submit')
        ])
      ]),
      m('div.row', [
        ThingSearch.render(),
        m('div.col-md-6', [
          m('pre#review-content.review-content', {'onmouseup': CurrentThings.add_selection}, controller.entry().content())
        ]),
        m('div.col-md-3.thing-tree.container', CurrentThings.render())
      ])
    ];
  }
};

module.exports = review;
