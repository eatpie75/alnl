var busboy = require('connect-busboy');
var fuzzy_selection_update = require('../utils/fuzzy_selection_update');
var get_gcloud = require('../utils/get_gcloud');
var path = require('path');
var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

var db = require('../models');

router.post('/entry/:entry', function(req, res, next) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    var new_content = req.body.content;

    var metadata = entry.get_metadata();
    if ('information' in metadata) {
      metadata.information = fuzzy_selection_update(entry.content, new_content, metadata.information);
      entry.metadata = JSON.stringify(metadata);
    }

    entry.content = new_content;
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

router.use('/upload/:entry', busboy());
router.post('/upload/:entry', function(req, res) {
  if (!req.busboy) {
    res.status(400).send();
    return;
  }

  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var gcloud = get_gcloud();

    var ext = path.extname(filename), name = filename.replace(ext, '');
    var gfile = gcloud.bucket('alnl').file(name + '__' + uuid.v4() + ext);

    var gf_pipe = file.pipe(gfile.createWriteStream());
    gf_pipe.on('complete', function(metadata) {
      gfile.makePublic();

      var model = {
        'name': filename,
        'gid': metadata.name,
        'EntryId': req.params.entry
      };

      db.models.Photo.create(model).then(function() {
        res.status(201).send();
      });
    });
  });

  req.pipe(req.busboy);
});

module.exports = router;
