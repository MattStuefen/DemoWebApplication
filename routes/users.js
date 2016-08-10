var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');

var emailer = require('../utilities/emailer');
var usersDao = require('../utilities/usersDao');

passport.use('local', new LocalStrategy(usersDao.verifyUser));
passport.deserializeUser(usersDao.getUserById);
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

router.post('/login',
    passport.authenticate('local'),
    function (req, res) {
        res.send('');
    }
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/register', function (req, res) {
    usersDao.addUser(req.body.username, req.body.password, req.body.emailAddress, function (err, user) {
        if (err) return res.status(401).send(err);
        req.login(user, function (err) {
            if (err) return res.status(401).send(err);
            return res.redirect('/');
        });
    });
});

router.post('/unregister', function (req, res) {
    if (!req.user) {
        res.redirect('/');
        return;
    }

    var id = req.user.id;
    req.logout();

    usersDao.removeUser(id, function (err) {
        if (err) return res.status(401).send("An error has occurred: " + err);
        res.redirect('/');
    });
});

router.post('/forgotPassword', function (req, res) {
    var emailAddress = req.param('emailAddress');
    usersDao.generateResetToken(emailAddress, function (err, token) {
        if (err) return res.status(401).send(err);

        emailer.sendPasswordReset(emailAddress, token, function (err) {
            if (err) return res.status(500).send(err);
            res.send();
        });
    });
});

router.post('/changePassword', function (req, res) {
    var token = req.param('token');
    usersDao.changePassword({'token': token, 'user': req.user, 'password': req.body.password}, function (err, user) {
        if (err) return res.status(401).send(err);
        res.send(user)
    });
});

router.get('/account', function (req, res, next) {
    var token = req.param('token');

    if(!token && !req.user){
        var err = new Error('Unauthorized', 401);
        err.status = 401;
        return next(err);
    }

    res.render('./user/account', {token: req.param('token')});
});

router.get('/users', function (req, res, next) {
    // GET users listing.
    usersDao.getUserList(function (err, users) {
        res.send(users);
    });
});

module.exports = router;
