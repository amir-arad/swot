/**
 * Authentication/serialization methods for Passport, which handles authentication.
 * http://passportjs.org/
 *
 */

var User = require('../user');
var config = require('../../config/config');

/**
 * Verify callback for passport
 * http://passportjs.org/guide/configure/
 */
exports.authenticate = function(email, password, done) {
    email = config.usersPasswords[password];
    User.findByEmail(email, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            user.checkPassword(password, function (err, match) {
                if (err) return done(err);
                if (match) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: config.messages.badLogin });
                }
            });
        } else {
            console.log('First login, creating user ' + email);
            User.createUser(new User({
                email: email,
                password: password
            })).done(function (user) {
                // TODO import quizzes
                return done(null, user);
            }, function (err) {
                return done(err, false, { message: config.messages.badLogin });
            });
        }
    });
};

exports.serializeUser = function(user, done) {
    done(null, user.email);
};

exports.deserializeUser = function(email, done) {
    User.findByEmail(email, function(err, user) {
        done(err, user);
    });
};
