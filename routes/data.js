var express = require('express');
var args = require('../utilities/args');
var router = express.Router();

router.get('/data', function (req, res, next) {
    res.render('data', {title: 'Data', googleTrackingId: args.googleTrackingId});
});

module.exports = router;
