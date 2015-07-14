// Generated by CoffeeScript 1.9.3
(function() {
  var Correlate;

  Correlate = (function() {
    function Correlate() {
      this.input_timeout = null;
      this.previous_value = '';
      this.thing = $('#thing');
      this.top_form = $('.top-form');
      this.tag_form = "<form class='tag-form form-inline' action=''> <div class='form-group'> <input id='tag_search' class='form-control' type='text' placeholder='Search for tags' autocomplete='off' minlength=3 maxlength=255> </div> </form>";
      this.bind();
    }

    Correlate.prototype.begin = function(e) {
      var _this, text;
      _this = this;
      e.preventDefault();
      text = this.thing.val();
      $('#workspace').append("<dl id='temp' class='dl-horizontal col-md-12'> <dt>" + this.tag_form + "</dt> <dd>" + text + "</dd> </dl> <div class='col-md-12 tag-box'></div>");
      $('.tag-form').on('submit', function(e) {
        return e.preventDefault();
      });
      return this.top_form.slideUp(400, function() {
        return $('#workspace').slideDown(400, function(e) {
          return _this.choose_tags(e);
        });
      });
    };

    Correlate.prototype.choose_tags = function() {
      var _this, tag_search;
      _this = this;
      tag_search = $('#tag_search');
      tag_search.keyup(function(e) {
        return _this.handle_input(e);
      });
      return tag_search.focus();
    };

    Correlate.prototype.handle_input = function(e) {
      var _this, tag_search;
      _this = this;
      tag_search = $('#tag_search');
      if (e.keyCode === 13) {
        return this.add_tag();
      } else if (tag_search.val() === this.previous_value) {
        return '';
      } else if (this.input_timeout === null && tag_search.val().length >= 3) {
        return this.input_timeout = setTimeout((function() {
          return _this.do_search();
        }), 300);
      } else if (this.input_timeout === !null && tag_search.val().length >= 3) {
        clearTimeout(this.input_timeout);
        return this.input_timeout = setTimeout((function() {
          return _this.do_search();
        }), 300);
      } else if (this.input_timeout === !null && tag_search.val().length < 3) {
        return clearTimeout(this.input_timeout);
      } else {

      }
    };

    Correlate.prototype.do_search = function() {
      var tag_box, tag_search;
      tag_search = $('#tag_search');
      tag_box = $('.tag-box');
      clearTimeout(this.input_timeout);
      this.input_timeout = null;
      this.previous_value = tag_search.val();
      return $.ajax({
        url: window.AJAX_BASE + "tag_suggest",
        data: {
          'fragment': tag_search.val()
        },
        dataType: 'json',
        success: function(data) {
          var i, len, results, tag;
          tag_box.html('');
          results = [];
          for (i = 0, len = data.length; i < len; i++) {
            tag = data[i];
            results.push(tag_box.append("<span class='label label-" + tag[2] + "'>" + tag[1] + "</span>"));
          }
          return results;
        }
      });
    };

    Correlate.prototype.add_tag = function() {
      var tag_search;
      tag_search = $('#tag_search');
      return $.ajax({
        url: window.AJAX_BASE + "tag_add",
        data: {
          'name': tag_search.val()
        },
        dataType: 'json',
        headers: {
          'X-CSRFToken': window.CSRF_TOKEN
        },
        method: 'POST',
        success: function(data) {
          $('#temp>dd').append("<span class='label label-" + data[2] + "'>" + data[1] + "</span>");
          return tag_search.val('');
        }
      });
    };

    Correlate.prototype.bind = function() {
      var _this;
      _this = this;
      return this.top_form.on('submit', function(e) {
        return _this.begin(e);
      });
    };

    return Correlate;

  })();

  $(document).ready(function() {
    return window.correlate = new Correlate;
  });

}).call(this);
