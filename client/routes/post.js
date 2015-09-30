var m = require('mithril');
var Entry = require('../models/entry');

var entry = {
  'controller': function() {
    var post_box = document.getElementById('post');
    this.date = m.route.param('date');
    this.photos = [];

    if (this.date) {
      this.entry = Entry.get(this.date).then(function(entry) {
        this.photos = entry.Photos();
        return entry;
      }.bind(this));
    } else {
      this.entry = m.prop(new Entry());
    }

    var draft_key = (this.date) ? 'draft/' + this.date : 'draft';
    if (post_box && post_box.value === '' && window.localStorage.getItem(draft_key)) {
      this.entry().content(window.localStorage.getItem(draft_key));
    } else {
      window.localStorage.setItem(draft_key, '');
    }

    this.submit = function() {
      var url = '/api/entry';
      var date = this.date;
      var entry = this.entry;

      m.request({
        'url': url + ((date) ? '/' + date : ''),
        'method': (date) ? 'PUT' : 'POST',
        'data': entry,
        'type': Entry
      }).then(function(res) {
        m.route(res.get_review_url());
      });
    }.bind(this);
  },
  'view': function(controller) {
    return [
      m('div.row', [
        m('div.col-md-6', [
          m('form', {'role': 'form'}, [
            m('div.form-group', [
              m('textarea#post.col-md-12.form-control', {'rows': 24, 'oninput': m.withAttr('value', controller.entry().content)}, controller.entry().content())
            ])
          ])
        ]),
        m('div.col-md-6', [
          m('div.panel.panel-default.preview-container', [
            m('div#preview.panel-body', m.trust(controller.entry().parse_content()))
          ])
        ])
      ]),
      m('div.row', [
        m('div.col-md-12.post-buttons', [
          m('button#submit.btn.btn-info.center-block', {'type': 'button', 'onclick': controller.submit}, 'Submit')
        ])
      ]),
      m('div.row', [
        m('div.col-md-12.photo-list-container', [
          m('div.photo-list')
        ])
      ])
    ];
  }
};

module.exports = entry;
