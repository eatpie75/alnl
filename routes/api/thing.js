var express = require('express');
var router = express.Router();

var db = require('../../models');
var api = require('../../models/api');

router.get('/', function(req, res) {
  api.thing.all().then(res.json.bind(res));
});

router.get('/:id(\\d+)|/:id(\\w+)', function(req, res) {
  api.thing.get(req.params.id).then(res.json.bind(res));
});

router.get('/suggest', function(req, res) {
  var fragment = '%' + req.query.fragment + '%';
  db.models.Thing.findAll({'where': {'name': {'$like': fragment}}}).then(function(things) {
    res.json(things.map(function(thing) {
      return thing.search_output();
    }));
  });
});

router.get('/search', function(req, res) {
  var names = req.query.names;

  db.models.Thing.findAll({'where': {'name': {'$in': names}}}).then(function(things) {
    res.json(things.map(function(thing) {
      return thing.search_output();
    }));
  });
});

module.exports = router;
