/*
 * LiskHQ/lisk-explorer
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
/* eslint-disable import/no-extraneous-dependencies */
const node = {};

// Requires
node.async = require('async');
node.popsicle = require('popsicle');
node.expect = require('chai').expect;
node.chai = require('chai');
node.supertest = require('supertest');

node.chai.config.includeStack = true;

// Node configuration
node.baseUrl = 'http://localhost:6040';
node.api = node.supertest(node.baseUrl);

function abstractRequest(options, done) {
	const request = node.api[options.verb.toLowerCase()](options.path);

	request.set('Accept', 'application/json');
	request.expect('Content-Type', /json/);
	request.expect(200);

	if (options.params) {
		request.send(options.params);
	}


	if (done) {
		return request.end((err, res) => {
			done(err, res);
		});
	}
	return request;
}


// Get the given path
node.get = function (path, done) {
	return abstractRequest({ verb: 'GET', path, params: null }, done);
};

// Post to the given path
node.post = function (path, params, done) {
	return abstractRequest({ verb: 'POST', path, params }, done);
};

// Put to the given path
node.put = function (path, params, done) {
	return abstractRequest({ verb: 'PUT', path, params }, done);
};

// Exports
module.exports = node;
