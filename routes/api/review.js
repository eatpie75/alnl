var express = require('express');
var router = express.Router();

var db = require('../../models');

router.post('/:entry', function(req, res) {
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

module.exports = router;
