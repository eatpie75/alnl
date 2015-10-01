var express = require('express');
var router = express.Router();

var api = require('../../db/api');

router.get('/', function(req, res) {
  api.thing.all().then(res.json.bind(res));
});

router.get('/suggest/:fragment(\\w+)', function(req, res) {
  var fragment = '%' + req.params.fragment + '%';

  api.thing.get_by_fragment(fragment).then(function(things) {
    res.json(things.map(function(thing) {
      return thing.search_output();
    }));
  });
});

router.get('/:id(\\d+)|/:id(\\w+)', function(req, res) {
  api.thing.get(req.params.id).then(res.json.bind(res));
});

module.exports = router;
