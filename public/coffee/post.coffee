class Post
  constructor:()->
    @input_timeout=null
    @previous_value=''
    @draft_key=''
    @post=$('#post')
    @photo_list=$('.photo-list')

    @templates={
      'photo-list-item':Hogan.compile("
        <div class='photo-list-item' data-id='{{id}}'>
          <a href='/image/{{id}}'><img src='/image/{{id}}'></a>
          <span class='glyphicon glyphicon-minus text-danger'></span>
        </div>
      ")
    }

    @init()
    @load_photos()

  init:()->
    if window.ENTRY_ID
      @draft_key="draft/#{window.ENTRY_ID}"
    else
      @draft_key='draft'
    
    if $('#post').val()=='' and window.localStorage.getItem(@draft_key)
      @post.val(window.localStorage.getItem(@draft_key))
    else
      window.localStorage.setItem(@draft_key, '')

    @post.on('keydown keyup change', (e)=>
      $('#preview').html(md.render(@post.val()))
      if @post.val()!=window.localStorage.getItem(@draft_key)
        window.localStorage.setItem(@draft_key, @post.val())
    )
    $('#submit').on('click', ()=>
      if window.ENTRY_ID
        url="/api/entry/#{window.ENTRY_ID}"
      else
        url="/api/entry"
      $.ajax({
        url:url
        method:if window.ENTRY_ID then 'PUT' else 'POST'
        # headers:{'X-CSRFToken':window.CSRF_TOKEN}
        data:{'content':$('#post').val()}
        dataType:'json'
        success:(data)=>
          window.localStorage.removeItem(@draft_key)
          window.location=data['redirect']
      })
    )

    @photo_list.on('click', '.glyphicon-minus', (e)=>
      @delete_photo($(e.target).parent().data('id'))
    )

    @post.change()
    return

  load_photos:()->
    if not window.ENTRY_ID then return

    $.ajax({
      url:"/api/entry/#{window.ENTRY_ID}/photos"
      method:'GET'
      dataType:'json'
      success:(photos)=>
        @photo_list.empty()
        for photo in photos
          @photo_list.append(@templates['photo-list-item'].render(photo))
    })
    return

  delete_photo:(id)->
    $.ajax({
      url:"/api/entry/#{window.ENTRY_ID}/photos/#{id}"
      method:"DELETE"
      dataType:"json"
      success:(data)=>
        @photo_list.children("[data-id=#{id}]").first().remove()
    })

$(document).ready(->
  window.post=new Post
)
