var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var DEBUG = (app.get('env') !== 'production');
var BASE_DIR = path.join(__dirname, '..');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if (DEBUG) {
  app.use('/lib', express.static(path.join(BASE_DIR, 'lib')));
  app.use(express.static(path.join(BASE_DIR, 'public')));
} else {
  app.use(express.static(process.env.STATIC_PATH || path.join(BASE_DIR, 'public', 'dist')));
}

app.use('/api', require('./routes/api'));

app.use('/', function(req, res) {
  res.sendFile(path.join(BASE_DIR, 'client/index.html'));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (DEBUG) ? err : {}
  });
});

module.exports = app;
