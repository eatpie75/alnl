var express = require('express');
var router = express.Router();

var api = require('../../models/api');

router.get('/', function(req, res) {
  api.information.all().then(res.json.bind(res));
});

var set_id = function(req, res, next) {
  res.locals.id = req.params.id;
  next();
};
var get_by_thing = function(req, res) {
  api.information.get_by_thing(res.locals.id).then(res.json.bind(res));
};
router.get('/thing/:id(\\w+)', set_id, get_by_thing);
router.get('/thing/:id(\\d+)', set_id, get_by_thing);


module.exports = router;
