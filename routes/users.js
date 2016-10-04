var express = require('express');
var args = require('../utilities/args');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');

var emailer = require('../utilities/emailer');
var usersDao = require('../utilities/usersDao');
var errors = require('../utilities/errorDefinitions');

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
    usersDao.addUser(req.body.username, req.body.password, req.body.emailAddress, req.user, function (err, user) {
        if (err) return res.status(401).send(err);
        if(!req.user){
            // Login if account wasn't created by admin
            req.login(user, function (err) {
                if (err) return res.status(401).send(err);
                res.send('');
            });
        } else {
            res.send('');
        }
    });
});

router.post('/unregister', function (req, res) {
    if (!req.user) {
        return res.status(401).send(errors.unauthorized);
    }

    var id = (req.body.id) ? req.body.id : req.user.id;
    if (!req.body.id) req.logout();

    usersDao.removeUser(id, function (err) {
        if (err) return res.status(401).send("An error has occurred: " + err);
        res.send('');
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
        if (err) return res.status(500).send(err);
        res.send(user)
    });
});

router.get('/account', function (req, res, next) {
    var token = req.param('token');

    if(!token && !req.user){
        return next(errors.unauthorized);
    }

    res.render('./user/account', {title: 'Account', token: req.param('token'), googleTrackingId: args.googleTrackingId});
});

router.get('/users', function (req, res, next) {
    if(!usersDao.isAdmin(req.user)){
        return next(errors.unauthorized);
    }

    usersDao.getUserList(req.user, function (err, users) {
        res.render('./user/users', {title: 'Users', usersList: users, googleTrackingId: args.googleTrackingId});
    });
});

router.post('/editAccount', function (req, res) {
    if(!usersDao.isAdmin(req.user)){
        return next(errors.unauthorized);
    }

    var token = req.param('token');
    usersDao.editUser(req.body, function (err) {
        if (err) return res.status(500).send(err);
        res.send('')
    });
});

module.exports = router;
