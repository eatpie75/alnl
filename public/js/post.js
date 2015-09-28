(function() {
  window.Post = (function() {
    function Post() {
      this.input_timeout = null;
      this.previous_value = '';
      this.draft_key = '';
      this.post = $('#post');
      this.photo_list = $('.photo-list');
      this.templates = {
        'photo-list-item': Hogan.compile("<div class='photo-list-item' data-id='{{id}}'> <a href='/image/{{id}}'><img src='/image/{{id}}'></a> <span class='glyphicon glyphicon-minus text-danger'></span> </div>")
      };
      this.init();
      this.load_photos();
    }

    Post.prototype.init = function() {
      if (window.ENTRY_ID) {
        this.draft_key = "draft/" + window.ENTRY_ID;
      } else {
        this.draft_key = 'draft';
      }
      if ($('#post').val() === '' && window.localStorage.getItem(this.draft_key)) {
        this.post.val(window.localStorage.getItem(this.draft_key));
      } else {
        window.localStorage.setItem(this.draft_key, '');
      }
      this.post.on('keydown keyup change', (function(_this) {
        return function(e) {
          $('#preview').html(md.render(_this.post.val()));
          if (_this.post.val() !== window.localStorage.getItem(_this.draft_key)) {
            return window.localStorage.setItem(_this.draft_key, _this.post.val());
          }
        };
      })(this));
      $('#submit').on('click', (function(_this) {
        return function() {
          var url;
          if (window.ENTRY_ID) {
            url = "/api/entry/" + window.ENTRY_ID;
          } else {
            url = "/api/entry";
          }
          return $.ajax({
            url: url,
            method: window.ENTRY_ID ? 'PUT' : 'POST',
            data: {
              'content': $('#post').val()
            },
            dataType: 'json',
            success: function(data) {
              window.localStorage.removeItem(_this.draft_key);
              return window.location = data['redirect'];
            }
          });
        };
      })(this));
      $('.add-photo-button').on('click', function() {
        return $('.add-photo-input').click();
      });
      $('.add-photo-input').on('change', (function(_this) {
        return function(e) {
          $('.add-photo-button').prop('disabled', true);
          return _this.upload_photos(e.target.files);
        };
      })(this));
      this.photo_list.on('click', '.glyphicon-minus', (function(_this) {
        return function(e) {
          return _this.delete_photo($(e.target).parent().data('id'));
        };
      })(this));
      this.post.change();
    };

    Post.prototype.load_photos = function() {
      if (!window.ENTRY_ID) {
        return;
      }
      $.ajax({
        url: "/api/entry/" + window.ENTRY_ID + "/photos",
        method: 'GET',
        dataType: 'json',
        success: (function(_this) {
          return function(photos) {
            var i, len, photo, results;
            _this.photo_list.empty();
            results = [];
            for (i = 0, len = photos.length; i < len; i++) {
              photo = photos[i];
              results.push(_this.photo_list.append(_this.templates['photo-list-item'].render(photo)));
            }
            return results;
          };
        })(this)
      });
    };

    Post.prototype.upload_photos = function(files) {
      var counter, data, file, i, len;
      counter = files.length;
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        data = new FormData();
        data.append('file', file);
        $.ajax({
          url: "/api/entry/" + window.ENTRY_ID + "/photos",
          type: 'POST',
          data: data,
          dataType: 'json',
          processData: false,
          contentType: false,
          success: (function(_this) {
            return function(photo) {
              if (--counter === 0) {
                $('.add-photo-button').prop('disabled', false);
              }
              return _this.photo_list.append(_this.templates['photo-list-item'].render(photo));
            };
          })(this)
        });
      }
    };

    Post.prototype.delete_photo = function(id) {
      $.ajax({
        url: "/api/entry/" + window.ENTRY_ID + "/photos/" + id,
        method: "DELETE",
        dataType: "json",
        success: (function(_this) {
          return function(data) {
            return _this.photo_list.children("[data-id=" + id + "]").first().remove();
          };
        })(this)
      });
    };

    return Post;

  })();

}).call(this);
