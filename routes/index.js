var _ = require('underscore');
var busboy = require('connect-busboy');
var express = require('express');
var path = require('path');
var Promise = require('bluebird');
var router = express.Router();
var uuid = require('node-uuid');

var db = require('../models');

router.get('/', function(req, res, next) {
  db.models.Entry.findAll({'limit':25}).then(function(entries) {
    res.render('index', _.extend(req.app.locals.render_data, {entries:entries}));
  });
});

router.get('/post', function(req, res, next) {
  res.render('post');
});

router.get('/post/:entry', function(req, res, next) {
  db.models.Entry.findById(req.params.entry).then(function(entry) {
    res.render('post', _.extend(req.app.locals.render_data, {entry:entry}));
  });
});

router.get('/review/:entry', function(req, res, next) {
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
          'selections': (metadata.information[i].selections) ? metadata.information[i].selections.map(function(val) {return [val[0], val[1]];}) : []
        };
       });
      res.render('review', _.extend(req.app.locals.render_data, {'entry':entry, 'information':information}));
    });
  });
});


router.get('/thing/:name', function(req, res, next) {
  db.models.Thing.findOne({'where':{'name':req.params.name}}).then(function(thing) {
    res.redirect(thing.get_url());
  });
});
router.get('/thing/:id/:slug', function(req, res, next) {
  db.models.Thing.findById(req.params.id).then(function(thing) {
    db.models.Information.findAll({'where':{'ThingId':thing.id}}).then(function(information) {
      res.render('thing', _.extend(req.app.locals.render_data, {'thing':thing, 'information':information.map(function(d){return d.get_data();})}));      
    });
  });
});

router.get('/image/:id', function(req, res) {
  db.models.Photo.findById(req.params.id).then(function(photo) {
    res.redirect(photo.get_url());
  });
});

router.use('/upload/:entry?', busboy());
router.post('/upload/:entry?', function(req, res) {
  if (!req.busboy) {
    res.status(400).send();
    return;
  }

  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var gcloud = require('gcloud').storage({
      'projectId': 'alnl-1015',
      'credentials': {
        'client_email': process.env.GCLOUD_CLIENT_EMAIL,
        'private_key': process.env.GCLOUD_PRIVATE_KEY
      }
    });

    var ext=path.extname(filename), name = filename.replace(ext, '');
    var gfile = gcloud.bucket('alnl').file(name + '__' + uuid.v4() + ext);

    var gf_pipe = file.pipe(gfile.createWriteStream());
    gf_pipe.on('complete', function(metadata) {
      gfile.makePublic();

      var model = {
        'name': filename,
        'gid': metadata.name
      };
      if (req.params.entry !== undefined) model.EntryId = req.params.entry;

      db.models.Photo.create(models).then(function() {
        res.status(201).send();
      });
    });
  });

  req.pipe(req.busboy);
});

module.exports = router;
