var express = require('express');
var router = express.Router();

router.use('/entry', require('./entry'));
router.use('/review', require('./review'));
router.use('/thing', require('./thing'));
router.use('/information', require('./information'));

module.exports = router;
