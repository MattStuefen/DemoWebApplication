var express = require('express');
var router = express.Router();

router.get('/data', function (req, res, next) {
    res.render('data', {title: 'Data'});
});

module.exports = router;
