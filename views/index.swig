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
            {%- if entry.Photos.length %}
            <div id="entry-photos-container" class="entry-photos-container carousel slide" data-interval="false">
              <ol class="carousel-indicators">
                {%- for photo in entry.Photos %}
                <li data-target="#enty-photos-container" data-slide-to="{{loop.index0}}"{% if loop.first %} class="active"{% endif %}></li>
                {%- endfor %}
              </ol>

              <!-- Wrapper for slides -->
              <div class="carousel-inner" role="listbox">
                {%- for photo in entry.Photos %}
                <div class="item{% if loop.first %} active{% endif %}">
                  <img src="/image/{{photo.id}}">
                </div>
                {%- endfor %}
              </div>

              <!-- Controls -->
              <a class="left carousel-control" href="#entry-photos-container" role="button" data-slide="prev">
                <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
              </a>
              <a class="right carousel-control" href="#entry-photos-container" role="button" data-slide="next">
                <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
              </a>
            </div>
            {%- endif %}
            <div class="entry-content" data-parsed="false">{{entry.content}}</div>
          </section>
          {%- endfor %}
        </div>
      </div>
{%- endblock %}
