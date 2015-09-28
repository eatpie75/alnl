$(document).ready(->
  window.md = markdownit('commonmark', {'typographer': true})
  md.use(require('./thingtag'))

  default_renderer = md.renderer.rules.image
  md.renderer.rules.image = (tokens, idx, options, env, self)->
    tokens[idx].attrs[2] = ['class', 'thumbnail center-block']
    return default_renderer(tokens, idx, options, env, self)

  $('.entry-content, .info-content, .thing-content').each(()->
    element = $(@)
    if not element.data('parsed')
      element.html(md.render(element.text()))
      element.data('parsed', true)
  )
)
