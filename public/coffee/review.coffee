class ThingSearch
  constructor: ()->
    @input_timeout = null
    @previous_value = ''

    @thing_list = $('.thing-list')
    @thing_search = $('#thing-search')

    @initialize()
  initialize: ()->
    $('.thing-search-form').on('submit', (e)->
      e.preventDefault()
    )

    @thing_search.on('keyup change', (e)=>
      @handle_input(e)
    )

    _this = @
    @thing_list.on('click', '.thing-list-item > span.glyphicon-plus', (e)->
      thing = $(@).parent()
      data = {'id': thing.data('id'), 'name': thing.data('name'), 'url': thing.data('url')}
      window.thing_manager.add_thing(data)
      _this.thing_list.empty()
      _this.thing_search.focus().val('')
    )

    $('#submit').on('click', (e)->
      e.preventDefault()
      $.ajax({
        url: "/api/review/#{window.ENTRY_ID}"
        method: 'POST'
        # headers:{'X-CSRFToken':window.CSRF_TOKEN}
        data: {'selections': window.thing_manager.toJSON()}
        dataType: 'json'
        success: (data)->
          console.log(data)
      })
    )
    @fill_probable_things()

  fill_probable_things: ()->
    tokens = md.parseInline($('.review-content').text())[0].children
    things = tokens.reduce((result, item)->
      if item.type != 'thingtag_text' then return result
      return result.concat([item.content])
    , [])

    if (!things.length) then return
    $.ajax({
      'url': '/api/thing/search'
      'data': {'names': things}
      'dataType': 'json'
      success: @render_suggestions.bind(@)
    })
  handle_input: (e)->
    if e.keyCode == 13
      if @thing_list.children('.thing-list-item').length == 1
        @thing_list.find('.thing-list-item>span.glyphicon').click()
    else if @thing_search.val() == @previous_value
      ''
    else if @input_timeout is null and @thing_search.val().length >= 2
      @input_timeout = setTimeout((()=>@do_search()), 300)
    else if @input_timeout is not null and @thing_search.val().length >= 2
      clearTimeout(@input_timeout)
      @input_timeout = setTimeout((()=>@do_search()), 300)
    else if @input_timeout is not null and @thing_search.val().length < 2
      clearTimeout(@input_timeout)
    else if @input_timeout is null and @thing_search.val().length < 2
      @thing_list.empty()
      @previous_value = ''
  do_search: ()->
    clearTimeout(@input_timeout)
    @input_timeout = null
    @previous_value = @thing_search.val()
    $('.thing-search-form>div>span.glyphicon').remove()
    $('.thing-search-form>div').append($('<span class="glyphicon glyphicon-refresh"></span>'))
    $.ajax({
      url: "/api/thing/suggest"
      data: {'fragment': @thing_search.val()}
      dataType: 'json'
      success: @render_suggestions.bind(@)
    })
  render_suggestions: (suggestions)->
    $('.thing-search-form>div>span.glyphicon').remove()
    @thing_list.empty()
    for thing in suggestions
      if window.thing_manager.things[thing.id] then continue
      $("<li class='list-group-item thing-list-item' data-id='#{thing.id}' data-name='#{thing.name}' data-url='#{thing.url}'>
          <a href='#{thing.url}'>#{thing.name}</a>
          <span class='glyphicon glyphicon-plus text-success'></span>
        </li>"
      ).appendTo(@thing_list)
  add_tag: ()->
    # tag_search = $('#tag_search')
    # $.ajax({
    #   url:"#{window.AJAX_BASE}tag_add"
    #   data:{'name':tag_search.val()}
    #   dataType:'json'
    #   headers:{'X-CSRFToken':window.CSRF_TOKEN}
    #   method:'POST'
    #   success:(data)->
    #     $('#temp>dd').append("<span class='label label-#{data[2]}'>#{data[1]}</span>")
    #     tag_search.val('')
    # })
    return


class ThingManager
  constructor: (information)->
    @things = {}

    @thing_tree = $('.thing-tree')

    @templates = {
      'thing-tree-item': Hogan.compile("
        <li class='thing-tree-item'>
          <span class='glyphicon glyphicon-minus thing-remove'></span><span class='thing-tree-item-name'>{{name}}</span><span class='glyphicon glyphicon-plus thing-add'></span>
          <ul class='selection-tree'></ul>
        </li>")
      'selection-tree-item': Hogan.compile("
        <li class='selection-tree-item'>
          <span class=''>{{text}}</span><span class='glyphicon glyphicon-minus selection-remove'></span>
        </li>")
    }

    if information?
      @loadJSON(information)
  add_thing: (data)->
    if data.id not of @things
      @things[data.id] = {'name': data.name, 'url': data.url, 'selections': []}
      element = $(@templates['thing-tree-item'].render(data)).appendTo(@thing_tree)
      @things[data.id].element = element
      element.children('.thing-add').on('click', ()=>
        @activate_selector.call(@, data.id)
      )
      element.children('.thing-remove').on('click', ()=>
        @remove_thing(data.id)
      )
  remove_thing: (id)->
    if id of @things
      @things[id].element.remove()
      delete @things[id]
  get_selection: ()->
    selection = window.getSelection()
    anchor = $(selection.anchorNode)
    focus = $(selection.focusNode)
    if not selection.isCollapsed and anchor.parent().is('#review-content') and anchor[0] == focus[0]
      return [Math.min(selection.anchorOffset, selection.focusOffset), Math.max(selection.anchorOffset, selection.focusOffset)]
    else
      return false
  add_selection: (thing, selection)->
    if selection == undefined
      selection = @get_selection()
    [beginning, end] = selection
    i = @things[thing].selections.push({'beginning': beginning, 'end': end}) - 1
    element = $(@templates['selection-tree-item'].render({'text': "#{end-beginning} character(s)"})).appendTo(@things[thing].element.children('.selection-tree'))
    @things[thing].selections[i].element = element
    element.on('mouseenter', ()=>
      @highlight_selection.call(@, thing, i)
    ).on('mouseleave', ()->
      window.getSelection().removeAllRanges()
    ).children('.selection-remove').on('click', ()=>
      @remove_selection.call(@, thing, i)
    )
  highlight_selection: (thing, index)->
    temp = window.getSelection()
    range = document.createRange()
    range.setStart($('#review-content')[0].firstChild, @things[thing].selections[index].beginning)
    range.setEnd($('#review-content')[0].firstChild, @things[thing].selections[index].end)
    temp.removeAllRanges()
    temp.addRange(range)
  remove_selection: (thing, index)->
    @things[thing].selections[index].element.remove()
    @things[thing].selections.splice(index, 1)
    window.getSelection().removeAllRanges()
  activate_selector: (id)->
    $('#review-content').on('mouseup', ()=>
      $('#review-content').off('mouseup')
      @add_selection(id)
    )
  update_button: ()->
    $('#submit')
  toJSON: ()->
    data = []
    for key, value of @things
      data.push({
        'id': key
        'selections': value.selections.map((selection)->[selection.beginning, selection.end])
      })
    return JSON.stringify(data)
  loadJSON: (data)->
    for thing in data
      @add_thing({'id': thing.id, 'name': thing.name, 'url': thing.url})
      for selection in thing.selections
        @add_selection(thing.id, selection)
    return @


$(document).ready(->
  window.thing_search = new ThingSearch
  window.thing_manager = new ThingManager(window.ENTRY_INFORMATION)
)
