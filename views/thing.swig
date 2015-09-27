{% extends 'base.swig' %}

{% block content %}
      <div class="row">
        <div class="col-md-3">
          <h2>{{thing.name}}</h2>
          <div class="thing-content" data-parsed="false">{{thing.content}}</div>
        </div>
        <div class="col-md-6">
          {%- for info in information %}
          <section class="info">
            <h4><a href="/{{info.date}}">{{info.date|date('l F jS, Y')}}</a></h4>
            <div class="info-content" data-parsed="false">{{info.content}}</div>
          </section>
          {%- endfor %}
        </div>
      </div>
{%- endblock %}
