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
const node = require('./../node.js');

describe('Newsfeed API', () => {
	function checkNewsfeed(obj) {
		node.expect(obj).to.have.all.keys(
			'source',
			'sourceId',
			'timestamp',
			'content',
			'url');
	}

	const checkNewsfeedResponse = (obj) => {
		for (let i = 0; i < obj.length; i++) {
			checkNewsfeed(obj[i]);
		}
	};

	/* Define api endpoints to test */
	describe.skip('GET /api/newsFeed', () => {
		it('using no source should be ok', (done) => {
			node.get('/api/newsFeed', (err, res) => {
				node.expect(res.body).to.be.an('array');
				node.expect(res.body.length).to.be.equal(20);
				checkNewsfeedResponse(res.body);
				done();
			});
		});

		it('using twitter source should be ok', (done) => {
			node.get('/api/newsFeed?source=twitter', (err, res) => {
				node.expect(res.body).to.be.an('array');
				node.expect(res.body.length).to.be.equal(20);
				checkNewsfeedResponse(res.body);
				done();
			});
		});

		it('using all source should be ok', (done) => {
			node.get('/api/newsFeed?source=all', (err, res) => {
				node.expect(res.body).to.be.an('array');
				node.expect(res.body.length).to.be.equal(20);
				checkNewsfeedResponse(res.body);
				done();
			});
		});

		it('using no source and 10 limit should be ok', (done) => {
			node.get('/api/newsFeed?limit=10', (err, res) => {
				node.expect(res.body).to.be.an('array');
				node.expect(res.body.length).to.be.equal(10);
				checkNewsfeedResponse(res.body);
				done();
			});
		});
	});
});
