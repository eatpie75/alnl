{% extends 'base.swig' %}

{% block post_scripts %}
    <script src="/post.js"></script>
    <script type="text/javascript">
      var ENTRY_ID={{entry.id}};
    </script>
{% endblock %}

{% block content %}
      <div class="row">
        <div class="col-md-12">
          <div class="entry">
            <h2>
              <a href='{{entry.get_url()}}'>{{entry.date|date("l F jS, Y")}}</a>
              <a href='{{entry.get_edit_url()}}'><span class="glyphicon glyphicon-pencil"></span></a>
              <a href='{{entry.get_review_url()}}'><span class="glyphicon glyphicon-search"></span></a>
            </h2>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="entry-content" data-parsed="false">{{entry.content}}</div>
        </div>
        <div class="col-md-6">
        </div>
      </div>
{%- endblock %}
