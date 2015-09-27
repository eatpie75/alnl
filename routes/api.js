var busboy = require('connect-busboy');
var fuzzy_selection_update = require('../utils/fuzzy_selection_update');
var get_gcloud = require('../utils/get_gcloud');
var path = require('path');
var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

var db = require('../models');

router.get('/entry/:entry/photos', function(req, res) {
  var query = {
    'where': {
      'EntryId': req.params.entry
    },
    'attributes': ['id', 'name']
  };
  db.models.Photo.findAll(query).then(function(photos) {
    res.json(photos);
  });
});

router.post('/entry/:entry/photos', busboy(), function(req, res) {
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
      gfile.makePublic(function() {
        var model = {
          'name': filename,
          'gid': metadata.name,
          'EntryId': req.params.entry
        };

        db.models.Photo.create(model).then(function(photo) {
          res.status(201).json({
            'id': photo.id,
            'name': photo.name
          });
        });
      });
    });
  });

  req.pipe(req.busboy);
});

router.delete('/entry/:entry/photos/:id', function(req, res) {
  var query = {
    'where': {
      'id': req.params.id,
      'EntryId': req.params.entry
    }
  };


  db.models.Photo.findOne(query).then(function(photo) {
    get_gcloud().bucket('alnl').file(photo.gid).delete(function(err) {
      if (err) { console.error(err); }
      photo.destroy().then(function() {
        res.json({'success': true});
      });
    });
  });
});

router.put('/entry/:entry', function(req, res) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    var new_content = req.body.content;
    entry.update_content(new_content);

    return entry.save();
  }).then(function(entry) {
    res.json({'redirect': entry.get_review_url()});
  });
});

router.post('/entry', function(req, res) {
  db.models.Entry.create({'date': new Date(), 'content': req.body.content}).then(function(entry) {
    res.json({'redirect': entry.get_review_url()});
  });
});


router.post('/review/:entry', function(req, res) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    var metadata = entry.get_metadata();
    metadata.information = JSON.parse(req.body.selections);
    entry.metadata = JSON.stringify(metadata);

    entry.setThings(metadata.information.map(function(thing) {return thing.id;}));

    entry.analyze_information();
    return entry.save();
  }).then(function() {
    res.json({});
  });
});

router.get('/thing_suggest', function(req, res) {
  var fragment = '%' + req.query.fragment + '%';
  db.models.Thing.findAll({'where': {'name': {'$like': fragment}}}).then(function(things) {
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
