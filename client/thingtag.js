module.exports = function(md) {
  md.inline.ruler.push('thingtag', function(state, silent) {
    var start = state.pos;
    var max = state.posMax;

    if (max === 1) return false;
    if (state.src.charCodeAt(start) !== 0x40) return false;
    if (md.utils.isWhiteSpace(state.src.charCodeAt(start + 1))) return false;
    if (state.pos > 0) {
      if (!md.utils.isWhiteSpace(state.src.charCodeAt(start - 1))) return false;
    }

    while (state.pos++ < max) {
      var char = state.src.charAt(state.pos);
      if (char === '' || char.match(/\W/)) break;
    }

    if (start + 1 === state.pos) {
      state.pos = start;
      return false;
    }

    if (silent) return true;

    var content = state.src.slice(start + 1, state.pos);

    state.posMax = state.pos;
    state.pos = start + 1;

    var token;

    token = state.push('thingtag_open', 'a', 1);
    token.attrs = [['href', '#/thing/' + content], ['class', 'thing']];

    token = state.push('text', '', 0);
    token.content = content;

    token = state.push('thingtag_close', 'a', -1);

    state.pos = state.posMax;
    state.posMax = max;
    return true;
  });
};
