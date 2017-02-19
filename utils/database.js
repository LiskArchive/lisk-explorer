'use strict';

var pgp = require('pg-promise')();

module.exports = function (config) {
	var db = pgp(config);
	return db;
};
