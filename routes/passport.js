var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
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
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: false
    })
);

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/register', function (req, res) {
    usersDao.addUser(req.body.username, req.body.password, function (err, user) {
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
            res.redirect('/')
        }
    });
});

module.exports = router;
