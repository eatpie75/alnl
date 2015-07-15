{% extends 'base.swig' %}

{% block content %}
      <div class="row">
        <div class="col-md-3">
          <h2>{{thing.name}}</h2>
        </div>
        <div class="col-md-6">
          {%- for info in information %}
          <section class='info'>
            <h4><a href=''>{{info.date}}</a></h4>
            <div class='info-content' data-parsed="false">{{info.content}}</div>
          </section>
          {%- endfor %}
        </div>
      </div>
{%- endblock %}
