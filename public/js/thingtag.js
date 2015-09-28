(function() {
  var thingtag;

  thingtag = function(state, silent) {
    var content, max, start, token;
    start = state.pos;
    max = state.posMax;
    if (max === 1) {
      return false;
    }
    if (state.src.charCodeAt(start) !== 0x40) {
      return false;
    }
    if (md.utils.isWhiteSpace(state.src.charCodeAt(start + 1))) {
      return false;
    }
    if (state.pos > 0) {
      if (!md.utils.isWhiteSpace(state.src.charCodeAt(start - 1))) {
        return false;
      }
    }
    while (state.pos++ < max) {
      if (state.src.charAt(state.pos).match(/\W/)) {
        break;
      }
    }
    if (start + 1 === state.pos) {
      state.pos = start;
      return false;
    }
    if (silent) {
      return true;
    }
    content = state.src.slice(start + 1, state.pos);
    state.posMax = state.pos;
    state.pos = start + 1;
    token = state.push('thingtag_open', 'a', 1);
    token.attrs = [['href', '/thing/' + content], ['class', 'thing']];
    token = state.push('thingtag_text', '', 0);
    token.content = content;
    token = state.push('thingtag_close', 'a', -1);
    state.pos = state.posMax;
    state.posMax = max;
    return true;
  };

  window.markdownitThingtag = function(md) {
    return md.inline.ruler.push('thingtag', thingtag);
  };

}).call(this);
