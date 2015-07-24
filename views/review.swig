{% extends 'base.swig' %}

{% block post_scripts %}
    <script src="/review.js"></script>
    <script type="text/javascript">
      // var CSRF_TOKEN="{{csrf_token}}";
      var ENTRY_ID={{entry.id}};
      {%- if information %}
      var ENTRY_INFORMATION=JSON.parse("{{information|json|addslashes|safe}}");
      {%- endif %}
    </script>
{% endblock %}

{% block content %}
      <div class="row">
        <div class="col-md-12 review-header">
          <button type="button" class="btn btn-default" id="submit">Submit</button>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3 thing-search-container">
          <form class="thing-search-form form-inline">
            <div class="form-group">
              <input id="thing-search" class="form-control" type="text" placeholder="Search for things" autocomplete="off" minlength=3 maxlength=255>
            </div>
          </form>
          <ul class="list-group thing-list"></ul>
        </div>
        <div class="col-md-6">
          <pre class="review-content" id="review-content">{{entry.content}}</pre>
        </div>
        <div class="col-md-3 thing-tree-container">
          <ul class="thing-tree">
          </ul>
        </div>
      </div>
{%- endblock %}
