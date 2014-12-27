var _ = require('underscore');

// Load app configuration
if (!process.env.NODE_ENV){
    process.env.NODE_ENV = "development";
}

module.exports = _.extend(
    require(__dirname + '/../config/env/all.js'),
    require(__dirname + '/../config/env/' + process.env.NODE_ENV + '.json') || {});