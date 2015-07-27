var express = require('express');
var Promise = require('bluebird');
var router = express.Router();

var db = require('../models');

router.get('/', function(req, res) {
  var query = {
    'limit': 25,
    'include': [
      {
        'model': db.models.Photo,
        'attributes': ['id', 'name', 'gid']
      }
    ]
  };
  db.models.Entry.findAll(query).then(function(entries) {
    res.render('index', {entries: entries});
  });
});


router.get('/post', function(req, res) {
  res.render('post');
});

router.get('/post/:entry', function(req, res) {
  var query = {
    'attributes': ['id', 'content'],
    'include': [
      {
        'model': db.models.Photo,
        'attributes': ['id', 'name', 'gid']
      }
    ]
  };
  db.models.Entry.findById(req.params.entry, query).then(function(entry) {
    res.render('post', {entry: entry});
  });
});


router.get('/review/:entry', function(req, res) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    var metadata = entry.get_metadata();
    var queue = [];
    if (metadata.information) {
      metadata.information.forEach(function(thing) {
        queue.push(db.models.Thing.findById(thing.id));
      });
    }
    Promise.all(queue).then(function(results) {
      var information = results.map(function(thing_instance, i) {
        return {
          'id': thing_instance.id,
          'name': thing_instance.name,
          'url': '',
          'selections': (metadata.information[i].selections) ? metadata.information[i].selections.map(function(val) { return [val[0], val[1]]; }) : []
        };
       });
      res.render('review', {'entry': entry, 'information': information});
    });
  });
});


router.get('/thing/:name', function(req, res) {
  db.models.Thing.findOne({'where': {'name': req.params.name}}).then(function(thing) {
    res.redirect(thing.get_url());
  });
});
router.get('/thing/:id/:slug', function(req, res) {
  db.models.Thing.findById(req.params.id).then(function(thing) {
    db.models.Information.findAll({'where': {'ThingId': thing.id}}).then(function(information) {
      res.render('thing', {'thing': thing, 'information': information.map(function(d){ return d.get_data(); })});
    });
  });
});

router.get('/image/:id', function(req, res) {
  db.models.Photo.findById(req.params.id).then(function(photo) {
    res.redirect(photo.get_url());
  });
});

module.exports = router;
