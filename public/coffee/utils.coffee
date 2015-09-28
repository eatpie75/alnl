module.exports.get_parsed_thingtags = (md, content = '')->
  tokens = md.parseInline(content)[0].children
  return tokens.filter((item, index)->
    if index and item.type == 'text' and tokens[index - 1].type == 'thingtag_open' then return true
  )
