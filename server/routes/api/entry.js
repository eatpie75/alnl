var _ = require('lodash');
var express = require('express');

var api = require('../../models/api');

var base_router = express.Router();
var entry_router = express.Router();

base_router.get('/', function(req, res) {
  api.entry.get_last_25().then(res.json.bind(res));
});

base_router.post('/', function(req, res) {
  api.entry.create({'content': req.body.content}).then(res.json.bind(res));
});

var set_id = function(req, res, next) {
  res.locals.id = req.params.id;
  next();
};

base_router.use('/:id(\\d{4}-\\d{2}-\\d{2})', set_id, entry_router);
base_router.use('/:id(\\d+)', set_id, entry_router);

entry_router.get('/', function(req, res) {
  api.entry.get_by_id(res.locals.id).then(function(entry) {
    res.json(_.extend(entry, {'metadata': entry.get_metadata()}));
  });
});

entry_router.put('/', function(req, res) {
  api.entry.update(res.locals.id, _.pick(req.body, 'content')).then(res.json.bind(res));
});

entry_router.post('/review', function(req, res) {
  api.entry.get_by_id(res.locals.id).then(function(entry) {
    var metadata = entry.get_metadata();
    metadata.information = req.body;
    entry.metadata = JSON.stringify(metadata);

    entry.setThings(metadata.information.map(function(thing) {return thing.id;}));

    entry.analyze_information();
    return entry.save();
  }).then(function() {
    res.json({});
  });
});

entry_router.get('/photos', function(req, res) {
  api.entry.photos(res.locals.id).then(function(photos) {
    res.json(photos);
  });
});

// entry_router.post('/photos', busboy(), function(req, res) {
//   if (!req.busboy) {
//     res.status(400).send();
//     return;
//   }

//   req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//     var gcloud = get_gcloud();

//     var ext = path.extname(filename), name = filename.replace(ext, '');
//     var gfile = gcloud.bucket('alnl').file(name + '__' + uuid.v4() + ext);

//     var gf_pipe = file.pipe(gfile.createWriteStream());
//     gf_pipe.on('complete', function(metadata) {
//       gfile.makePublic(function() {
//         var model = {
//           'name': filename,
//           'gid': metadata.name,
//           'EntryId': req.locals.id
//         };

//         db.models.Photo.create(model).then(function(photo) {
//           res.status(201).json({
//             'id': photo.id,
//             'name': photo.name
//           });
//         });
//       });
//     });
//   });

//   req.pipe(req.busboy);
// });

// entry_router.delete('/photos/:id', function(req, res) {
//   var query = {
//     'where': {
//       'id': req.params.id,
//       'EntryId': req.params.entry
//     }
//   };


//   db.models.Photo.findOne(query).then(function(photo) {
//     get_gcloud().bucket('alnl').file(photo.gid).delete(function(err) {
//       if (err) { console.error(err); }
//       photo.destroy().then(function() {
//         res.json({'success': true});
//       });
//     });
//   });
// });

module.exports = base_router;
