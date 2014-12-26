var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
    secret : process.env.SECRET || 'TFVtSsdIekQ7VwjCzgng'
};
