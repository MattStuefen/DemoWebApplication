var express = require('express');
var router = express.Router();
var usersDao = require('../utilities/usersDao');

/* GET users listing. */
router.get('/', function (req, res, next) {
    usersDao.getUserList(function (err, users) {
        res.send(users);
    });
});

module.exports = router;
