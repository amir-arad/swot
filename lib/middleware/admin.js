var config = require('../../config/config');

module.exports = function (req, res, next) {
    res.locals.admin = config.allowAdmin;
    next();
};
