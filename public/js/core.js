(function() {
  $(document).ready(function() {
    var default_renderer;
    window.md = markdownit('commonmark', {
      'typographer': true
    });
    md.use(require('./thingtag'));
    default_renderer = md.renderer.rules.image;
    md.renderer.rules.image = function(tokens, idx, options, env, self) {
      tokens[idx].attrs[2] = ['class', 'thumbnail center-block'];
      return default_renderer(tokens, idx, options, env, self);
    };
    return $('.entry-content, .info-content, .thing-content').each(function() {
      var element;
      element = $(this);
      if (!element.data('parsed')) {
        element.html(md.render(element.text()));
        return element.data('parsed', true);
      }
    });
  });

}).call(this);
