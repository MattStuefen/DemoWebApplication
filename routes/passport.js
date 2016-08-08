var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');

var emailer = require('../utilities/emailer');
var usersDao = require('../utilities/usersDao');

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        usersDao.verifyUser(username, password, function (err, user) {
            done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    usersDao.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local'),
    function (req, res) {
        res.redirect('/');
    }
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/register', function (req, res) {
    usersDao.addUser(req.body.username, req.body.password, req.body.emailAddress, function (err, user) {
        if (err) {
            res.send("Unable to create user " + req.body.username + ".  " + err);
        } else {
            req.login(user, function (err) {
                return res.redirect('/');
            });
        }
    });
});

router.get('/unregister', function (req, res) {
    if (!req.user) {
        res.redirect('/');
        return;
    }

    var id = req.user.id;
    req.logout();

    usersDao.removeUser(id, function (err) {
        if (err) {
            res.send("An error has occurred: " + err);
        } else {
            res.redirect('/');
        }
    });
});

router.post('/forgotPassword', function (req, res) {
    var emailAddress = req.param('emailAddress');
    usersDao.generateResetToken(emailAddress, function (err, token) {
        if (err) return res.send(err);
        
        emailer.sendPasswordReset(emailAddress, token, function (err) {
            if (err) res.send(err);
            else res.send();
        });
    });
});

router.get('/changePassword', function (req, res) {
    res.render('changePassword', {token: req.param('token')});
});

router.post('/changePassword', function (req, res) {
    var token = req.param('token');
    usersDao.changePassword({'token': token, 'user': req.user, 'password': req.body.password}, function(err, user){
        if (err) return res.send(err);
        res.send(user)
    });
});

module.exports = router;
