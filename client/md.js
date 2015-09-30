var markdownit = require('markdown-it');
var thingtag = require('./thingtag');

var md = markdownit('commonmark', {'typographer': true});
md.use(thingtag);

var default_renderer = md.renderer.rules.image;
md.renderer.rules.image = function(tokens, idx, options, env, self) {
  tokens[idx].attrs[2] = ['class', 'thumbnail center-block'];
  return default_renderer(tokens, idx, options, env, self);
};

module.exports = md;
