var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {name: (req.user != null) ? req.user.username : "Stranger"});
});

module.exports = router;
