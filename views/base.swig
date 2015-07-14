<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    {# <link rel="shortcut icon" href="/img/favicon.ico"> #}
    {# <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/img/favicon-152.png"> #}
    <title>{% block title %}ALNL{% endblock %}</title>
    {%- block resources %}
    <!--[if lt IE 9]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    {%- block css %}
    {%- if debug %}
    <link href="/less/bootstrap/bootstrap.less" rel="stylesheet/less" type="text/css">
    <link href="/less/main.less" rel="stylesheet/less" type="text/css">
    <script src="/js/less.min.js"></script>
    {%- else %}
    <link href="/css/bootstrap.css" rel="stylesheet" type="text/css">
    <link href="/css/main.css" rel="stylesheet" type="text/css">
    {%- endif %}
    {%- block extra_css %}{% endblock %}
    {%- endblock %}
    {%- block scripts %}
    {%- block pre_scripts %}{% endblock %}
    <script src="/js/jquery.min.js"></script>
    <script src="/js/bootstrap.min.js"></script>
    <script src="/js/markdown-it.min.js"></script>
    <script src="/js/markdown-it-thingtag.js"></script>
    <script src="/js/core.js"></script>
    <script type="text/javascript">
      var AJAX_BASE="{{AJAX_BASE}}";
      var md=markdownit('commonmark', {'typographer':true});
      md.use(window.markdownitHashtag);
    </script>
    {%- block post_scripts %}{% endblock %}
    {%- endblock %}
    {%- endblock %}
  </head>
  <body>
    {%- block body %}
    <div class='container'>
      {%- block content %}{% endblock %}
    </div>
    {%- endblock %}
  </body>
</html>
