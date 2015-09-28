(function() {
  module.exports.get_parsed_thingtags = function(md, content) {
    var tokens;
    if (content == null) {
      content = '';
    }
    tokens = md.parseInline(content)[0].children;
    return tokens.filter(function(item, index) {
      if (index && item.type === 'text' && tokens[index - 1].type === 'thingtag_open') {
        return true;
      }
    });
  };

}).call(this);
