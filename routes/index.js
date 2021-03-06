var express = require('express');
var args = require('../utilities/args');
var router = express.Router();

router.get('/', function (req, res, next) {
    // Note: Need to define googleApiKey in input args for the map to work
    res.render('index', {title: 'Demo Application', googleApiKey: args.googleApiKey, googleTrackingId: args.googleTrackingId});
});

module.exports = router;
