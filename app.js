var express = require('express');
var swig = require('swig');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var api = require('./routes/api');

var app = express();

var debug = (app.get('env') !== 'production');

app.engine('swig', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'swig');
swig.setDefaults({
  'locals': {
    'debug': debug,
    'title': 'ALNL'
  },
  'cache': debug ? false : 'memory'
});

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if (debug) {
  app.use('/lib', express.static(path.join(__dirname, 'lib')));
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  app.use(express.static(process.env.STATIC_PATH || path.join(__dirname, 'public', 'dist')));
}

app.use('/', routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
