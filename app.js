var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var api = require('./routes/api');

var app = express();

var debug = (app.get('env') !== 'production');

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

app.use('/api', api);

app.use('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/index.html'));
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
    error: (debug) ? err : {}
  });
});

module.exports = app;
