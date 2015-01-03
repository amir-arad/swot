/**
 * Authentication/serialization methods for Passport, which handles authentication.
 * http://passportjs.org/
 *
 */

var User = require('../user');
var config = require('../../config/config');
var logger = require('../../config/logger');
/**
 * Verify callback for passport
 * http://passportjs.org/guide/configure/
 */
exports.authenticate = function(email, password, done) {
    email = config.usersPasswords[password];
    if (email) {
        User.findByEmail(email, function (err, user) {
            if (err) {
                logger.info("user login failed", err);
                return done(err);
            } else if (user) {
                logger.info("user login success", user.email);
                return done(null, user);
            } else {
                logger.info('First login, creating user', email);
                User.createUser(new User({
                    email: email,
                    password: password
                })).done(function (user) {
                    logger.info("user login success", user.email);
                    return done(null, user);
                }, function (err) {
                    logger.info("user create failed", err);
                    return done(err, false, { message: config.messages.badLogin });
                });
            }
        });
    } else {
        logger.info("user login failed. password: ", password);
        return done(null, false, { message: config.messages.badLogin });
    }
};

exports.serializeUser = function(user, done) {
    done(null, user.email);
};

exports.deserializeUser = function(email, done) {
    User.findByEmail(email, function(err, user) {
        done(err, user);
    });
};
