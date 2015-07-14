class Correlate
	constructor:()->
		@input_timeout=null
		@previous_value=''
		@thing=$('#thing')
		@top_form=$('.top-form')

		@tag_form="
			<form class='tag-form form-inline' action=''>
				<div class='form-group'>
					<input id='tag_search' class='form-control' type='text' placeholder='Search for tags' autocomplete='off' minlength=3 maxlength=255>
				</div>
			</form>"

		@bind()
	begin:(e)->
		_this=@
		e.preventDefault()
		text=@thing.val()
		$('#workspace').append("
			<dl id='temp' class='dl-horizontal col-md-12'>
				<dt>#{@tag_form}</dt>
				<dd>#{text}</dd>
			</dl>
			<div class='col-md-12 tag-box'></div>"
		)
		$('.tag-form').on('submit', (e)->
			e.preventDefault()
		)
		@top_form.slideUp(400, ()->
			$('#workspace').slideDown(400, (e)->
				_this.choose_tags(e)
			)
		)
	choose_tags:()->
		_this=@
		tag_search=$('#tag_search')
		tag_search.keyup((e)->
			_this.handle_input(e)
		)
		tag_search.focus()
	handle_input:(e)->
		_this=@
		tag_search=$('#tag_search')
		if e.keyCode==13
			@add_tag()
		else if tag_search.val()==@previous_value
			''
		else if @input_timeout is null and tag_search.val().length>=3
			@input_timeout=setTimeout((()->_this.do_search()), 300)
		else if @input_timeout is not null and tag_search.val().length>=3
			clearTimeout(@input_timeout)
			@input_timeout=setTimeout((()->_this.do_search()), 300)
		else if @input_timeout is not null and tag_search.val().length<3
			clearTimeout(@input_timeout)
		else
			# console.log('????')
	do_search:()->
		tag_search=$('#tag_search')
		tag_box=$('.tag-box')
		clearTimeout(@input_timeout)
		@input_timeout=null
		@previous_value=tag_search.val()
		$.ajax({
			url:"#{window.AJAX_BASE}tag_suggest"
			data:{'fragment':tag_search.val()}
			dataType:'json'
			success:(data)->
				tag_box.html('')
				for tag in data
					tag_box.append("<span class='label label-#{tag[2]}'>#{tag[1]}</span>")
		})
	add_tag:()->
		tag_search=$('#tag_search')
		$.ajax({
			url:"#{window.AJAX_BASE}tag_add"
			data:{'name':tag_search.val()}
			dataType:'json'
			headers:{'X-CSRFToken':window.CSRF_TOKEN}
			method:'POST'
			success:(data)->
				$('#temp>dd').append("<span class='label label-#{data[2]}'>#{data[1]}</span>")
				tag_search.val('')
		})
	bind:()->
		_this=@
		@top_form.on('submit', (e)->
			_this.begin(e)
		)


$(document).ready(->
	window.correlate=new Correlate
)
