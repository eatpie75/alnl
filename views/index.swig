{% extends 'base.swig' %}

{% block content %}
      <div class="row">
        <div class="col-md-6 col-md-offset-3">
          {%- for entry in entries %}
          <section class="entry">
            <h2>
              <a href='{{entry.get_url()}}'>{{entry.date|date("l F jS, Y")}}</a>
              <a href='{{entry.get_edit_url()}}'><span class="glyphicon glyphicon-pencil"></span></a>
              <a href='{{entry.get_review_url()}}'><span class="glyphicon glyphicon-search"></span></a>
            </h2>
            <div class="entry-content" data-parsed="false">{{entry.content}}</div>
          </section>
          {%- endfor %}
        </div>
      </div>
{%- endblock %}
