class Post
	constructor:()->
		@input_timeout=null
		@previous_value=''
		@draft_key=''
		@post=$('#post')

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
				method:'POST'
				# headers:{'X-CSRFToken':window.CSRF_TOKEN}
				data:{'content':$('#post').val()}
				dataType:'json'
				success:(data)=>
					window.localStorage.removeItem(@draft_key)
					window.location=data['redirect']
			})
		)

		@post.change()

$(document).ready(->
	window.post=new Post
)
