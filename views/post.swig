{% extends 'base.swig' %}

{% block post_scripts %}
    <script src="/js/post.js"></script>
    <script type="text/javascript">
      {% if entry %}var ENTRY_ID={{entry.id}};{% endif %}
    </script>
{% endblock %}

{% block content %}
      <div class="row">
        <div class="col-md-6">
          <form role="form">
            <div class="form-group">
              <textarea id='post' class="col-md-12 form-control" rows="24">{%- if entry %}{{entry.content}}{% endif %}</textarea>
            </div>
          </form>
        </div>
        <div class="col-md-6">
          <div class="panel panel-default preview-container">
            <div id='preview' class="panel-body"></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 post-submit">
          <button type="button" class="btn btn-info center-block" id="submit">Submit</button>
        </div>
      </div>
{%- endblock %}