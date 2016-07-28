var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');

passport.use('local', new LocalStrategy(
    function(username, password, done) {

        if(username == password){
            done(null, username);
        } else {
            done(null, false);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(err, user);
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/?name=you',
        failureRedirect: '/?name=fail',
        failureFlash: false })
);

router.get('/logout', function(req, res){
    var name = req.user.username;
    req.logout();
    res.redirect('/');
    req.session.notice = "You have successfully been logged out " + name + "!";
});

module.exports = router;
