module.exports = (md)->
  md.inline.ruler.push('thingtag', (state, silent)->
    start = state.pos
    max = state.posMax

    if max == 1 then return false
    if state.src.charCodeAt(start) != 0x40 then return false
    if md.utils.isWhiteSpace(state.src.charCodeAt(start + 1)) then return false
    if state.pos > 0
      if not md.utils.isWhiteSpace(state.src.charCodeAt(start - 1)) then return false

    while state.pos++ < max
      char = state.src.charAt(state.pos)
      if char == '' or char.match(/\W/) then break

    if start + 1 == state.pos
      state.pos = start
      return false

    if silent then return true

    content = state.src.slice(start + 1, state.pos)

    state.posMax = state.pos
    state.pos = start + 1

    token = state.push('thingtag_open', 'a', 1)
    token.attrs = [['href', '/thing/' + content], ['class', 'thing']]

    token = state.push('text', '', 0)
    token.content = content

    token = state.push('thingtag_close', 'a', -1)

    state.pos = state.posMax
    state.posMax = max
    return true
  )
