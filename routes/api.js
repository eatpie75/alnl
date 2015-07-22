var express = require('express');
var router = express.Router();

var db = require('../models');

router.post('/entry/:entry', function(req, res, next) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    entry.content = req.body.content;
    return entry.save();
  }).then(function(entry) {
    res.json({'redirect':entry.get_review_url()});
  });
});

router.post('/entry', function(req, res, next) {
  db.models.Entry.create({'date':new Date(), 'content':req.body.content}).then(function(entry) {
    res.json({'redirect':entry.get_review_url()});
  });
});

router.post('/review/:entry', function(req, res, next) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    var metadata = entry.get_metadata();
    metadata.information = JSON.parse(req.body.selections);
    entry.metadata = JSON.stringify(metadata);
    return entry.save();
  }).then(function() {
    res.json({});
  });
});

router.get('/thing_suggest', function(req, res, next) {
  var fragment = '%' + req.query.fragment + '%';
  db.models.Thing.findAll({'where':{'name':{'$like':fragment}}}).then(function(things) {
    res.json(things.map(function(thing) {
      return {
        'id': thing.id,
        'name': thing.name,
        'url': ''
      };
    }));
  });
});

module.exports = router;
