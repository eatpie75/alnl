var m = require('mithril');

m.route.mode = 'hash';

m.route(document.getElementById('app'), '/', {
  '/': require('./routes/index'),
  '/entry/:date': require('./routes/entry'),
  '/entry/:date/post': require('./routes/post'),
  '/entry/:date/review': require('./routes/review'),
  '/entry/post': require('./routes/post'),
  '/thing/:thing': require('./routes/thing')
});
