var m = require('mithril');
var md = require('../md');

var parse_content, get_parsed_thingtags;
var render_header, render_body, render_timeline, render_photo_carousel;

var Entry = function(entry) {
  entry = entry || {};
  this.id = m.prop(entry.id);
  this.date = m.prop(entry.date);
  this.content = m.prop(entry.content || '');
  this.metadata = m.prop(entry.metadata || {});
  this.Photos = m.prop(entry.Photos || []);

  this.parse_content = parse_content;
  this.get_parsed_thingtags = get_parsed_thingtags;

  this.render_header = render_header;
  this.render_body = render_body;
  this.render_timeline = render_timeline;
  this.render_photo_carousel = render_photo_carousel;

  this.get_url = function() {
    return '/entry/' + this.date();
  }.bind(this);
  this.get_post_url = function() {
    return this.get_url() + '/post';
  }.bind(this);
  this.get_review_url = function() {
    return this.get_url() + '/review';
  }.bind(this);
};

Entry.get = function(id) {
  return m.request({'url': '/api/entry/' + id, 'type': Entry});
};
Entry.list = function() {
  return m.request({'url': '/api/entry', 'type': Entry});
};

parse_content = function() {
  return md.render(this.content());
};

get_parsed_thingtags = function() {
  var tokens = md.parseInline(this.content())[0].children;
  return tokens.filter(function(item, index) {
    return (index && item.type === 'text' && tokens[index - 1].type === 'thingtag_open');
  });
};

render_header = function(tag) {
  return m(tag || 'h2', [
    m('a[href=' + this.get_url() + ']', {'config': m.route}, this.date()),
    m('a[href=' + this.get_post_url() + ']', {'config': m.route}, [
      m('span.glyphicon.glyphicon-pencil')
    ]),
    m('a[href=' + this.get_review_url() + ']', {'config': m.route}, [
      m('span.glyphicon.glyphicon-search')
    ])
  ]);
};

render_body = function(tag) {
  return m(tag || 'div' + '.entry-content', m.trust(this.parse_content()));
};

render_timeline = function(tag) {
  var timeline = this.metadata().timeline || [];
  return m(tag || 'div' + '.timeline-container', [
    m('ul.timeline-list', timeline.map(function(item) {
      var map_url = 'https://maps.google.com/?ll=' + [item.coords.lat, item.coords.lon].join() + '&q=' + encodeURIComponent(item.address);
      return m('li.timeline-item', [
        m('span', new Date(item.begin).toLocaleTimeString() + '-' + new Date(item.end).toLocaleTimeString() + ':'),
        m('a', {'href': map_url}, item.name)
      ]);
    }))
  ]);
};

render_photo_carousel = function() {
  var photos = this.Photos();
  if (!photos.length) return;

  var carousel_indicators, carousel_controls;
  if (photos.length > 1) {
    carousel_indicators = m('ol.carousel-indicators', photos.map(function(photo, index) {
      return m('li' + (!index) ? '.active' : '', {'data-target': '#entry-photos-container-' + this.id(), 'data-slide-to': index});
    }));
    carousel_controls = [
      m('a.left.carousel-control', {'href': '#entry-photos-container-' + this.id(), 'role': 'button', 'data-slide': 'prev'}, [
        m('span.glyphicon.glyphicon-chevon-left', {'aria-hidden': true}),
        m('span.sr-only', 'Previous')
      ]),
      m('a.right.carousel-control', {'href': '#entry-photos-container-' + this.id(), 'role': 'button', 'data-slide': 'next'}, [
        m('span.glyphicon.glyphicon-chevon-right', {'aria-hidden': true}),
        m('span.sr-only', 'Next')
      ])
    ];
  }

  return m('div#entry-photos-container-' + this.id() + '.entry-photos-container.carousel.slide', {'data-interval': false}, [
    carousel_indicators,
    m('div.carousel-inner', {'role': 'listbox'}, [
      photos.map(function(photo, index) {
        return m('div' + (!index) ? '.active' : '', [m('img', {'src': '/image/' + photo.id})]);
      })
    ]),
    carousel_controls
  ]);
};

module.exports = Entry;
