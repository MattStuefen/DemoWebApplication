var express = require('express');
var router = express.Router();
var url = require("url");

/* GET home page. */
router.get('/', function(req, res, next) {
    var parameters = url.parse(req.url, true).query;
    res.render('index', { name: parameters.name });
});

module.exports = router;
