(function() {
  var ThingManager, ThingSearch;

  ThingSearch = (function() {
    function ThingSearch() {
      this.input_timeout = null;
      this.previous_value = '';
      this.thing_list = $('.thing-list');
      this.thing_search = $('#thing-search');
      this.initialize();
    }

    ThingSearch.prototype.initialize = function() {
      var _this;
      $('.thing-search-form').on('submit', function(e) {
        return e.preventDefault();
      });
      this.thing_search.on('keyup change', (function(_this) {
        return function(e) {
          return _this.handle_input(e);
        };
      })(this));
      _this = this;
      this.thing_list.on('click', '.thing-list-item > span.glyphicon-plus', function(e) {
        var data, thing;
        thing = $(this).parent();
        data = {
          'id': thing.data('id'),
          'name': thing.data('name'),
          'url': thing.data('url')
        };
        window.thing_manager.add_thing(data);
        _this.thing_list.empty();
        return _this.thing_search.focus().val('');
      });
      $('#submit').on('click', function(e) {
        e.preventDefault();
        return $.ajax({
          url: "/api/review/" + window.ENTRY_ID,
          method: 'POST',
          data: {
            'selections': window.thing_manager.toJSON()
          },
          dataType: 'json',
          success: function(data) {
            return console.log(data);
          }
        });
      });
      return this.fill_probable_things();
    };

    ThingSearch.prototype.fill_probable_things = function() {
      var things, tokens;
      tokens = md.parseInline($('.review-content').text())[0].children;
      things = tokens.reduce(function(result, item) {
        if (item.type !== 'hashtag_text') {
          return result;
        }
        return result.concat([item.content]);
      }, []);
      if (!things.length) {
        return;
      }
      return $.ajax({
        'url': '/api/thing/search',
        'data': {
          'names': things
        },
        'dataType': 'json',
        success: this.render_suggestions.bind(this)
      });
    };

    ThingSearch.prototype.handle_input = function(e) {
      if (e.keyCode === 13) {
        if (this.thing_list.children('.thing-list-item').length === 1) {
          return this.thing_list.find('.thing-list-item>span.glyphicon').click();
        }
      } else if (this.thing_search.val() === this.previous_value) {
        return '';
      } else if (this.input_timeout === null && this.thing_search.val().length >= 2) {
        return this.input_timeout = setTimeout(((function(_this) {
          return function() {
            return _this.do_search();
          };
        })(this)), 300);
      } else if (this.input_timeout === !null && this.thing_search.val().length >= 2) {
        clearTimeout(this.input_timeout);
        return this.input_timeout = setTimeout(((function(_this) {
          return function() {
            return _this.do_search();
          };
        })(this)), 300);
      } else if (this.input_timeout === !null && this.thing_search.val().length < 2) {
        return clearTimeout(this.input_timeout);
      } else if (this.input_timeout === null && this.thing_search.val().length < 2) {
        this.thing_list.empty();
        return this.previous_value = '';
      }
    };

    ThingSearch.prototype.do_search = function() {
      clearTimeout(this.input_timeout);
      this.input_timeout = null;
      this.previous_value = this.thing_search.val();
      $('.thing-search-form>div>span.glyphicon').remove();
      $('.thing-search-form>div').append($('<span class="glyphicon glyphicon-refresh"></span>'));
      return $.ajax({
        url: "/api/thing/suggest",
        data: {
          'fragment': this.thing_search.val()
        },
        dataType: 'json',
        success: this.render_suggestions.bind(this)
      });
    };

    ThingSearch.prototype.render_suggestions = function(suggestions) {
      var j, len, results, thing;
      $('.thing-search-form>div>span.glyphicon').remove();
      this.thing_list.empty();
      results = [];
      for (j = 0, len = suggestions.length; j < len; j++) {
        thing = suggestions[j];
        if (window.thing_manager.things[thing.id]) {
          continue;
        }
        results.push($("<li class='list-group-item thing-list-item' data-id='" + thing.id + "' data-name='" + thing.name + "' data-url='" + thing.url + "'> <a href='" + thing.url + "'>" + thing.name + "</a> <span class='glyphicon glyphicon-plus text-success'></span> </li>").appendTo(this.thing_list));
      }
      return results;
    };

    ThingSearch.prototype.add_tag = function() {};

    return ThingSearch;

  })();

  ThingManager = (function() {
    function ThingManager(information) {
      this.things = {};
      this.thing_tree = $('.thing-tree');
      this.templates = {
        'thing-tree-item': Hogan.compile("<li class='thing-tree-item'> <span class='glyphicon glyphicon-minus thing-remove'></span><span class='thing-tree-item-name'>{{name}}</span><span class='glyphicon glyphicon-plus thing-add'></span> <ul class='selection-tree'></ul> </li>"),
        'selection-tree-item': Hogan.compile("<li class='selection-tree-item'> <span class=''>{{text}}</span><span class='glyphicon glyphicon-minus selection-remove'></span> </li>")
      };
      if (information != null) {
        this.loadJSON(information);
      }
    }

    ThingManager.prototype.add_thing = function(data) {
      var element;
      if (!(data.id in this.things)) {
        this.things[data.id] = {
          'name': data.name,
          'url': data.url,
          'selections': []
        };
        element = $(this.templates['thing-tree-item'].render(data)).appendTo(this.thing_tree);
        this.things[data.id].element = element;
        element.children('.thing-add').on('click', (function(_this) {
          return function() {
            return _this.activate_selector.call(_this, data.id);
          };
        })(this));
        return element.children('.thing-remove').on('click', (function(_this) {
          return function() {
            return _this.remove_thing(data.id);
          };
        })(this));
      }
    };

    ThingManager.prototype.remove_thing = function(id) {
      if (id in this.things) {
        this.things[id].element.remove();
        return delete this.things[id];
      }
    };

    ThingManager.prototype.get_selection = function() {
      var anchor, focus, selection;
      selection = window.getSelection();
      anchor = $(selection.anchorNode);
      focus = $(selection.focusNode);
      if (!selection.isCollapsed && anchor.parent().is('#review-content') && anchor[0] === focus[0]) {
        return [Math.min(selection.anchorOffset, selection.focusOffset), Math.max(selection.anchorOffset, selection.focusOffset)];
      } else {
        return false;
      }
    };

    ThingManager.prototype.add_selection = function(thing, selection) {
      var beginning, element, end, i;
      if (selection === void 0) {
        selection = this.get_selection();
      }
      beginning = selection[0], end = selection[1];
      i = this.things[thing].selections.push({
        'beginning': beginning,
        'end': end
      }) - 1;
      element = $(this.templates['selection-tree-item'].render({
        'text': (end - beginning) + " character(s)"
      })).appendTo(this.things[thing].element.children('.selection-tree'));
      this.things[thing].selections[i].element = element;
      return element.on('mouseenter', (function(_this) {
        return function() {
          return _this.highlight_selection.call(_this, thing, i);
        };
      })(this)).on('mouseleave', function() {
        return window.getSelection().removeAllRanges();
      }).children('.selection-remove').on('click', (function(_this) {
        return function() {
          return _this.remove_selection.call(_this, thing, i);
        };
      })(this));
    };

    ThingManager.prototype.highlight_selection = function(thing, index) {
      var range, temp;
      temp = window.getSelection();
      range = document.createRange();
      range.setStart($('#review-content')[0].firstChild, this.things[thing].selections[index].beginning);
      range.setEnd($('#review-content')[0].firstChild, this.things[thing].selections[index].end);
      temp.removeAllRanges();
      return temp.addRange(range);
    };

    ThingManager.prototype.remove_selection = function(thing, index) {
      this.things[thing].selections[index].element.remove();
      this.things[thing].selections.splice(index, 1);
      return window.getSelection().removeAllRanges();
    };

    ThingManager.prototype.activate_selector = function(id) {
      return $('#review-content').on('mouseup', (function(_this) {
        return function() {
          $('#review-content').off('mouseup');
          return _this.add_selection(id);
        };
      })(this));
    };

    ThingManager.prototype.update_button = function() {
      return $('#submit');
    };

    ThingManager.prototype.toJSON = function() {
      var data, key, ref, value;
      data = [];
      ref = this.things;
      for (key in ref) {
        value = ref[key];
        data.push({
          'id': key,
          'selections': value.selections.map(function(selection) {
            return [selection.beginning, selection.end];
          })
        });
      }
      return JSON.stringify(data);
    };

    ThingManager.prototype.loadJSON = function(data) {
      var j, k, len, len1, ref, selection, thing;
      for (j = 0, len = data.length; j < len; j++) {
        thing = data[j];
        this.add_thing({
          'id': thing.id,
          'name': thing.name,
          'url': thing.url
        });
        ref = thing.selections;
        for (k = 0, len1 = ref.length; k < len1; k++) {
          selection = ref[k];
          this.add_selection(thing.id, selection);
        }
      }
      return this;
    };

    return ThingManager;

  })();

  $(document).ready(function() {
    window.thing_search = new ThingSearch;
    return window.thing_manager = new ThingManager(window.ENTRY_INFORMATION);
  });

}).call(this);
