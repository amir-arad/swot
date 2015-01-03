var User = require('../lib/user');
var logger = require('../config/logger');

exports.form = function (req, res) {
    res.render('login', { title: 'Login', message: req.flash('error') });
};

exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        if (err) throw err;
        logger.info("user logout success", req.user);
        res.redirect('/');
    });
};
